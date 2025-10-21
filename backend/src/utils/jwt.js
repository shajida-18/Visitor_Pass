const jwt = require('jsonwebtoken');

function signAuthToken(claims) {
  const payload = {
    sub: claims.userId,
    userId: claims.userId,
    visitorId: claims.visitorId || undefined,
    orgId: claims.orgId,
    role: claims.role,
    name: claims.name,
    email: claims.email
  };
  const opts = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  return jwt.sign(payload, process.env.JWT_SECRET, opts);
}

module.exports = { signAuthToken };