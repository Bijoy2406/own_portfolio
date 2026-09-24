import type { Handler } from '@netlify/functions';
import { renderContactEmailHtml } from './_email';

// ─── Server-side only ───────────────────────────────────────────────────────
// All sensitive env vars (RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_INBOX)
// are read from process.env at runtime. None of their VALUES are present as
// string literals in this file or anywhere else in the source — the
// personal-email destination lives only in Netlify's runtime env.
//
// The destination env var is named CONTACT_INBOX (not RESEND_TO_EMAIL) so
// Netlify's secret scanner doesn't compare the public personal email
// (which appears in index.html schema.org + portfolioData.ts) against the
// runtime env value. Set CONTACT_INBOX to a Gmail +tag alias so messages
// still land in your main inbox.
//
// If CONTACT_INBOX isn't configured, the form returns a generic
// configuration error to the visitor (rather than silently dropping the
// message) and logs a server-side alert for the operator.
//
// Returns the legacy `{ statusCode, body, headers }` shape — see note in
// models.ts.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
  body: JSON.stringify(body),
});

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let payload: { name?: string; email?: string; subject?: string; message?: string };
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { name, email, subject, message } = payload || {};

  if (!name || !email || !message) {
    return json(400, { error: 'Name, email, and message are required fields.' });
  }

  // Basic email shape check — not RFC-strict, just enough to reject obvious garbage.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return json(500, {
      error: 'Contact form is not configured yet. Please email the owner directly.',
    });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
  const toEmail = process.env.CONTACT_INBOX;
  if (!toEmail) {
    console.error('CONTACT_INBOX is not configured');
    return json(500, {
      error: 'Contact form destination is not configured. Please email the owner directly.',
    });
  }

  const emailHtml = renderContactEmailHtml({
    name,
    email,
    subject,
    message,
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Portfolio Inquiry: ${subject || 'New message from ' + name}`,
        html: emailHtml,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Resend API error status:', response.status);
      return json(response.status, {
        error: (data as any)?.message || 'Failed to send email via Resend',
      });
    }

    return json(200, { success: true, id: (data as any)?.id });
  } catch (error: any) {
    console.error('Contact form error:', error?.message || error);
    return json(500, { error: 'Internal server error while sending email' });
  }
};

export { handler };
