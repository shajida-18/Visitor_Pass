const jwt = require("jsonwebtoken");

function signAuthToken(claims) {
  const payload = {
    userId: claims.userId,
    visitorId: claims.visitorId,
    orgId: claims.orgId,
    role: claims.role,
    name: claims.name,
    email: claims.email,
  };

  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  };

  const token = jwt.sign(payload, secret, options);
  return token;
}

module.exports = {
  signAuthToken,
};
