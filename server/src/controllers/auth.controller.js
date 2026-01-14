const bcrypt = require("bcryptjs");
const Joi = require("joi");
const User = require("../models/User");
const { signJwt } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const { ValidationError, UnauthorizedError, ConflictError, NotFoundError } = require("../utils/errors");
const logger = require("../utils/logger");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid("student", "admin", "judge", "editor", "organizer", "superadmin")
    .optional(),
});

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    throw new ValidationError(error.message);
  }

  const { name, email, password, role } = value;

  logger.logDB('findOne', 'User', { email });

  const existing = await User.findOne({ email });

  if (existing) {
    throw new ConflictError('Email already used', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  logger.logDB('create', 'User', { email, role: role || 'student' });

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "student",
  });

  logger.logAuth('register', { id: user._id, email: user.email, role: user.role });

  res.json({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Login a user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    throw new ValidationError(error.message);
  }

  const { email, password } = value;

  logger.logDB('findOne', 'User', { email });

  const user = await User.findOne({ email });

  if (!user) {
    logger.logSecurity('login_failed', { email, reason: 'user_not_found' });
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Check if user is inactive (deactivated)
  if (user.profile && user.profile.status === 'inactive') {
    logger.logSecurity('login_failed', { email, userId: user._id, reason: 'user_inactive' });
    throw new UnauthorizedError('Account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    logger.logSecurity('login_failed', { email, userId: user._id, reason: 'wrong_password' });
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const token = signJwt({ id: user._id, role: user.role, name: user.name });

  // Check if request is from mobile app (via X-Platform header)
  const isMobile = req.headers['x-platform'] === 'mobile';

  logger.logAuth('login', {
    id: user._id,
    email: user.email,
    role: user.role,
    platform: isMobile ? 'mobile' : 'web'
  });

  const responseData = {
    _id: user._id,
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    assignedCompetitionId: user.assignedCompetitionId,
  };

  if (isMobile) {
    // Mobile: Send token in response body
    responseData.token = token;
  } else {
    // Web: Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 3600 * 1000,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: "/",
    });
  }

  res.json(responseData);
});

/**
 * Logout a user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  logger.logAuth('logout', req.user || {});

  res.clearCookie("token", {
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    path: "/"
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  logger.logDB('findById', 'User', { id: req.user.id });

  const user = await User.findById(req.user.id).lean();

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    _id: user._id,
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    assignedCompetitionId: user.assignedCompetitionId,
  });
});

module.exports = { register, login, logout, me };
