export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8f7f2; border-radius: 12px;">
      <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 24px;">New message via LandPal.</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 13px; color: rgba(26,26,26,0.5); width: 80px; vertical-align: top;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 14px; color: #1a1a1a; vertical-align: top;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 13px; color: rgba(26,26,26,0.5); vertical-align: top;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 14px; color: #1a1a1a; vertical-align: top;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 13px; color: rgba(26,26,26,0.5); vertical-align: top;">Message</td>
          <td style="padding: 12px 0; font-size: 14px; color: #1a1a1a; line-height: 1.7; vertical-align: top; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
      <p style="margin-top: 32px; font-size: 11px; color: rgba(26,26,26,0.35);">Sent via LandPal. contact form · landpal.design</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LandPal. <onboarding@resend.dev>',
        to: ['hello@landpal.design'],
        reply_to: email,
        subject: `New message from ${name} — LandPal.`,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.message || 'Failed to send email.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
}
