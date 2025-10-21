const router = require('express').Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const ctrl = require('../controllers/appointmentsController');

router.use(requireAuth);

// Allow visitors to list and view appointments (read-only). Create/update remain host/admin only.
router.get('/', requireRoles('admin', 'security', 'host', 'visitor'), ctrl.listAppointments);
router.post('/', requireRoles('host', 'admin'), ctrl.createAppointment);
router.get('/:id', requireRoles('admin', 'security', 'host', 'visitor'), ctrl.getAppointment);
router.patch('/:id', requireRoles('host', 'admin'), ctrl.updateAppointment);
router.post('/:id/status', requireRoles('host', 'admin'), ctrl.updateAppointmentStatus);

module.exports = router;