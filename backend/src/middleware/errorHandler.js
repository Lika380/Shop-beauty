const AppError = require('../utils/AppError');

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_CHECK_VIOLATION = '23514';

function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    });
  }

  if (err.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({
      error: { message: 'A record with these details already exists', code: 'CONFLICT' },
    });
  }

  if (err.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(400).json({
      error: { message: 'Referenced resource does not exist', code: 'INVALID_REFERENCE' },
    });
  }

  if (err.code === PG_CHECK_VIOLATION) {
    return res.status(400).json({
      error: { message: 'The request violates a data constraint', code: 'CONSTRAINT_VIOLATION' },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
}

module.exports = { errorHandler, notFoundHandler };
