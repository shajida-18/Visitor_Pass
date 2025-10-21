const { Schema, model } = require('mongoose');

const ROLES = ['admin', 'security', 'host', 'visitor'];

const UserSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String },
  role: { type: String, enum: ROLES, required: true },
  status: { type: String, default: 'active' },
  passwordHash: { type: String }
}, { timestamps: true });

module.exports = {
  User: model('User', UserSchema),
  ROLES
};