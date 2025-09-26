import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM_EMAIL = "LMF Solutions <noreply@lmfsolutions.fr>";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const htmlEscape = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });

type ResendError = { message?: string } | null | undefined;

const isDuplicateContactError = (error: ResendError) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const message = "message" in error ? String(error.message ?? "") : "";
  return message.toLowerCase().includes("contact already exists");
};

const isContactWriteRestrictedError = (error: ResendError) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const message = ("message" in error ? String(error.message ?? "") : "").toLowerCase();
  const statusCode = "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : undefined;
  return (
    message.includes("restricted to only send emails") ||
    message.includes("api key is restricted") ||
    statusCode === 401
  );
};

export async function POST(request: Request) {
  const { RESEND_API_KEY, RESEND_AUDIENCE_ID, RESEND_NOTIFICATION_EMAIL } = process.env;

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Configuration Resend manquante (RESEND_API_KEY)." },
      { status: 500 }
    );
  }

  if (!RESEND_AUDIENCE_ID) {
    return NextResponse.json(
      { error: "Identifiant d'audience manquant (RESEND_AUDIENCE_ID)." },
      { status: 500 }
    );
  }

  let payload: { email?: unknown };
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }

  const escapedEmail = htmlEscape(email);

  const resend = new Resend(RESEND_API_KEY);

  try {
    const contactResponse = await resend.contacts.create({
      audienceId: RESEND_AUDIENCE_ID,
      email,
      unsubscribed: false,
    });

    if (
      contactResponse.error &&
      !isDuplicateContactError(contactResponse.error) &&
      !isContactWriteRestrictedError(contactResponse.error)
    ) {
      throw new Error(contactResponse.error.message ?? "Erreur lors de l'ajout du contact.");
    }

    const visitorEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Merci pour votre inscription à LMF Solutions",
      html: `<!DOCTYPE html>
        <html lang="fr">
          <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
              <tr>
                <td style="padding: 24px; text-align: center; background-color: #0f172a; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 20px;">LMF Solutions</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px;">
                  <h2 style="margin-top: 0; font-size: 18px;">Merci pour votre inscription ✨</h2>
                  <p style="font-size: 15px; line-height: 1.6;">
                    Bonjour,<br /><br />
                    Nous sommes ravis de vous compter parmi nos abonnés. Vous serez les premiers informés du lancement de notre nouveau service.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6;">
                    En attendant, suivez nos actualités sur <a href="https://lmfsolutions.fr" style="color: #0f172a; font-weight: 600;">lmfsolutions.fr</a>.
                  </p>
                  <p style="font-size: 13px; color: #475569;">À très vite,<br />L'équipe LMF Solutions</p>
                </td>
              </tr>
            </table>
          </body>
        </html>`,
      text: `Merci pour votre inscription !\n\nNous sommes ravis de vous compter parmi nos abonnés. Restez connectés pour découvrir nos actualités.\n\nÀ très vite,\nL'équipe LMF Solutions`,
    });

    if (visitorEmail.error) {
      throw new Error(visitorEmail.error.message ?? "Erreur lors de l'envoi de l'email visiteur.");
    }

    if (RESEND_NOTIFICATION_EMAIL) {
      const ownerEmail = await resend.emails.send({
        from: FROM_EMAIL,
        to: RESEND_NOTIFICATION_EMAIL,
        subject: "Nouvelle inscription à la newsletter",
        html: `<!DOCTYPE html>
          <html lang="fr">
            <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; background-color: #0f172a; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 20px;">Nouvelle inscription</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px;">
                    <p style="font-size: 15px; line-height: 1.6;">Un utilisateur vient de s'inscrire à la newsletter.</p>
                    <p style="font-size: 15px; line-height: 1.6;"><strong>Email :</strong> ${escapedEmail}</p>
                    <p style="font-size: 13px; color: #475569;">Email envoyé automatiquement depuis le site coming soon.</p>
                  </td>
                </tr>
              </table>
            </body>
          </html>`,
        text: `Nouvelle inscription à la newsletter\nEmail : ${email}`,
      });

      if (ownerEmail.error) {
        throw new Error(ownerEmail.error.message ?? "Erreur lors de l'envoi de l'email interne.");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'inscription pour le moment." },
      { status: 500 }
    );
  }
}
