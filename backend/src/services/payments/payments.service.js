const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Payments Service
 * Scope: Rent payment records per Tenant (Payment model)
 */

function shape(payment) {
  return {
    id: payment.id,
    tenantId: payment.tenantId,
    tenantName: `${payment.tenant.user.firstName} ${payment.tenant.user.lastName}`,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    periodStart: payment.periodStart,
    periodEnd: payment.periodEnd,
    paidAt: payment.paidAt,
    referenceCode: payment.referenceCode,
    notes: payment.notes,
    createdAt: payment.createdAt,
  };
}

const include = { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } };

async function getAll(filters = {}) {
  const { status, tenantId, method } = filters;
  const where = {
    ...(status && { status }),
    ...(tenantId && { tenantId }),
    ...(method && { method }),
  };

  const payments = await prisma.payment.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return payments.map(shape);
}

async function getById(id) {
  const payment = await prisma.payment.findUnique({ where: { id }, include });
  if (!payment) {
    throw new AppError("Payment not found.", 404);
  }
  return shape(payment);
}

async function create(data) {
  const { tenantId, amount, method, periodStart, periodEnd, status, referenceCode, notes } = data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }

  const resolvedStatus = status || "PENDING";

  const payment = await prisma.payment.create({
    data: {
      tenantId,
      amount,
      method,
      status: resolvedStatus,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      paidAt: resolvedStatus === "PAID" ? new Date() : null,
      referenceCode,
      notes,
    },
    include,
  });

  return shape(payment);
}

async function update(id, data) {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Payment not found.", 404);
  }

  const { amount, method, status, periodStart, periodEnd, referenceCode, notes } = data;

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(amount !== undefined && { amount }),
      ...(method !== undefined && { method }),
      ...(status !== undefined && { status, paidAt: status === "PAID" ? new Date() : existing.paidAt }),
      ...(periodStart !== undefined && { periodStart: new Date(periodStart) }),
      ...(periodEnd !== undefined && { periodEnd: new Date(periodEnd) }),
      ...(referenceCode !== undefined && { referenceCode }),
      ...(notes !== undefined && { notes }),
    },
    include,
  });

  return shape(payment);
}

async function remove(id) {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Payment not found.", 404);
  }
  await prisma.payment.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
