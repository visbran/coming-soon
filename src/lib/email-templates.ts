const brandName = "LMF Solutions";

export const buildDoubleOptInEmail = ({
  confirmUrl,
}: {
  confirmUrl: string;
}) => {
  const html = `<!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>Confirmez votre inscription</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.08);">
        <tr>
          <td style="padding:24px;text-align:center;background-color:#0f172a;color:#ffffff;">
            <h1 style="margin:0;font-size:20px;">${brandName}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="margin-top:0;font-size:18px;">Confirmez votre inscription ✨</h2>
            <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">
              Merci de vous être inscrit(e) à notre newsletter. Pour finaliser votre abonnement et recevoir nos prochaines actualités, veuillez confirmer votre adresse e-mail.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${confirmUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background-color:#0f172a;color:#ffffff;font-weight:600;text-decoration:none;">Confirmer mon inscription</a>
            </p>
            <p style="font-size:13px;line-height:1.6;color:#475569;">
              Si le bouton ne fonctionne pas, copiez-collez le lien suivant dans votre navigateur :<br />
              <a href="${confirmUrl}" style="color:#0f172a;word-break:break-all;">${confirmUrl}</a>
            </p>
            <p style="font-size:13px;line-height:1.6;color:#475569;">
              À tout moment, vous pouvez vous désinscrire via le lien présent dans nos e-mails.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px;text-align:center;background-color:#e2e8f0;font-size:12px;color:#334155;">
            © ${new Date().getFullYear()} ${brandName}
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  const text = `Confirmez votre inscription\n\nMerci de vous être inscrit(e) à la newsletter ${brandName}. Pour finaliser votre abonnement, cliquez sur le lien suivant :\n${confirmUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`;

  return { html, text };
};
