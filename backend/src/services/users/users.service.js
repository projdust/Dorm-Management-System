const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");
const { hashPassword } = require("../../auth/password.service");

/**
 * User & Role Management Service
 * Scope: Admin-managed User CRUD, role assignment (ADMIN, STAFF, TENANT)
 */

const publicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
};

async function getAll(filters = {}) {
  const { search, role, isActive } = filters;
  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === "true" }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  return prisma.user.findMany({ where, select: publicSelect, orderBy: { createdAt: "desc" } });
}

async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  return user;
}

async function create(data) {
  const { firstName, lastName, email, phone, password, role } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password || "changeme123");

  const user = await prisma.user.create({
    data: { firstName, lastName, email, phone, passwordHash, role: role || "TENANT" },
    select: publicSelect,
  });

  return user;
}

async function update(id, data) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("User not found.", 404);
  }

  const { firstName, lastName, phone, role, isActive } = data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: publicSelect,
  });

  return user;
}

async function remove(id) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("User not found.", 404);
  }
  // Soft delete: deactivate rather than hard-delete, to preserve FK history
  // (audit logs, announcements authored, maintenance requests, etc).
  await prisma.user.update({ where: { id }, data: { isActive: false } });
}

module.exports = { getAll, getById, create, update, remove };
