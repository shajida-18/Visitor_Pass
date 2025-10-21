const router = require('express').Router();
const ctrl = require('../controllers/publicController');

// Visitor pre-registration (no auth)
router.post('/pre-register', ctrl.preRegister);
// Public pass view by code (for mobile link)
router.get('/pass/:code', ctrl.getPassPublic);

module.exports = router;