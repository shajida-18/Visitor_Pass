const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Organization = require('../models/Organization');

async function preRegister(req, res) {
  const { orgId, firstName, lastName, email, phone, company, photo, purpose, startTime } = req.body || {};
  if (!orgId || !firstName || !startTime) {
    return res.status(400).json({ error: 'orgId, firstName, startTime are required' });
  }
  const org = await Organization.findById(orgId);
  if (!org) return res.status(400).json({ error: 'Organization not found' });

  const visitor = await Visitor.create({
    orgId, firstName, lastName, email, phone, company, photo
  });

  const appt = await Appointment.create({
    orgId,
    hostUserId: null, // will be assigned on approval
    visitorId: visitor._id,
    purpose: purpose || 'Visit',
    location: 'TBD',
    startTime: new Date(startTime),
    status: 'pending_approval'
  });

  res.status(201).json({ visitorId: visitor._id, appointmentId: appt._id, status: appt.status });
}

const Pass = require('../models/Pass');
async function getPassPublic(req, res) {
  const pass = await Pass.findOne({ code: req.params.code }).populate('visitorId', 'firstName lastName company');
  if (!pass) return res.status(404).json({ error: 'Pass not found' });
  res.json({
    code: pass.code,
    status: pass.status,
    visitor: pass.visitorId,
    validFrom: pass.validFrom,
    validTo: pass.validTo
  });
}

module.exports = { preRegister, getPassPublic };