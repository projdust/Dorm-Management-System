const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");
const { hashPassword } = require("../../auth/password.service");

/**
 * Tenants Service
 * Scope: TENANT record CRUD (linked 1:1 to a User with role TENANT)
 */

const userSummarySelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  isActive: true,
};

function shape(tenant) {
  const activeAssignment = tenant.assignments?.find((a) => a.status === "ACTIVE");
  return {
    id: tenant.id,
    userId: tenant.userId,
    name: `${tenant.user.firstName} ${tenant.user.lastName}`,
    email: tenant.user.email,
    phone: tenant.user.phone,
    studentId: tenant.studentId,
    emergencyContactName: tenant.emergencyContactName,
    emergencyContactPhone: tenant.emergencyContactPhone,
    guardianName: tenant.guardianName,
    guardianPhone: tenant.guardianPhone,
    moveInDate: tenant.moveInDate,
    moveOutDate: tenant.moveOutDate,
    room: activeAssignment ? activeAssignment.bed.room.roomNumber : null,
    bedLabel: activeAssignment ? activeAssignment.bed.bedLabel : null,
    isActive: tenant.isActive,
    status: tenant.isActive ? "ACTIVE" : "INACTIVE",
    createdAt: tenant.createdAt,
  };
}

async function getAll(filters = {}) {
  const { search, status } = filters;

  const where = {
    ...(status && { isActive: status === "ACTIVE" }),
    ...(search && {
      user: {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    }),
  };

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      user: { select: userSummarySelect },
      assignments: {
        where: { status: "ACTIVE" },
        include: { bed: { include: { room: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tenants.map(shape);
}

async function getById(id) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      user: { select: userSummarySelect },
      assignments: {
        where: { status: "ACTIVE" },
        include: { bed: { include: { room: true } } },
      },
    },
  });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }
  return shape(tenant);
}

async function create(data) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    studentId,
    emergencyContactName,
    emergencyContactPhone,
    guardianName,
    guardianPhone,
    moveInDate,
  } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("A user with this email already exists.", 409);
  }

  if (studentId) {
    const existingStudent = await prisma.tenant.findUnique({ where: { studentId } });
    if (existingStudent) {
      throw new AppError("A tenant with this student ID already exists.", 409);
    }
  }

  const passwordHash = await hashPassword(password || "changeme123");

  const tenant = await prisma.tenant.create({
    data: {
      studentId,
      emergencyContactName,
      emergencyContactPhone,
      guardianName,
      guardianPhone,
      moveInDate: moveInDate ? new Date(moveInDate) : null,
      user: {
        create: {
          firstName,
          lastName,
          email,
          phone,
          passwordHash,
          role: "TENANT",
        },
      },
    },
    include: { user: { select: userSummarySelect }, assignments: true },
  });

  return shape({ ...tenant, assignments: [] });
}

async function update(id, data) {
  const existing = await prisma.tenant.findUnique({ where: { id }, include: { user: true } });
  if (!existing) {
    throw new AppError("Tenant not found.", 404);
  }

  const {
    firstName,
    lastName,
    phone,
    studentId,
    emergencyContactName,
    emergencyContactPhone,
    guardianName,
    guardianPhone,
    moveInDate,
    moveOutDate,
    isActive,
  } = data;

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      ...(studentId !== undefined && { studentId }),
      ...(emergencyContactName !== undefined && { emergencyContactName }),
      ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
      ...(guardianName !== undefined && { guardianName }),
      ...(guardianPhone !== undefined && { guardianPhone }),
      ...(moveInDate !== undefined && { moveInDate: moveInDate ? new Date(moveInDate) : null }),
      ...(moveOutDate !== undefined && { moveOutDate: moveOutDate ? new Date(moveOutDate) : null }),
      ...(isActive !== undefined && { isActive }),
      user: {
        update: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
        },
      },
    },
    include: {
      user: { select: userSummarySelect },
      assignments: { where: { status: "ACTIVE" }, include: { bed: { include: { room: true } } } },
    },
  });

  return shape(tenant);
}

async function remove(id) {
  const existing = await prisma.tenant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Tenant not found.", 404);
  }
  // Soft delete: keep records for billing/payment history, just deactivate.
  await prisma.tenant.update({ where: { id }, data: { isActive: false, moveOutDate: new Date() } });
}

module.exports = { getAll, getById, create, update, remove };
