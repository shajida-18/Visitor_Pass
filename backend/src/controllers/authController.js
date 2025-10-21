const { User } = require('../models/User');
const Organization = require('../models/Organization');
const Visitor = require('../models/Visitor');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAuthToken } = require('../utils/jwt');

function bad(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}

const ALLOWED_ROLES = new Set(['admin', 'security', 'host', 'visitor']);

async function registerOrg(req, res) {
  try {
    const { orgName, adminName, adminEmail, password } = req.body || {};
    if (!orgName || !adminName || !adminEmail || !password) {
      return bad(res, 'orgName, adminName, adminEmail and password are required');
    }

    const org = await Organization.create({ name: orgName });

    const passwordHash = await hashPassword(password);
    const adminUser = await User.create({
      orgId: org._id,
      name: adminName,
      email: adminEmail,
      role: 'admin',
      status: 'active',
      passwordHash
    });

    org.createdByUserId = adminUser._id;
    await org.save();

    const token = signAuthToken({
      userId: adminUser._id.toString(),
      orgId: org._id.toString(),
      role: adminUser.role,
      name: adminUser.name,
      email: adminUser.email
    });

    return res.status(201).json({
      token,
      user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      org: { id: org._id, name: org.name }
    });
  } catch (e) {
    console.error('registerOrg error:', e);
    return bad(res, 'Failed to register organization', 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return bad(res, 'email and password are required');

    const candidates = await User.find({ email }).sort({ createdAt: -1 }).limit(5);
    if (candidates.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    let user = candidates.find(u => (u.status || 'active') !== 'disabled') || candidates[0];

    const ok = await verifyPassword(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    let role = String(user.role || '').toLowerCase();
    if (!ALLOWED_ROLES.has(role)) {
      return bad(res, `Invalid role on user. Expected one of ${Array.from(ALLOWED_ROLES).join(', ')}`, 400);
    }
    if (role === 'visitor') {
      return bad(res, 'Visitor role cannot sign in to the staff dashboard with password', 403);
    }

    const org = await Organization.findById(user.orgId).lean();
    if (!org) return bad(res, 'User organization not found', 400);

    const token = signAuthToken({
      userId: user._id.toString(),
      orgId: user.orgId.toString(),
      role,
      name: user.name,
      email: user.email
    });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
      org: { id: org._id, name: org.name }
    });
  } catch (e) {
    console.error('login error:', e);
    return bad(res, 'Login failed', 500);
  }
}

// Visitor login (email-only)
async function visitorLogin(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return bad(res, 'email is required');

    const visitor = await Visitor.findOne({ email: String(email).toLowerCase() });
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });

    const org = await Organization.findById(visitor.orgId).lean();
    if (!org) return bad(res, 'Visitor organization not found', 400);

    const token = signAuthToken({
      userId: visitor._id.toString(),
      visitorId: visitor._id.toString(),
      orgId: visitor.orgId.toString(),
      role: 'visitor',
      name: `${visitor.firstName} ${visitor.lastName || ''}`.trim(),
      email: visitor.email
    });

    return res.json({
      token,
      user: { id: visitor._id, name: `${visitor.firstName} ${visitor.lastName || ''}`.trim(), email: visitor.email, role: 'visitor' },
      org: { id: org._id, name: org.name }
    });
  } catch (e) {
    console.error('visitorLogin error:', e);
    return bad(res, 'Login failed', 500);
  }
}

// me: return user profile or visitor profile depending on role
async function me(req, res) {
  try {
    const { role, userId, visitorId } = req.user || {};

    if (String(role || '').toLowerCase() === 'visitor') {
      // fetch visitor profile
      const v = await Visitor.findOne({ _id: visitorId || userId }).lean();
      if (!v) return res.status(404).json({ error: 'Visitor not found' });
      const org = await Organization.findById(v.orgId).lean();
      return res.json({
        user: {
          id: v._id,
          name: `${v.firstName} ${v.lastName || ''}`.trim(),
          email: v.email,
          role: 'visitor',
          phone: v.phone || '',
          company: v.company || ''
        },
        org: org ? { id: org._id, name: org.name } : null
      });
    }

    // staff user: fetch from users collection
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const org = await Organization.findById(user.orgId).lean();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: String(user.role || '').toLowerCase(),
        status: user.status || 'active',
        phone: user.phone || ''
      },
      org: org ? { id: org._id, name: org.name } : null
    });
  } catch (e) {
    console.error('me error:', e);
    return bad(res, 'Failed to fetch user', 500);
  }
}

module.exports = {
  registerOrg,
  login,
  visitorLogin,
  me
};