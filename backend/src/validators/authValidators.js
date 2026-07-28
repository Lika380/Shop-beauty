const { z } = require('zod');

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('must be a valid email address');

const register = {
  body: z.object({
    email,
    password: z.string().min(6, 'must be at least 6 characters long'),
  }),
};

const login = {
  body: z.object({
    email,
    password: z.string().min(1, 'is required'),
  }),
};

const verify = {
  body: z.object({
    email,
    code: z.string().regex(/^\d{6}$/, 'must be a 6-digit code'),
  }),
};

const resend = {
  body: z.object({
    email,
  }),
};

module.exports = { register, login, verify, resend };
