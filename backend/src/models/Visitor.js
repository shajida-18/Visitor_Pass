const { Schema, model } = require('mongoose');

const VisitorSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
    // Optional photo to meet "details + photo" requirement
    photo: { type: String }, // base64 data URL or hosted URL
    notes: { type: String }
  },
  { timestamps: true }
);

VisitorSchema.index({ orgId: 1, email: 1 }, { unique: false, sparse: true });

module.exports = model('Visitor', VisitorSchema);