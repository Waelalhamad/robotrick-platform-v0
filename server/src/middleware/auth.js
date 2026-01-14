const { verifyJwt } = require("../utils/jwt");

function requireAuth(req, res, next) {
  // Check for token in multiple places:
  // 1. Cookie (for web browsers)
  // 2. Authorization header (for mobile apps)
  let token = req.cookies?.token;

  // If no cookie, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Ensure both `id`, `_id`, and `userId` are available for compatibility
  req.user = {
    ...decoded,
    _id: decoded.id || decoded._id,
    userId: decoded.id || decoded._id
  };
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// Reception role middleware
function requireReception(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const allowedRoles = ['reception', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Reception privileges required." });
  }
  next();
}

// Trainer role middleware
function requireTrainer(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const allowedRoles = ['trainer', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Trainer privileges required." });
  }
  next();
}

// CLO role middleware
function requireCLO(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const allowedRoles = ['clo', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. CLO privileges required." });
  }
  next();
}

module.exports = {
  protect: requireAuth,
  restrictTo: (...roles) => requireRoles(...roles),
  requireReception,
  requireTrainer,
  requireCLO,
};
