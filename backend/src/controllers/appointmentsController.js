const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const { User } = require('../models/User');
const { sendEmail } = require('../lib/notify');

async function listAppointments(req, res) {
  const { orgId, role, userId } = req.user;
  const { status, visitorId, from, to, limit = 20, page = 1 } = req.query;

  const filter = { orgId };
  if (role === 'host') filter.hostUserId = userId;
if (String(role || '').toLowerCase() === 'visitor') filter.visitorId = req.user.visitorId || userId;
  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  }
  if (role === 'host') filter.hostUserId = userId;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ startTime: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('visitorId', 'firstName lastName email phone')
      .populate('hostUserId', 'name email'),
    Appointment.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
}

async function createAppointment(req, res) {
  const { orgId, userId, role } = req.user;
  const { visitorId, startTime, endTime, purpose, location, notes } = req.body || {};

  if (!visitorId || !startTime) return res.status(400).json({ error: 'visitorId and startTime are required' });

  const visitor = await Visitor.findOne({ _id: visitorId, orgId });
  if (!visitor) return res.status(400).json({ error: 'Visitor not found in your organization' });

  let hostUserId = userId;
  if (role === 'admin' && req.body.hostUserId) {
    const host = await User.findOne({ _id: req.body.hostUserId, orgId, role: 'host' });
    if (!host) return res.status(400).json({ error: 'Provided hostUserId is not a valid host in your organization' });
    hostUserId = host._id;
  }

  const doc = await Appointment.create({
    orgId, hostUserId, visitorId, purpose, location,
    startTime: new Date(startTime),
    endTime: endTime ? new Date(endTime) : undefined,
    status: 'pending_approval',
    notes
  });

  // Notify host if they have email
  const host = await User.findById(hostUserId).lean();
  if (host?.email) {
    await sendEmail({
      to: host.email,
      subject: 'New appointment request',
      text: `A new appointment with ${visitor.firstName} ${visitor.lastName} is pending your approval.`
    }).catch(()=>{});
  }

  res.status(201).json(doc);
}

async function getAppointment(req, res) {
  const { orgId, role, userId } = req.user;
  const appt = await Appointment.findOne({ _id: req.params.id, orgId })
    .populate('visitorId', 'firstName lastName email phone company')
    .populate('hostUserId', 'name email');
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  if (role === 'host' && appt.hostUserId?._id?.toString() !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(appt);
}

async function updateAppointment(req, res) {
  const { orgId, role, userId } = req.user;
  const appt = await Appointment.findOne({ _id: req.params.id, orgId });
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  if (role === 'host' && appt.hostUserId?.toString() !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const fields = ['purpose', 'location', 'startTime', 'endTime', 'notes'];
  for (const f of fields) if (req.body[f] !== undefined) appt[f] = f.includes('Time') ? new Date(req.body[f]) : req.body[f];
  await appt.save();
  res.json(appt);
}

async function updateAppointmentStatus(req, res) {
  const { orgId, role, userId } = req.user;
  const appt = await Appointment.findOne({ _id: req.params.id, orgId }).populate('visitorId');
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  if (role === 'host' && appt.hostUserId?.toString() !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { status } = req.body || {};
  if (!['pending_approval', 'approved', 'declined', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  appt.status = status;
  await appt.save();

  // Notify visitor on approval/decline
  if (['approved', 'declined'].includes(status) && appt.visitorId?.email) {
    await sendEmail({
      to: appt.visitorId.email,
      subject: `Your appointment was ${status}`,
      text: `Your appointment is now ${status}.`
    }).catch(()=>{});
  }

  res.json(appt);
}

module.exports = { listAppointments, createAppointment, getAppointment, updateAppointment, updateAppointmentStatus };
