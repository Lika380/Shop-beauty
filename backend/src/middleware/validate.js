const AppError = require('../utils/AppError');

function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const issue = result.error.issues[0];
        const field = issue.path.join('.') || key;
        return next(AppError.badRequest(`${field}: ${issue.message}`, 'VALIDATION_ERROR'));
      }
      req[key] = result.data;
    }
    next();
  };
}

module.exports = validate;
