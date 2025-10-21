const router = require('express').Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const { createUser, listUsers } = require('../controllers/userController');

router.use(requireAuth);

// Simple routes without express-validator
router.get('/', requireRoles('admin'), listUsers);
router.post('/', requireRoles('admin'), createUser);

module.exports = router;