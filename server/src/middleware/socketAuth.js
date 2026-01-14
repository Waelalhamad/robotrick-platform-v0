/**
 * Socket.IO Authentication Middleware
 *
 * Authenticates WebSocket connections using JWT tokens
 * Prevents unauthorized access to real-time features
 *
 * Best Practices:
 * - Verify JWT token before allowing connection
 * - Attach user information to socket instance
 * - Support for different authentication methods
 * - Clear error messages
 */

const { verifyJwt } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Socket.IO Authentication Middleware
 *
 * Usage:
 *   io.use(socketAuthMiddleware);
 *
 * Client must send token in one of these ways:
 * 1. In auth object: socket.auth = { token: 'jwt_token' }
 * 2. In query string: ?token=jwt_token
 * 3. In cookie (if available)
 *
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Function} next - Callback function
 */
function socketAuthMiddleware(socket, next) {
  try {
    // Extract token from various sources
    const token = extractToken(socket);

    if (!token) {
      const error = new Error('Authentication required');
      error.data = {
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      };
      return next(error);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (jwtError) {
      const error = new Error('Authentication failed');
      error.data = {
        message: jwtError.message === 'jwt expired'
          ? 'Token has expired. Please log in again.'
          : 'Invalid authentication token',
        code: jwtError.message === 'jwt expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      };
      return next(error);
    }

    // Attach user information to socket
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;

    // Log successful authentication (for monitoring)
    logger.info(`Socket.IO user authenticated: ${decoded.email} (${socket.id})`);

    // Continue with connection
    next();

  } catch (error) {
    logger.logError(error, { context: 'Socket.IO authentication' });
    const authError = new Error('Authentication error');
    authError.data = {
      message: 'An error occurred during authentication',
      code: 'AUTH_ERROR'
    };
    next(authError);
  }
}

/**
 * Extract JWT token from socket handshake
 *
 * Checks multiple sources in order of preference:
 * 1. auth.token (recommended)
 * 2. headers.authorization
 * 3. query.token
 * 4. cookies (if cookie-parser is used)
 *
 * @param {Socket} socket - Socket.IO socket instance
 * @returns {string|null} - JWT token or null
 */
function extractToken(socket) {
  // Method 1: From auth object (recommended)
  if (socket.handshake.auth && socket.handshake.auth.token) {
    return socket.handshake.auth.token;
  }

  // Method 2: From Authorization header
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Method 3: From query string
  if (socket.handshake.query && socket.handshake.query.token) {
    return socket.handshake.query.token;
  }

  // Method 4: From cookies
  if (socket.handshake.headers.cookie) {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    if (cookies.token || cookies.authToken) {
      return cookies.token || cookies.authToken;
    }
  }

  return null;
}

/**
 * Simple cookie parser
 * @param {string} cookieString - Cookie header string
 * @returns {Object} - Parsed cookies
 */
function parseCookies(cookieString) {
  return cookieString.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

/**
 * Middleware to check if user has specific role
 *
 * Usage (in Socket.IO event handler):
 *   socket.on('admin:action', requireRole('admin'), (data) => { ... });
 *
 * @param {string|Array<string>} allowedRoles - Role(s) required
 * @returns {Function} - Middleware function
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (socket, data, next) => {
    if (!socket.userRole || !roles.includes(socket.userRole)) {
      const error = new Error('Forbidden');
      error.data = {
        message: 'You do not have permission to perform this action',
        code: 'FORBIDDEN',
        requiredRole: allowedRoles
      };
      return next(error);
    }
    next();
  };
}

/**
 * Rate limiter for Socket.IO events
 * Prevents spam and abuse
 *
 * @param {number} maxEvents - Maximum events per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Middleware function
 */
function socketRateLimit(maxEvents = 10, windowMs = 60000) {
  const clients = new Map();

  return (socket, data, next) => {
    const now = Date.now();
    const clientData = clients.get(socket.id) || { count: 0, resetTime: now + windowMs };

    // Reset if window has passed
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + windowMs;
    }

    // Increment count
    clientData.count++;
    clients.set(socket.id, clientData);

    // Check limit
    if (clientData.count > maxEvents) {
      const error = new Error('Rate limit exceeded');
      error.data = {
        message: 'Too many events. Please slow down.',
        code: 'RATE_LIMIT',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000) + ' seconds'
      };
      return next(error);
    }

    next();
  };
}

module.exports = {
  socketAuthMiddleware,
  requireRole,
  socketRateLimit,
  extractToken
};
