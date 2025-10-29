const router = require('express').Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const ctrl = require('../controllers/checkLogsController');

router.use(requireAuth);

router.post('/scan', requireRoles('security', 'admin'), ctrl.scanAndLog);
router.get('/', requireRoles('admin', 'security', 'host'), ctrl.listLogs);
router.get('/export.csv', requireRoles('admin', 'security'), ctrl.exportCsv);

module.exports = router;
