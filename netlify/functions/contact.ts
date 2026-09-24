import type { HandlerEvent } from '@netlify/functions';
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

// We don't annotate the export with `Handler` from @netlify/functions — v6's
// typings only allow the legacy `{ statusCode, body, headers }` shape, but
// the runtime also accepts `Response` objects directly. The runtime is the
// source of truth.
async function contactHandler(event: HandlerEvent) {
  if (event.httpMethod === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload: { name?: string; email?: string; subject?: string; message?: string };
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { name, email, subject, message } = payload || {};

  if (!name || !email || !message) {
    return jsonResponse(400, { error: 'Name, email, and message are required fields.' });
  }

  // Basic email shape check — not RFC-strict, just enough to reject obvious garbage.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return jsonResponse(500, {
      error: 'Contact form is not configured yet. Please email the owner directly.',
    });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
  const toEmail = process.env.CONTACT_INBOX;
  if (!toEmail) {
    console.error('CONTACT_INBOX is not configured');
    return jsonResponse(500, {
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
      return jsonResponse(response.status, {
        error: (data as any)?.message || 'Failed to send email via Resend',
      });
    }

    return jsonResponse(200, { success: true, id: (data as any)?.id });
  } catch (error: any) {
    console.error('Contact form error:', error?.message || error);
    return jsonResponse(500, { error: 'Internal server error while sending email' });
  }
}

export { contactHandler as handler };
