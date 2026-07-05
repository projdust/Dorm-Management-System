const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Utility Billing Service
 * Scope: Utility bills per Tenant (Bill model: ELECTRICITY/WATER/INTERNET/OTHER)
 */

function shape(bill) {
  return {
    id: bill.id,
    tenantId: bill.tenantId,
    tenantName: `${bill.tenant.user.firstName} ${bill.tenant.user.lastName}`,
    type: bill.type,
    amount: bill.amount,
    status: bill.status,
    billingMonth: bill.billingMonth,
    dueDate: bill.dueDate,
    paidAt: bill.paidAt,
    createdAt: bill.createdAt,
  };
}

const include = { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } };

async function getAll(filters = {}) {
  const { status, tenantId, type } = filters;
  const where = {
    ...(status && { status }),
    ...(tenantId && { tenantId }),
    ...(type && { type }),
  };

  const bills = await prisma.bill.findMany({
    where,
    include,
    orderBy: { dueDate: "asc" },
  });

  return bills.map(shape);
}

async function getById(id) {
  const bill = await prisma.bill.findUnique({ where: { id }, include });
  if (!bill) {
    throw new AppError("Bill not found.", 404);
  }
  return shape(bill);
}

async function create(data) {
  const { tenantId, type, amount, billingMonth, dueDate, status } = data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }

  const bill = await prisma.bill.create({
    data: {
      tenantId,
      type,
      amount,
      billingMonth: new Date(billingMonth),
      dueDate: new Date(dueDate),
      status: status || "UNPAID",
    },
    include,
  });

  return shape(bill);
}

async function update(id, data) {
  const existing = await prisma.bill.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Bill not found.", 404);
  }

  const { type, amount, billingMonth, dueDate, status } = data;

  const bill = await prisma.bill.update({
    where: { id },
    data: {
      ...(type !== undefined && { type }),
      ...(amount !== undefined && { amount }),
      ...(billingMonth !== undefined && { billingMonth: new Date(billingMonth) }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      ...(status !== undefined && { status, paidAt: status === "PAID" ? new Date() : existing.paidAt }),
    },
    include,
  });

  return shape(bill);
}

async function remove(id) {
  const existing = await prisma.bill.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Bill not found.", 404);
  }
  await prisma.bill.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
