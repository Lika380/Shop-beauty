const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { register, login, verify, resend } = require('../validators/authValidators');

const router = Router();

router.post('/register', loginLimiter, validate(register), authController.register);
router.post('/verify', otpLimiter, validate(verify), authController.verify);
router.post('/resend-verification', otpLimiter, validate(resend), authController.resendVerification);
router.post('/login', loginLimiter, validate(login), authController.login);

module.exports = router;
