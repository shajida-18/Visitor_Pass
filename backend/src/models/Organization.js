const { Schema, model } = require('mongoose');

const NotificationSettingsSchema = new Schema(
  {
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: false },
    fromEmail: { type: String },
    smsFromNumber: { type: String }
  },
  { _id: false }
);

const OrgSettingsSchema = new Schema(
  {
    requireApproval: { type: Boolean, default: true },
    qrExpiryMinutes: { type: Number, default: 60 * 24 }, // 24 hours
    badgeTemplate: { type: String, default: 'default' }
  },
  { _id: false }
);

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    domain: { type: String }, // optional, for SSO later
    settings: { type: OrgSettingsSchema, default: () => ({}) },
    notifications: { type: NotificationSettingsSchema, default: () => ({}) },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = model('Organization', OrganizationSchema);