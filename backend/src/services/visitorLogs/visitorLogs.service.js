const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Visitor Logs Service
 * Scope: VisitorLog check-in/check-out per Tenant
 */

function shape(log) {
  return {
    id: log.id,
    tenantId: log.tenantId,
    tenantName: `${log.tenant.user.firstName} ${log.tenant.user.lastName}`,
    visitorName: log.visitorName,
    visitorContact: log.visitorContact,
    purpose: log.purpose,
    checkInTime: log.checkInTime,
    checkOutTime: log.checkOutTime,
    status: log.status,
  };
}

const include = { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } };

async function getAll(filters = {}) {
  const { status, tenantId, search } = filters;
  const where = {
    ...(status && { status }),
    ...(tenantId && { tenantId }),
    ...(search && { visitorName: { contains: search, mode: "insensitive" } }),
  };

  const logs = await prisma.visitorLog.findMany({
    where,
    include,
    orderBy: { checkInTime: "desc" },
  });

  return logs.map(shape);
}

async function getById(id) {
  const log = await prisma.visitorLog.findUnique({ where: { id }, include });
  if (!log) {
    throw new AppError("Visitor log not found.", 404);
  }
  return shape(log);
}

async function create(data) {
  const { tenantId, visitorName, visitorContact, purpose } = data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }

  const log = await prisma.visitorLog.create({
    data: {
      tenantId,
      visitorName,
      visitorContact,
      purpose,
      checkInTime: new Date(),
      status: "CHECKED_IN",
    },
    include,
  });

  return shape(log);
}

async function update(id, data) {
  const existing = await prisma.visitorLog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Visitor log not found.", 404);
  }

  const { checkOut, purpose, visitorContact } = data;

  const log = await prisma.visitorLog.update({
    where: { id },
    data: {
      ...(purpose !== undefined && { purpose }),
      ...(visitorContact !== undefined && { visitorContact }),
      ...(checkOut && { status: "CHECKED_OUT", checkOutTime: new Date() }),
    },
    include,
  });

  return shape(log);
}

async function remove(id) {
  const existing = await prisma.visitorLog.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Visitor log not found.", 404);
  }
  await prisma.visitorLog.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
