const { Schema, model } = require('mongoose');

const AppointmentSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    hostUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visitorId: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
    purpose: { type: String },
    location: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ['invited', 'pending_approval', 'approved', 'declined', 'cancelled', 'completed'],
      default: 'invited',
      index: true
    },
    inviteCode: { type: String, index: true }, 
    notes: { type: String }
  },
  { timestamps: true }
);

AppointmentSchema.index({ orgId: 1, startTime: 1, status: 1 });

module.exports = model('Appointment', AppointmentSchema);