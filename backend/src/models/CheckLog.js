const mongoose = require("mongoose");

const CheckLogSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pass",
    required: true,
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    required: true,
  },
  scannedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["checkin", "checkout"],
    required: true,
  },
  location: {
    type: String,
  },
  method: {
    type: String,
    enum: ["qr", "manual"],
    default: "qr",
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const CheckLog = mongoose.model("CheckLog", CheckLogSchema);

module.exports = CheckLog;
