const crypto = require('crypto');
const { User } = require('../models/User');
const { hashPassword } = require('../utils/password');
const { sendEmail } = require('../lib/notify');

function toPublic(u) {
  return {
    id: u._id, name: u.name, email: u.email, phone: u.phone || '',
    role: u.role, status: u.status || 'active'
  };
}

async function listUsers(req, res) {
  const { orgId } = req.user;
  const users = await User.find({ orgId }).sort({ createdAt: -1 }).limit(100);
  res.json({ items: users.map(toPublic), total: users.length });
}

async function createUser(req, res) {
  const { orgId } = req.user;
  const { name, email, phone, role } = req.body || {};
  if (!name || !email || !role) return res.status(400).json({ error: 'name, email, role are required' });

  const normalizedRole = String(role).toLowerCase();
  if (!['admin', 'security', 'host'].includes(normalizedRole)) {
    return res.status(400).json({ error: 'role must be admin, security, or host' });
  }

  const tempPassword = crypto.randomBytes(4).toString('hex') + 'A1!';
  const passwordHash = await hashPassword(tempPassword);

  const user = await User.create({
    orgId, name, email, phone, role: normalizedRole, status: 'active', passwordHash
  });

  // Email temp password if SMTP configured
  await sendEmail({
    to: email,
    subject: 'Your Visitor Pass account',
    text: `Hello ${name},\n\nYour account has been created with role "${normalizedRole}".\n\nTemporary password: ${tempPassword}\n\nPlease login and change it.\n`
  }).catch(() => { /* ignore dev env */ });

  res.status(201).json({ user: toPublic(user), tempPassword });
}

module.exports = { listUsers, createUser };