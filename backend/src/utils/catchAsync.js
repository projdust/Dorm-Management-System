/**
 * Wraps an async controller/middleware function so any thrown error
 * (or rejected promise) is automatically forwarded to Express's
 * error-handling middleware via next(err).
 *
 * Usage:
 *   router.post("/login", catchAsync(authController.login));
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
