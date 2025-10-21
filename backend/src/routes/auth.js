// add this route handler entry in your existing auth router file
const router = require('express').Router();
const ctrl = require('../controllers/authController');

// existing endpoints...
router.post('/register-org', ctrl.registerOrg);
router.post('/login', ctrl.login);

// NEW: visitor login by email (no password)
router.post('/visitor-login', ctrl.visitorLogin);

router.get('/me', require('../middleware/auth').requireAuth, ctrl.me);

module.exports = router;