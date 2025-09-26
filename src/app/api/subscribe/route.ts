import { SubscriberStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { buildDoubleOptInEmail } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";

const bodySchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: "Le consentement est requis.",
    }),
});

type ResendError = { message?: string; statusCode?: number } | null | undefined;

const isDuplicateContactError = (error: ResendError) => {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("contact already exists");
};

const isContactWriteRestrictedError = (error: ResendError) => {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("restricted to only send emails") ||
    message.includes("api key is restricted") ||
    error.statusCode === 401
  );
};

const getBaseUrl = (request: NextRequest) => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const { origin } = request.nextUrl;
  return origin;
};

export async function POST(request: NextRequest) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return NextResponse.json(
      { error: "RESEND_AUDIENCE_ID n'est pas configuré." },
      { status: 500 }
    );
  }

  const resendFrom =
    process.env.RESEND_FROM_EMAIL ?? "LMF Solutions <noreply@lmfsolutions.fr>";

  let parsedBody;
  try {
    const json = await request.json();
    parsedBody = bodySchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Requête invalide." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Impossible de lire la requête." },
      { status: 400 }
    );
  }

  const email = parsedBody.email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({
    where: { email },
  });

  if (existing?.status === SubscriberStatus.CONFIRMED) {
    return NextResponse.json(
      {
        error:
          "Cette adresse e-mail est déjà confirmée. Merci pour votre intérêt !",
      },
      { status: 409 }
    );
  }

  const token = crypto.randomUUID();

  const subscriber = existing
    ? await prisma.subscriber.update({
        where: { email },
        data: {
          consent: true,
          status: SubscriberStatus.PENDING,
          confirmationToken: token,
          lastEventType: null,
        },
      })
    : await prisma.subscriber.create({
        data: {
          email,
          consent: true,
          status: SubscriberStatus.PENDING,
          confirmationToken: token,
        },
      });

  const resend = getResendClient();
  let contactId = subscriber.resendContactId ?? undefined;

  if (!contactId) {
    const contactResponse = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });

    if (
      contactResponse.error &&
      !isDuplicateContactError(contactResponse.error) &&
      !isContactWriteRestrictedError(contactResponse.error)
    ) {
      return NextResponse.json(
        {
          error:
            contactResponse.error.message ??
            "Impossible d'enregistrer l'adresse auprès de Resend.",
        },
        { status: 502 }
      );
    }

    contactId = contactResponse.data?.id ?? contactId;

    if (contactId && !subscriber.resendContactId) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { resendContactId: contactId },
      });
    }
  }

  const baseUrl = getBaseUrl(request);
  const confirmUrl = new URL("/api/subscribe/confirm", baseUrl);
  confirmUrl.searchParams.set("token", token);

  const emailContent = buildDoubleOptInEmail({ confirmUrl: confirmUrl.toString() });

  const emailResponse = await resend.emails.send({
    from: resendFrom,
    to: email,
    subject: "Confirmez votre inscription à LMF Solutions",
    html: emailContent.html,
    text: emailContent.text,
  });

  if (emailResponse.error) {
    return NextResponse.json(
      {
        error:
          emailResponse.error.message ??
          "Échec de l'envoi de l'e-mail de confirmation.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Merci ! Vérifiez votre boîte mail et cliquez sur le lien de confirmation pour finaliser votre inscription.",
  });
}
