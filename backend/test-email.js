import 'dotenv/config';
import nodemailer from 'nodemailer';
import dns from 'dns';
import net from 'net';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Change this to whatever address you want the test email sent to
const TEST_RECIPIENT = process.env.SMTP_USER;

console.log('=== Email Connectivity Test ===\n');
console.log('Config:');
console.log(`  SMTP_HOST: ${SMTP_HOST}`);
console.log(`  SMTP_PORT: ${SMTP_PORT}`);
console.log(`  SMTP_USER: ${SMTP_USER}`);
console.log(`  SMTP_PASS: ${SMTP_PASS ? '***' + SMTP_PASS.slice(-4) : 'NOT SET'}`);
console.log(`  EMAIL_FROM: ${EMAIL_FROM}`);
console.log(`  TEST_RECIPIENT: ${TEST_RECIPIENT}\n`);

// Step 1: DNS resolution
async function testDNS() {
  console.log('--- Step 1: DNS Resolution ---');
  try {
    const addresses = await dns.promises.resolve4(SMTP_HOST);
    console.log(`  OK - ${SMTP_HOST} resolves to: ${addresses.join(', ')}\n`);
    return true;
  } catch (err) {
    console.log(`  FAIL - Cannot resolve ${SMTP_HOST}: ${err.message}`);
    console.log('  -> Check /etc/resolv.conf or try: dig smtp.gmail.com\n');
    return false;
  }
}

// Step 2: TCP connectivity (is the port blocked by DO firewall?)
async function testTCP() {
  console.log('--- Step 2: TCP Connection (port blocking check) ---');
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      console.log(`  FAIL - Connection to ${SMTP_HOST}:${SMTP_PORT} timed out after 10s`);
      console.log('  -> DigitalOcean blocks port 25 by default.');
      console.log('  -> Port 587 should work. Port 465 (SSL) is also an option.');
      console.log('  -> Check your DO firewall rules and ensure outbound traffic on this port is allowed.\n');
      resolve(false);
    }, 10000);

    socket.connect(SMTP_PORT, SMTP_HOST, () => {
      clearTimeout(timeout);
      socket.destroy();
      console.log(`  OK - TCP connection to ${SMTP_HOST}:${SMTP_PORT} succeeded\n`);
      resolve(true);
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      console.log(`  FAIL - TCP connection error: ${err.message}`);
      console.log('  -> If ECONNREFUSED or ETIMEDOUT, the port may be blocked by DO firewall.');
      console.log('  -> Try port 465 with secure:true, or submit a DO support ticket to unblock SMTP.\n');
      resolve(false);
    });
  });
}

// Step 3: Nodemailer transporter.verify()
async function testVerify() {
  console.log('--- Step 3: SMTP Auth (transporter.verify) ---');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Extra debug options
    logger: true,
    debug: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  try {
    await transporter.verify();
    console.log('  OK - SMTP authentication successful\n');
    return transporter;
  } catch (err) {
    console.log(`  FAIL - ${err.message}`);
    if (err.message.includes('Invalid login') || err.code === 'EAUTH') {
      console.log('  -> Gmail: Make sure you are using an App Password, not your account password.');
      console.log('  -> Generate one at: https://myaccount.google.com/apppasswords');
    }
    if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
      console.log('  -> The SMTP port is likely blocked. See Step 2 suggestions.');
    }
    if (err.message.includes('self-signed') || err.message.includes('certificate')) {
      console.log('  -> TLS certificate issue. Try adding tls: { rejectUnauthorized: false } (not ideal for prod).');
    }
    console.log();
    return null;
  }
}

// Step 4: Actually send a test email
async function testSend(transporter) {
  console.log('--- Step 4: Send Test Email ---');
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: TEST_RECIPIENT,
      subject: 'Chorho Test Email - ' + new Date().toISOString(),
      text: 'If you see this, email delivery from the droplet is working!',
      html: '<h2>It works!</h2><p>Email delivery from the DigitalOcean droplet is working correctly.</p><p>Sent at: ' + new Date().toISOString() + '</p>',
    });
    console.log(`  OK - Email sent! MessageId: ${info.messageId}`);
    console.log(`  Accepted: ${info.accepted}`);
    console.log(`  Rejected: ${info.rejected}\n`);
    return true;
  } catch (err) {
    console.log(`  FAIL - ${err.message}\n`);
    return false;
  }
}

// Also test port 465 as a fallback diagnostic
async function testAlternatePort() {
  const altPort = SMTP_PORT === 465 ? 587 : 465;
  console.log(`--- Bonus: TCP check on alternate port ${altPort} ---`);
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      console.log(`  Port ${altPort} timed out (also blocked)\n`);
      resolve(false);
    }, 10000);

    socket.connect(altPort, SMTP_HOST, () => {
      clearTimeout(timeout);
      socket.destroy();
      console.log(`  Port ${altPort} is reachable — consider switching if your current port is blocked\n`);
      resolve(true);
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      console.log(`  Port ${altPort} is not reachable either\n`);
      resolve(false);
    });
  });
}

// Run all tests
(async () => {
  const dnsOk = await testDNS();
  if (!dnsOk) {
    console.log('Stopping early — DNS failed. Fix DNS first.');
    process.exit(1);
  }

  const tcpOk = await testTCP();
  if (!tcpOk) {
    await testAlternatePort();
    console.log('Stopping early — TCP connection failed. The port is likely blocked.');
    console.log('\nDigitalOcean SMTP tips:');
    console.log('  1. Port 25 is blocked on all new droplets (anti-spam).');
    console.log('  2. Port 587 (STARTTLS) usually works for services like Gmail.');
    console.log('  3. Port 465 (implicit TLS) is another option.');
    console.log('  4. If both 587 and 465 are blocked, open a DO support ticket to request unblocking.');
    console.log('  5. Alternative: use an email API (SendGrid, Mailgun, Resend) over HTTPS (port 443) instead of SMTP.');
    process.exit(1);
  }

  const transporter = await testVerify();
  if (!transporter) {
    console.log('Stopping early — SMTP auth failed.');
    process.exit(1);
  }

  const sent = await testSend(transporter);

  console.log('=== Summary ===');
  console.log(`  DNS:       OK`);
  console.log(`  TCP:       OK`);
  console.log(`  SMTP Auth: OK`);
  console.log(`  Send:      ${sent ? 'OK' : 'FAILED'}`);
  console.log();

  if (sent) {
    console.log('Everything works! Check the inbox of ' + TEST_RECIPIENT);
  } else {
    console.log('Sending failed despite a good connection. Check the error above.');
  }

  process.exit(sent ? 0 : 1);
})();
