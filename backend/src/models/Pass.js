const { Schema, model } = require('mongoose');

const PassSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    visitorId: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
    issuedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // security/frontdesk who issued
    code: { type: String, required: true, unique: true, index: true }, // short/UUID code
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    status: { type: String, enum: ['issued', 'active', 'expired', 'revoked'], default: 'issued', index: true },
    qrPayload: { type: String }, // JSON string encoded in QR
    pdfUrl: { type: String } // store generated badge URL if uploaded to storage
  },
  { timestamps: true }
);

PassSchema.index({ orgId: 1, visitorId: 1, status: 1 });

module.exports = model('Pass', PassSchema);