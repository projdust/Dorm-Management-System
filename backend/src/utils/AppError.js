/**
 * Standard application error class.
 * Use this instead of throwing raw errors so the global error handler
 * can return consistent, safe responses to the client.
 *
 * Example:
 *   throw new AppError("Email already registered", 409);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
