// simplified email-only notification helper
const nodemailer = require('nodemailer');

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST) return null;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
  return { transport, from: SMTP_FROM || 'no-reply@visitor-pass.local' };
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransport();
  if (!t) {
    // In dev environment without SMTP, log to console so you can see the message
    console.log('[email:dev] to=%s subject=%s\n%s', to, subject, text || (html || '').slice(0, 400));
    return;
  }
  await t.transport.sendMail({ from: t.from, to, subject, text, html });
}

module.exports = { sendEmail };