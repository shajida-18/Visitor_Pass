const jwt = require('jsonwebtoken');
const { ROLES } = require('../models/User');

// Verifies JWT and attaches a normalized req.user
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId || payload.sub; // normalize id
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

    req.user = {
      userId: String(userId),
      orgId: String(payload.orgId || ''),
      role: String(payload.role || '').toLowerCase(),
      name: payload.name,
      email: payload.email
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based guard
function requireRoles(...roles) {
  roles.forEach((r) => {
    if (!ROLES.includes(r)) throw new Error(`Unknown role: ${r}`);
  });
  return (req, res, next) => {
    if (!req.user?.role) return res.status(403).json({ error: 'Forbidden' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRoles };