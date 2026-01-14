const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate limiter for authentication endpoints (login, register)
 * Stricter limits to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    logger.logSecurity('rate_limit_exceeded_auth', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });

    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * General API rate limiter
 * More lenient for regular API usage
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    logger.logSecurity('rate_limit_exceeded_api', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Strict limiter for sensitive operations
 * Used for password resets, email changes, etc.
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 1 hour.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('rate_limit_exceeded_strict', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });

    res.status(429).json({
      success: false,
      message: 'Too many attempts for this sensitive operation. Please try again in 1 hour.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter
};
