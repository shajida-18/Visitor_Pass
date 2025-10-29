const jwt = require("jsonwebtoken");

function signAuthToken(info) {
  const payload = {
    userId: info.userId,
    visitorId: info.visitorId,
    orgId: info.orgId,
    role: info.role,
    name: info.name,
    email: info.email,
  };

  const secret = process.env.JWT_SECRET;
  const expires = process.env.JWT_EXPIRES_IN || "7d";

  const token = jwt.sign(payload, secret, { expiresIn: expires });
  return token;
}

module.exports = { signAuthToken };
