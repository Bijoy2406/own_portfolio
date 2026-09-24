import { renderContactEmailHtml } from '../src/components/ContactEmail';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'RESEND_API_KEY is not configured in environment variables. Please add it to your environment.',
    });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
  const toEmail = process.env.RESEND_TO_EMAIL || 'bijoy.ahmed12555@gmail.com';

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
        'Authorization': `Bearer ${apiKey}`,
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Failed to send email via Resend',
      });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Internal server error while sending email',
    });
  }
}
