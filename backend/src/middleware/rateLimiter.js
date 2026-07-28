const rateLimit = require('express-rate-limit');

function tooManyRequestsHandler(req, res) {
  res.status(429).json({
    error: { message: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
  });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
});

module.exports = { loginLimiter, otpLimiter };
