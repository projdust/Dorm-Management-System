const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" })); // limits body size, mitigates some DoS vectors
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// --- Rate limiting (protect auth endpoints from brute force) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy.", timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use("/api/v1", routes);

// --- 404 + global error handler (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
