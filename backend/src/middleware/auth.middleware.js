const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifyAccessToken } = require("../auth/token.service");
const prisma = require("../config/prisma");

/**
 * Verifies the Bearer access token and attaches `req.user`.
 * Use on every protected route.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required.", 401);
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw new AppError("Invalid or expired token.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true, firstName: true, lastName: true },
  });

  if (!user || !user.isActive) {
    throw new AppError("Account not found or deactivated.", 401);
  }

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Usage: authorize("ADMIN", "STAFF")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action.", 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
