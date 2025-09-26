import { SubscriberStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";

const getBaseUrl = (request: NextRequest) => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return request.nextUrl.origin;
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    const target = new URL("/merci?status=invalid-token", getBaseUrl(request));
    return NextResponse.redirect(target);
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { confirmationToken: token },
  });

  if (!subscriber) {
    const target = new URL("/merci?status=invalid-token", getBaseUrl(request));
    return NextResponse.redirect(target);
  }

  if (subscriber.status === SubscriberStatus.CONFIRMED) {
    const target = new URL("/merci?status=already-confirmed", getBaseUrl(request));
    return NextResponse.redirect(target);
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: SubscriberStatus.CONFIRMED,
      confirmationToken: null,
      confirmedAt: new Date(),
    },
  });

  if (subscriber.resendContactId) {
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      console.warn("RESEND_AUDIENCE_ID is missing; skipping contact update.");
    }

    try {
      if (audienceId) {
        const resend = getResendClient();
        await resend.contacts.update({
          id: subscriber.resendContactId,
          audienceId,
          unsubscribed: false,
        });
      }
    } catch (error) {
      console.error("Resend contact update failed", error);
    }
  }

  const target = new URL("/merci?status=confirmed", getBaseUrl(request));
  return NextResponse.redirect(target);
}
