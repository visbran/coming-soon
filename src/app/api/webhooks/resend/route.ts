import type { Prisma } from "@prisma/client";
import { SubscriberStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

import { prisma } from "@/lib/prisma";

const extractEmail = (event: Record<string, unknown>) => {
  const data = event["data"] as Record<string, unknown> | undefined;
  if (!data) return undefined;

  const directEmail = data["email"];
  if (typeof directEmail === "string") {
    return directEmail.toLowerCase();
  }

  const to = data["to"] as Array<Record<string, unknown>> | undefined;
  const firstRecipient = to?.[0]?.["email"];
  if (typeof firstRecipient === "string") {
    return firstRecipient.toLowerCase();
  }

  const contact = data["contact"] as Record<string, unknown> | undefined;
  const contactEmail = contact?.["email"];
  if (typeof contactEmail === "string") {
    return contactEmail.toLowerCase();
  }

  return undefined;
};

const safeUpdateSubscriber = async (
  email: string,
  data: Prisma.SubscriberUpdateInput
) => {
  try {
    await prisma.subscriber.update({
      where: { email },
      data,
    });
  } catch (error) {
    console.error("Unable to update subscriber from webhook", error);
  }
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "RESEND_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const headerList = headers();

  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers." }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;
  } catch (error) {
    console.error("Webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const type = (event["type"] as string | undefined) ?? "unknown";
  const email = extractEmail(event);

  const data = event["data"] as Record<string, unknown> | undefined;
  const contactId = (data?.["id"] ?? data?.["contactId"]) as string | undefined;

  if (type === "contact.created" && email) {
    await safeUpdateSubscriber(email, {
      resendContactId: contactId ?? undefined,
      lastEventType: type,
    });
  }

  if (email) {
    switch (type) {
      case "email.delivered":
      case "email.opened":
      case "email.clicked": {
        await safeUpdateSubscriber(email, { lastEventType: type });
        break;
      }
      case "email.bounced": {
        await safeUpdateSubscriber(email, {
          status: SubscriberStatus.BOUNCED,
          lastEventType: type,
        });
        break;
      }
      case "email.unsubscribed":
      case "contact.unsubscribed": {
        await safeUpdateSubscriber(email, {
          status: SubscriberStatus.UNSUBSCRIBED,
          lastEventType: type,
        });
        break;
      }
      case "contact.updated": {
        await safeUpdateSubscriber(email, {
          resendContactId: contactId ?? undefined,
          lastEventType: type,
        });
        break;
      }
      default: {
        if (type.startsWith("contact") || type.startsWith("email")) {
          await safeUpdateSubscriber(email, { lastEventType: type });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
