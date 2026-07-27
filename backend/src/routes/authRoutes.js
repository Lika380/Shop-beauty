const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { register, login, verify, resend } = require('../validators/authValidators');

const router = Router();

router.post('/register', validate(register), authController.register);
router.post('/verify', validate(verify), authController.verify);
router.post('/resend-verification', validate(resend), authController.resendVerification);
router.post('/login', validate(login), authController.login);

module.exports = router;
