const prisma = require("../../config/prisma");

/**
 * Repository layer: ONLY talks to Prisma/DB. No business logic here.
 * This keeps services testable and swappable (e.g. mock this in unit tests).
 */

function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function createUser(data) {
  return prisma.user.create({ data });
}

function updateLastLogin(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

function storeRefreshToken({ token, userId, expiresAt }) {
  return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}

function findRefreshToken(token) {
  return prisma.refreshToken.findUnique({ where: { token } });
}

function revokeRefreshToken(token) {
  return prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
};
