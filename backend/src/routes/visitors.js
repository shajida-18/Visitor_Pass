const router = require('express').Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const ctrl = require('../controllers/visitorsController');

router.use(requireAuth);

router.get('/', requireRoles('admin', 'security', 'host'), ctrl.listVisitors);
router.post('/', requireRoles('admin', 'security', 'host'), ctrl.createVisitor);
router.get('/:id', requireRoles('admin', 'security', 'host'), ctrl.getVisitor);
router.patch('/:id', requireRoles('admin', 'security', 'host'), ctrl.updateVisitor);
router.delete('/:id', requireRoles('admin'), ctrl.deleteVisitor);

module.exports = router;