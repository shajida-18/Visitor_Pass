const Visitor = require('../models/Visitor');

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});
}

async function listVisitors(req, res) {
  const { orgId } = req.user;
  const { q, limit = 20, page = 1 } = req.query;

  const filter = { orgId };
  if (q) {
    filter.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { company: new RegExp(q, 'i') }
    ];
  }

  const [items, total] = await Promise.all([
    Visitor.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Visitor.countDocuments(filter)
  ]);

  res.json({
    items,
    total,
    page: Number(page),
    limit: Number(limit)
  });
}

async function createVisitor(req, res) {
  const { orgId } = req.user;
  const data = pick(req.body, ['firstName', 'lastName', 'email', 'phone', 'company', 'notes']);
  if (!data.firstName) return res.status(400).json({ error: 'firstName is required' });

  const doc = await Visitor.create({ ...data, orgId });
  res.status(201).json(doc);
}

async function getVisitor(req, res) {
  const { orgId } = req.user;
  const v = await Visitor.findOne({ _id: req.params.id, orgId });
  if (!v) return res.status(404).json({ error: 'Visitor not found' });
  res.json(v);
}

async function updateVisitor(req, res) {
  const { orgId } = req.user;
  const data = pick(req.body, ['firstName', 'lastName', 'email', 'phone', 'company', 'notes']);

  const v = await Visitor.findOneAndUpdate(
    { _id: req.params.id, orgId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!v) return res.status(404).json({ error: 'Visitor not found' });
  res.json(v);
}

async function deleteVisitor(req, res) {
  const { orgId } = req.user;
  const result = await Visitor.deleteOne({ _id: req.params.id, orgId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Visitor not found' });
  res.status(204).send();
}

module.exports = { listVisitors, createVisitor, getVisitor, updateVisitor, deleteVisitor };