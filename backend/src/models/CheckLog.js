const { Schema, model } = require('mongoose');

const CheckLogSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    passId: { type: Schema.Types.ObjectId, ref: 'Pass', required: true },
    visitorId: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
    scannedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // security/frontdesk
    type: { type: String, enum: ['checkin', 'checkout'], required: true, index: true },
    location: { type: String },
    method: { type: String, enum: ['qr', 'manual'], default: 'qr' },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

CheckLogSchema.index({ orgId: 1, type: 1, timestamp: -1 });

module.exports = model('CheckLog', CheckLogSchema);