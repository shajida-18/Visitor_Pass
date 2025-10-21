const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');

function isWithinValidity(pass, at = new Date()) { return at >= pass.validFrom && at <= pass.validTo; }

async function scanAndLog(req, res) {
  const { orgId, userId } = req.user;
  const { code, type, location } = req.body;

  const pass = await Pass.findOne({ code, orgId });
  if (!pass) return res.status(404).json({ error: 'Pass not found' });
  if (pass.status === 'revoked') return res.status(400).json({ error: 'Pass revoked' });

  const now = new Date();
  if (!isWithinValidity(pass, now)) {
    if (now > pass.validTo && pass.status !== 'expired') { pass.status = 'expired'; await pass.save(); }
    return res.status(400).json({ error: 'Pass is not currently valid' });
  }

  if (type === 'checkin' && pass.status === 'issued') pass.status = 'active';
  await pass.save();

  const log = await CheckLog.create({
    orgId, passId: pass._id, visitorId: pass.visitorId,
    scannedByUserId: userId, type, location, method: 'qr', timestamp: now
  });

  res.status(201).json({ pass, log });
}

async function listLogs(req, res) {
  const { orgId } = req.user;
  const { type, visitorId, from, to, limit = 20, page = 1 } = req.query;
  const filter = { orgId };
  if (type) filter.type = type;
  if (visitorId) filter.visitorId = visitorId;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  const [items, total] = await Promise.all([
    CheckLog.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('visitorId', 'firstName lastName email phone')
      .populate('passId', 'code status validFrom validTo'),
    CheckLog.countDocuments(filter)
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
}

async function exportCsv(req, res) {
  const { orgId } = req.user;
  const items = await CheckLog.find({ orgId })
    .sort({ timestamp: -1 })
    .populate('visitorId', 'firstName lastName email phone')
    .populate('passId', 'code status validFrom validTo');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="checklogs.csv"');

  const header = 'timestamp,type,code,visitor,visitor_email,status,validFrom,validTo\n';
  res.write(header);
  for (const l of items) {
    const row = [
      l.timestamp?.toISOString() || '',
      l.type || '',
      l.passId?.code || '',
      `${l.visitorId?.firstName || ''} ${l.visitorId?.lastName || ''}`.trim(),
      l.visitorId?.email || '',
      l.passId?.status || '',
      l.passId?.validFrom?.toISOString() || '',
      l.passId?.validTo?.toISOString() || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    res.write(row + '\n');
  }
  res.end();
}

module.exports = { scanAndLog, listLogs, exportCsv };