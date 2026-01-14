/**
 * Security Middleware Configuration
 *
 * Centralized security middleware for production-ready application:
 * - Rate limiting to prevent brute force and DoS attacks
 * - Helmet for security headers (XSS, clickjacking, etc.)
 * - NoSQL injection protection
 * - CORS configuration
 *
 * Best Practices:
 * - Layered security approach
 * - Configurable for different environments
 * - Clear error messages for rate limiting
 * - Scalable architecture
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

/**
 * Rate Limiter for Authentication Endpoints
 * Prevents brute force attacks on login/register
 *
 * Configuration:
 * - 5 requests per 15 minutes
 * - Strict for security-critical endpoints
 * - Skip rate limiting in development for localhost
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      // Skip for localhost/loopback addresses
      return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  },
  // Skip successful requests (only count failures)
  skipSuccessfulRequests: false,
  // Handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + ' minutes'
    });
  }
});

/**
 * Rate Limiter for General API Endpoints
 * Prevents API abuse and DoS attacks
 *
 * Configuration:
 * - 100 requests per 15 minutes
 * - More lenient for general API usage
 * - Skip rate limiting in development for localhost
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks and localhost in development
  skip: (req) => {
    if (req.path === '/api/health') return true;

    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      // Skip for localhost/loopback addresses
      return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

/**
 * Strict Rate Limiter for Expensive Operations
 * For operations that are resource-intensive
 *
 * Configuration:
 * - 10 requests per hour
 * - Very strict to prevent resource exhaustion
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Helmet Configuration
 * Sets various HTTP headers for security
 *
 * Features:
 * - Content Security Policy (CSP)
 * - XSS Protection
 * - Clickjacking Protection
 * - HSTS (for production HTTPS)
 * - Hide X-Powered-By header
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Allow images from various sources
      connectSrc: ["'self'"], // API calls only to same origin
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"], // Prevent embedding in iframes
    },
  },

  // HTTP Strict Transport Security (HSTS)
  // Only enable in production with HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },

  // XSS Protection (legacy browsers)
  xssFilter: true,

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

/**
 * MongoDB Sanitization Configuration
 * Prevents NoSQL injection attacks
 *
 * Removes keys that start with '$' or contain '.'
 */
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_'
});

/**
 * CORS Configuration
 * Properly configured Cross-Origin Resource Sharing
 *
 * Features:
 * - Whitelist specific origins
 * - Support for credentials (cookies)
 * - Preflight caching
 */
function configureCORS() {
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    // Add additional origins for development/staging
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173', 'http://localhost:3000'] : [])
  ].filter(Boolean);

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.logSecurity('cors_blocked', { origin, path: req.path });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200, // Legacy browser support
    maxAge: 86400, // 24 hours preflight cache
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
  };
}

/**
 * Security Logging Middleware
 * Logs security-related events
 */
function securityLogger(req, res, next) {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\$where/i,
    /\$ne/i,
    /<script/i,
    /javascript:/i,
    /onerror=/i
  ];

  const bodyStr = JSON.stringify(req.body || {});
  const queryStr = JSON.stringify(req.query || {});

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(bodyStr) || pattern.test(queryStr)) {
      logger.logSecurity('suspicious_pattern', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.toString()
      });
    }
  });

  next();
}

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  helmetConfig,
  mongoSanitizeConfig,
  configureCORS,
  securityLogger
};
