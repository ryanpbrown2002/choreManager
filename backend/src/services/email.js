const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const EMAIL_FROM = process.env.EMAIL_FROM;

const MAILGUN_BASE_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}`;

export async function sendEmail({ to, subject, html, text }) {
  const form = new URLSearchParams();
  form.append('from', EMAIL_FROM);
  form.append('to', to);
  form.append('subject', subject);
  if (html) form.append('html', html);
  if (text) form.append('text', text);

  const response = await fetch(`${MAILGUN_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailgun error (${response.status}): ${body}`);
  }

  return response.json();
}

export async function verifyConnection() {
  const response = await fetch(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailgun verification failed (${response.status}): ${body}`);
  }

  return response.json();
}
