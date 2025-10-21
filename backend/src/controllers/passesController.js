const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const { sendEmail } = require('../lib/notify');

function shortCode(prefix = 'VP') {
  const s = uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();
  return `${prefix}-${s}`;
}

async function listPasses(req, res) {
  try {
    const { orgId, role, userId, visitorId: tokenVisitorId } = req.user || {};
    const { status, visitorId, limit = 20, page = 1 } = req.query;
    const filter = { orgId };

    // If the requester is a visitor, only return passes belonging to that visitor
    if (String(role || '').toLowerCase() === 'visitor') {
      filter.visitorId = tokenVisitorId || userId;
    } else {
      if (status) filter.status = status;
      if (visitorId) filter.visitorId = visitorId;
    }

    const [items, total] = await Promise.all([
      Pass.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('visitorId', 'firstName lastName email phone'),
      Pass.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('listPasses error:', err);
    res.status(500).json({ error: 'Failed to list passes' });
  }
}

async function issuePass(req, res) {
  try {
    const { orgId, userId } = req.user;
    const { visitorId, appointmentId } = req.body;
    let { validFrom, validTo } = req.body;

    const visitor = await Visitor.findOne({ _id: visitorId, orgId });
    if (!visitor) return res.status(400).json({ error: 'Visitor not found in your organization' });

    let appt = null;
    if (appointmentId) {
      appt = await Appointment.findOne({ _id: appointmentId, orgId, visitorId });
      if (!appt) return res.status(400).json({ error: 'Appointment not found for this visitor/org' });
    }

    const now = new Date();
    validFrom = validFrom ? new Date(validFrom) : appt?.startTime || now;
    validTo = validTo ? new Date(validTo) : appt?.endTime || new Date(validFrom.getTime() + 24 * 60 * 60 * 1000);
    if (validTo <= validFrom) return res.status(400).json({ error: 'validTo must be after validFrom' });

    const code = shortCode('PASS');
    const qrPayload = JSON.stringify({ code, orgId: orgId.toString(), v: 1 });

    const pass = await Pass.create({
      orgId,
      appointmentId: appt?._id,
      visitorId,
      issuedByUserId: userId,
      code,
      validFrom,
      validTo,
      status: 'issued',
      qrPayload
    });

    // Notify visitor via email if available
    const whenTxt = `${new Date(validFrom).toLocaleString()} - ${new Date(validTo).toLocaleString()}`;
    if (visitor.email) {
      await sendEmail({
        to: visitor.email,
        subject: 'Your Visitor Pass',
        text: `Hi ${visitor.firstName},\n\nYour visitor pass (${pass.code}) has been issued.\nValid: ${whenTxt}\n\nPlease present the QR code at entry.\n`
      }).catch(() => {});
    }

    res.status(201).json(pass);
  } catch (err) {
    console.error('issuePass error:', err);
    res.status(500).json({ error: 'Failed to issue pass' });
  }
}

async function getPass(req, res) {
  try {
    const { orgId } = req.user;
    const pass = await Pass.findOne({ _id: req.params.id, orgId })
      .populate('visitorId', 'firstName lastName email phone company photo')
      .populate('appointmentId', 'startTime endTime status')
      .populate('issuedByUserId', 'name email role');
    if (!pass) return res.status(404).json({ error: 'Pass not found' });
    res.json(pass);
  } catch (err) {
    console.error('getPass error:', err);
    res.status(500).json({ error: 'Failed to fetch pass' });
  }
}

async function revokePass(req, res) {
  try {
    const { orgId } = req.user;
    const pass = await Pass.findOne({ _id: req.params.id, orgId });
    if (!pass) return res.status(404).json({ error: 'Pass not found' });
    pass.status = 'revoked';
    await pass.save();
    res.json(pass);
  } catch (err) {
    console.error('revokePass error:', err);
    res.status(500).json({ error: 'Failed to revoke pass' });
  }
}

async function qrPng(req, res) {
  try {
    const { orgId } = req.user;
    const pass = await Pass.findOne({ _id: req.params.id, orgId });
    if (!pass) return res.status(404).json({ error: 'Pass not found' });
    res.setHeader('Content-Type', 'image/png');
    const qrText = pass.code;
    const stream = QRCode.toFileStream(res, qrText, { type: 'png', margin: 1, width: 256 });
    stream.on('error', () => res.status(500).end());
  } catch (err) {
    console.error('qrPng error:', err);
    res.status(500).end();
  }
}

async function badgePdf(req, res) {
  try {
    const { orgId } = req.user;
    const pass = await Pass.findOne({ _id: req.params.id, orgId })
      .populate('visitorId', 'firstName lastName company photo')
      .lean();
    if (!pass) return res.status(404).json({ error: 'Pass not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="pass-${pass.code}.pdf"`);

    const doc = new PDFDocument({ size: [300, 420], margin: 18 });
    doc.pipe(res);
    doc.roundedRect(10, 10, 280, 400, 12).stroke('#e5e7eb');

    doc.fontSize(16).text('Visitor Pass', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(pass.code, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(14).text(`${pass.visitorId?.firstName || ''} ${pass.visitorId?.lastName || ''}`, { align: 'center' });
    if (pass.visitorId?.company) doc.fontSize(11).fillColor('#475569').text(pass.visitorId.company, { align: 'center' }).fillColor('#000');

    doc.moveDown(1);
    const qrData = await QRCode.toDataURL(pass.code, { margin: 0, width: 200 });
    doc.image(qrData, (300 - 200) / 2, doc.y, { width: 200 });

    doc.moveDown(1.2);
    doc.fontSize(10).fillColor('#475569')
      .text(`Valid: ${new Date(pass.validFrom).toLocaleString()} → ${new Date(pass.validTo).toLocaleString()}`, { align: 'center' })
      .fillColor('#000');

    doc.end();
  } catch (err) {
    console.error('badgePdf error:', err);
    res.status(500).json({ error: 'Failed to generate badge' });
  }
}

module.exports = { listPasses, issuePass, getPass, revokePass, qrPng, badgePdf };