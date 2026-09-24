// ─── Shared email HTML renderer ─────────────────────────────────────────────
// Used by both netlify/functions/contact.ts (production) and the dev
// middleware in vite.config.ts. Plain template strings — no JSX — so it
// imports cleanly from both contexts.

export interface ContactEmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Render the contact-form email body as classic inline-styled HTML.
 *
 * Kept deliberately framework-free so it can be imported from the Vite dev
 * server (Node ESM) AND from a Netlify Function bundle without pulling in
 * React / Tailwind / build-time transforms.
 */
export function renderContactEmailHtml({
  name,
  email,
  subject,
  message,
}: ContactEmailData): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || 'New portfolio inquiry');
  // The message itself may contain line breaks and characters the visitor
  // typed; convert to <br> + escape to keep both readability and safety.
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e4e4e7;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#09090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #27272a;background:#0f0f12;">
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#10b981;font-weight:600;">Portfolio · Contact Form</p>
              <h1 style="margin:6px 0 0;font-size:20px;color:#fafafa;font-weight:600;line-height:1.3;">${safeSubject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:6px 0;color:#a1a1aa;font-size:12px;width:90px;vertical-align:top;">From</td>
                  <td style="padding:6px 0;color:#fafafa;font-size:14px;font-weight:500;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#a1a1aa;font-size:12px;vertical-align:top;">Reply to</td>
                  <td style="padding:6px 0;color:#fafafa;font-size:14px;">
                    <a href="mailto:${safeEmail}" style="color:#10b981;text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <div style="background:#0f0f12;border:1px solid #27272a;border-radius:10px;padding:18px 20px;color:#e4e4e7;font-size:14px;line-height:1.65;white-space:normal;">
                ${safeMessage}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid #27272a;background:#0f0f12;">
              <p style="margin:0;font-size:11px;color:#71717a;line-height:1.5;">
                This message was sent via the portfolio contact form. Reply directly to this email to respond to ${safeName}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
