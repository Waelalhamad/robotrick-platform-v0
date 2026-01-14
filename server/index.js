const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const multer = require("multer");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8081",
      "http://localhost:19000",
      "http://localhost:19001",
      "http://localhost:19006",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// CORS configuration - Allow web and mobile app origins
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://localhost:5174", // Alternate web port
  "http://localhost:8081", // Expo/React Native mobile app (localhost)
  "http://localhost:19000", // Expo DevTools
  "http://localhost:19001", // Expo Metro bundler
  "http://localhost:19006", // Expo web
  "http://192.168.1.133:8081", // Mobile app on network IP
  "exp://192.168.1.133:8081", // Expo scheme
];

// Helper to check if origin is allowed (handles wildcard IPs for mobile testing)
const isOriginAllowed = (origin) => {
  if (!origin) return false;

  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;

  // Allow any localhost ports for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;

  // Allow any local network IP on port 8081 (Expo default) or 4889 for mobile testing
  if (origin.match(/http:\/\/192\.168\.\d+\.\d+:(8081|19000|19001|19006)/)) return true;

  return false;
};

// CORS middleware - Enhanced for mobile support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const platform = req.headers['x-platform']; // mobile or web

  // Check if origin is allowed (uses helper function for flexible matching)
  if (isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Platform, X-Requested-With, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "set-cookie, Authorization");

    // Log platform for debugging in development
    if (platform && process.env.NODE_ENV !== 'production') {
      console.log(`📱 Request from ${platform} platform: ${req.method} ${req.url}`);
    }
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Simple test endpoint (NO DB) - BEFORE DB middleware
app.get("/test", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HAS_MONGO_URI: !!process.env.MONGO_URI,
      MONGO_URI_PREFIX: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + "..." : "NOT SET",
      VERCEL: process.env.VERCEL
    }
  });
});

// DB Connection Middleware for Vercel (ensures connection before each request)
// Applied to all routes below this point
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ DB Connection failed:", error);
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
      details: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Root endpoint - Status UI
app.get("/", (req, res) => {
  const hasMongoUri = !!process.env.MONGO_URI;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const nodeEnv = process.env.NODE_ENV || 'not set';
  const isMongoConnected = mongoose.connection.readyState === 1;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Robotric Server Status</title>
      <style>
        body { font-family: Arial; padding: 40px; background: #0f172a; color: #e2e8f0; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #38bdf8; }
        .status { padding: 15px; margin: 10px 0; border-radius: 8px; }
        .success { background: #065f46; border-left: 4px solid #10b981; }
        .error { background: #7f1d1d; border-left: 4px solid #ef4444; }
        .warning { background: #78350f; border-left: 4px solid #f59e0b; }
        .info { background: #1e3a8a; border-left: 4px solid #3b82f6; }
        code { background: #1e293b; padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Robotric Server Status</h1>

        <div class="status ${nodeEnv === 'production' ? 'success' : 'warning'}">
          <strong>Environment:</strong> ${nodeEnv}
        </div>

        <div class="status ${hasMongoUri ? 'success' : 'error'}">
          <strong>MongoDB URI:</strong> ${hasMongoUri ? '✓ Configured' : '✗ Missing'}
        </div>

        <div class="status ${hasJwtSecret ? 'success' : 'error'}">
          <strong>JWT Secret:</strong> ${hasJwtSecret ? '✓ Configured' : '✗ Missing'}
        </div>

        <div class="status ${isMongoConnected ? 'success' : 'error'}">
          <strong>MongoDB Connection:</strong> ${isMongoConnected ? '✓ Connected' : '✗ Not Connected'}
          <br><small>ReadyState: ${mongoose.connection.readyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)</small>
        </div>

        <div class="status info">
          <strong>Server Time:</strong> ${new Date().toISOString()}
        </div>

        <div class="status info">
          <strong>Vercel:</strong> ${process.env.VERCEL === '1' ? 'Yes (Serverless)' : 'No (Local)'}
        </div>

        <hr style="border-color: #334155; margin: 30px 0;">

        <div style="text-align: center;">
          <a href="/api/health" style="color: #38bdf8; text-decoration: none;">Test Health Endpoint →</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health endpoint (no DB needed)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Routes
// Inject io into services that need to emit
require("./src/services/stock.service").setIo(io);

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/parts", require("./src/routes/parts.routes"));
app.use("/api/stock", require("./src/routes/stock.routes"));
app.use("/api/orders", require("./src/routes/orders.routes"));
app.use("/api/projects", require("./src/routes/projects.routes"));
app.use("/api/competitions", require("./src/routes/competitions.routes"));
app.use("/api/teams", require("./src/routes/teams.routes"));
app.use("/api/posts", require("./src/routes/posts.routes"));
app.use("/api/images", require("./src/routes/image.routes"));
app.use("/api/users", require("./src/routes/users.routes"));

// Student routes
app.use("/api/student/courses", require("./src/routes/student.courses.routes"));
app.use("/api/student/modules", require("./src/routes/student.modules.routes"));
app.use("/api/student/quizzes", require("./src/routes/student.quizzes.routes"));
app.use("/api/student/assignments", require("./src/routes/student.assignments.routes"));
app.use("/api/student/attendance", require("./src/routes/student.attendance.routes"));
app.use("/api/student/payments", require("./src/routes/student.payments.routes"));
app.use("/api/student/dashboard", require("./src/routes/student.dashboard.routes"));

// Trainer routes
app.use("/api/trainer/dashboard", require("./src/routes/trainer.dashboard.routes"));
app.use("/api/trainer/groups", require("./src/routes/trainer.groups.routes"));
app.use("/api/trainer/sessions", require("./src/routes/trainer.sessions.routes"));
app.use("/api/trainer/attendance", require("./src/routes/trainer.attendance.routes"));
app.use("/api/trainer/evaluations", require("./src/routes/trainer.evaluations.routes"));
app.use("/api/trainer/quizzes", require("./src/routes/trainer.quizzes.routes"));

// Reception routes - Manages student/trainer accounts, enrollments, schedules, and leads
app.use("/api/reception", require("./src/routes/reception.routes"));

// CLO routes - Chief Learning Officer manages trainers, courses, groups, and analytics
app.use("/api/clo", require("./src/routes/clo.routes"));

app.use("/uploads", express.static("uploads"));

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large (max 5MB)" });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ success: false, message: "Too many files (max 10)" });
    }
  }
  if (
    error.message &&
    (error.message.includes("Invalid file format") ||
      error.message.includes("Only image files"))
  ) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
const logger = require('./src/utils/logger');
const { formatErrorResponse, isOperationalError } = require('./src/utils/errors');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log error with context
  logger.logError(err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user || null
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Format error response
  const isDev = process.env.NODE_ENV !== 'production';
  const response = formatErrorResponse(err, isDev);

  // Send response
  res.status(statusCode).json(response);
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("admin:join", () => {
    socket.join("admins");
  });
  socket.on("admin:leave", () => {
    socket.leave("admins");
  });
  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

// DB
const mongoose = require("mongoose");

// Database connection function with caching for serverless
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("📦 Using existing database connection");
    return;
  }

  const atlasUri = process.env.MONGO_URI;
  const localUri = "mongodb://localhost:27017/robotrick";
  const isProduction = process.env.NODE_ENV === "production";

  try {
    if (isProduction) {
      if (!atlasUri) {
        throw new Error("No MongoDB Atlas URI configured in production");
      }
      console.log("🔄 Connecting to MongoDB Atlas (Production)...");
      await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log("✅ MongoDB Atlas connected successfully");
    } else {
      // In development, try local first, then Atlas
      try {
        console.log("🔄 Connecting to Local MongoDB...");
        await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log("✅ Local MongoDB connected successfully");
      } catch (localErr) {
        console.log("⚠️  Failed to connect to local MongoDB, trying Atlas...");
        if (!atlasUri) {
          throw new Error("No MongoDB configured");
        }
        await mongoose.connect(atlasUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ MongoDB Atlas connected successfully");
      }
    }
    isConnected = true;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Note: DB connection middleware removed from here - DB connects on startup for local
// and on first request for Vercel serverless (handled in start function)

// Start server for local development ONLY
if (process.env.VERCEL !== "1") {
  const port = process.env.PORT || 4889;

  // Connect to database then start server
  connectDB()
    .then(() => {
      server.listen(port, () => {
        console.log(`✅ Server started successfully on port ${port}`);
        console.log(`📍 API: http://localhost:${port}/api`);
        console.log(`🏥 Health: http://localhost:${port}/api/health`);
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    });
} else {
  // In Vercel, connect to DB on first request (already handled by connectDB caching)
  console.log("🔧 Running in Vercel serverless environment");
}

// Export app immediately for Vercel (don't wait for anything)
module.exports = app;
