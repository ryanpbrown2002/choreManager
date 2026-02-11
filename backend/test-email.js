import 'dotenv/config';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Change this to whatever address you want the test email sent to
const TEST_RECIPIENT = 'chorhoj@gmail.com';

const MAILGUN_BASE_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}`;
const authHeader = 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

console.log('=== Mailgun Email Connectivity Test ===\n');
console.log('Config:');
console.log(`  MAILGUN_API_KEY: ${MAILGUN_API_KEY ? '***' + MAILGUN_API_KEY.slice(-4) : 'NOT SET'}`);
console.log(`  MAILGUN_DOMAIN:  ${MAILGUN_DOMAIN}`);
console.log(`  EMAIL_FROM:      ${EMAIL_FROM}`);
console.log(`  TEST_RECIPIENT:  ${TEST_RECIPIENT}\n`);

// Step 1: Verify API key by fetching domain info
async function testApiKey() {
  console.log('--- Step 1: Verify API Key & Domain ---');
  try {
    const res = await fetch(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const body = await res.text();
      console.log(`  FAIL (${res.status}): ${body}`);
      if (res.status === 401) {
        console.log('  -> Your MAILGUN_API_KEY is invalid. Check it in Mailgun → Settings → API Keys.');
      }
      if (res.status === 404) {
        console.log(`  -> Domain "${MAILGUN_DOMAIN}" not found. Add it in Mailgun → Sending → Domains.`);
      }
      console.log();
      return false;
    }

    const data = await res.json();
    const domain = data.domain;
    console.log(`  OK - Domain: ${domain.name}`);
    console.log(`  State: ${domain.state}`);
    console.log(`  Type: ${domain.type}`);

    if (domain.state !== 'active') {
      console.log(`  WARNING - Domain state is "${domain.state}", not "active".`);
      console.log('  -> Go to Mailgun and verify your DNS records for this domain.');
    }
    console.log();
    return domain.state === 'active';
  } catch (err) {
    console.log(`  FAIL - Network error: ${err.message}`);
    console.log('  -> Check that outbound HTTPS (port 443) is not blocked.\n');
    return false;
  }
}

// Step 2: Check domain DNS verification status
async function testDNS() {
  console.log('--- Step 2: Check Domain DNS Records ---');
  try {
    const res = await fetch(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}/verify`, {
      method: 'PUT',
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const body = await res.text();
      console.log(`  FAIL (${res.status}): ${body}\n`);
      return false;
    }

    const data = await res.json();
    const d = data.domain;

    const records = [
      { name: 'SPF', status: d.spam_action ? 'configured' : 'check manually' },
    ];

    // Check sending vs receiving DNS
    const sending = data.sending_dns_records || [];
    const receiving = data.receiving_dns_records || [];

    console.log('  Sending DNS records:');
    for (const r of sending) {
      const status = r.valid === 'valid' ? 'OK' : 'MISSING/INVALID';
      console.log(`    ${status} - ${r.record_type} ${r.name} → ${r.value?.slice(0, 60)}...`);
    }

    console.log('  Receiving DNS records:');
    for (const r of receiving) {
      const status = r.valid === 'valid' ? 'OK' : 'MISSING/INVALID (optional)';
      console.log(`    ${status} - ${r.record_type} ${r.name}`);
    }

    const allSendingValid = sending.every(r => r.valid === 'valid');
    if (!allSendingValid) {
      console.log('\n  WARNING - Some sending DNS records are not verified.');
      console.log('  -> Add the records above in DigitalOcean → Networking → Domains → chorho.com');
      console.log('  -> DNS propagation can take up to 48 hours (usually minutes).');
    } else {
      console.log('\n  OK - All sending DNS records verified.');
    }
    console.log();
    return allSendingValid;
  } catch (err) {
    console.log(`  FAIL - ${err.message}\n`);
    return false;
  }
}

// Step 3: Send a test email
async function testSend() {
  console.log('--- Step 3: Send Test Email ---');
  try {
    const form = new URLSearchParams();
    form.append('from', EMAIL_FROM);
    form.append('to', TEST_RECIPIENT);
    form.append('subject', 'Chorho Mailgun Test - ' + new Date().toISOString());
    form.append('text', 'If you see this, Mailgun email delivery from the droplet is working!');
    form.append('html', '<h2>It works!</h2><p>Mailgun email delivery from the DigitalOcean droplet is working.</p><p>Sent at: ' + new Date().toISOString() + '</p>');

    const res = await fetch(`${MAILGUN_BASE_URL}/messages`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      console.log(`  FAIL (${res.status}): ${body}`);
      if (res.status === 403) {
        console.log('  -> Your domain may not be verified, or you are on a free plan');
        console.log('     and the recipient is not in your Authorized Recipients list.');
        console.log('  -> Free plan: add recipients at Mailgun → Sending → Overview → Authorized Recipients.');
      }
      console.log();
      return false;
    }

    const data = await res.json();
    console.log(`  OK - ${data.message}`);
    console.log(`  ID: ${data.id}\n`);
    return true;
  } catch (err) {
    console.log(`  FAIL - ${err.message}\n`);
    return false;
  }
}

// Run all
(async () => {
  const apiOk = await testApiKey();
  if (!apiOk) {
    console.log('Stopping early — fix your API key or domain first.');
    process.exit(1);
  }

  const dnsOk = await testDNS();
  // DNS warning is non-fatal — Mailgun may still send (just might land in spam)

  const sent = await testSend();

  console.log('=== Summary ===');
  console.log(`  API Key & Domain: OK`);
  console.log(`  DNS Records:      ${dnsOk ? 'OK' : 'INCOMPLETE (emails may go to spam)'}`);
  console.log(`  Send:             ${sent ? 'OK' : 'FAILED'}`);
  console.log();

  if (sent) {
    console.log('Check the inbox (and spam folder) of ' + TEST_RECIPIENT);
  }

  process.exit(sent ? 0 : 1);
})();
