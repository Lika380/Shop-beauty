const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.user_id, role: payload.role };
    next();
  } catch (err) {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}

module.exports = auth;
