const bcrypt = require('bcrypt');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const { generateCode, getExpiryDate } = require('../utils/otp');
const { sendVerificationEmail } = require('../utils/email');
const userModel = require('../models/userModel');
const emailVerificationModel = require('../models/emailVerificationModel');

const SALT_ROUNDS = 10;
const isProduction = process.env.NODE_ENV === 'production';

async function issueVerificationCode(userId, email) {
  const code = generateCode();
  await emailVerificationModel.upsertCode(userId, code, getExpiryDate());
  sendVerificationEmail(email, code);
  return code;
}

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ email, passwordHash, role: 'customer' });
  const code = await issueVerificationCode(user.id, user.email);

  res.status(201).json({
    message: 'Registered. Check your email for the 6-digit verification code.',
    email: user.email,
    ...(isProduction ? {} : { dev_verification_code: code }),
  });
});

const verify = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw AppError.badRequest('Invalid email or code', 'INVALID_CODE');
  }

  if (user.email_verified) {
    throw AppError.badRequest('Email is already verified', 'ALREADY_VERIFIED');
  }

  const verification = await emailVerificationModel.findByUserId(user.id);
  if (!verification || verification.code !== code || verification.expires_at < new Date()) {
    throw AppError.badRequest('Invalid or expired verification code', 'INVALID_CODE');
  }

  const verifiedUser = await userModel.markEmailVerified(user.id);
  await emailVerificationModel.remove(user.id);

  const token = signToken({ user_id: verifiedUser.id, role: verifiedUser.role });
  res.json({ token, user: verifiedUser });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findByEmail(email);
  let code;
  if (user && !user.email_verified) {
    code = await issueVerificationCode(user.id, user.email);
  }

  res.json({
    message: 'If an account with this email exists and is not yet verified, a new code has been sent.',
    email,
    ...(isProduction ? {} : { dev_verification_code: code }),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.email_verified) {
    throw AppError.forbidden('Please verify your email before logging in', 'EMAIL_NOT_VERIFIED');
  }

  const token = signToken({ user_id: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at,
    },
  });
});

module.exports = { register, verify, resendVerification, login };
