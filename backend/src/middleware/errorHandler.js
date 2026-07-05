const logger = require("../config/logger");
const { nodeEnv } = require("../config/env");

/**
 * Global error handler. Must be registered LAST in server.js (after all routes).
 * Keeps error messages sent to the client safe (no stack traces / internals
 * leaked in production), while logging full details server-side.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
  });

  // Prisma known error codes -> friendlier messages
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field(s): ${err.meta?.target?.join(", ") || "unknown"}`,
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Requested resource was not found.",
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational || nodeEnv !== "production" ? err.message : "Something went wrong. Please try again later.",
    ...(nodeEnv !== "production" && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
