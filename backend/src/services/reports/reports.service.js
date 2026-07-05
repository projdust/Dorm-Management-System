const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Reports Service
 * Scope: Aggregated/derived reports (occupancy, revenue, overdue payments) - read-only, no dedicated table
 *
 * getAll(filters) doubles as the "list available reports" endpoint, returning
 * a summary bundle of everything at once. getById(reportKey) returns one
 * report by key (occupancy | revenue | overdue-payments | maintenance-summary).
 */

async function getOccupancyReport() {
  const buildings = await prisma.building.findMany({
    include: { rooms: { include: { beds: true } } },
  });

  return buildings.map((building) => {
    const beds = building.rooms.flatMap((r) => r.beds);
    const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
    const total = beds.length;
    return {
      building: building.name,
      totalRooms: building.rooms.length,
      totalBeds: total,
      occupiedBeds: occupied,
      vacantBeds: total - occupied,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  });
}

async function getRevenueReport(filters = {}) {
  const { from, to } = filters;
  const dateFilter = {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };

  const [rentPaid, utilityPaid, rentPending, utilityUnpaid] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID", ...(Object.keys(dateFilter).length && { paidAt: dateFilter }) },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.bill.aggregate({
      where: { status: "PAID", ...(Object.keys(dateFilter).length && { paidAt: dateFilter }) },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.bill.aggregate({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    rentCollected: rentPaid._sum.amount || 0,
    rentCollectedCount: rentPaid._count,
    utilityCollected: utilityPaid._sum.amount || 0,
    utilityCollectedCount: utilityPaid._count,
    rentOutstanding: rentPending._sum.amount || 0,
    rentOutstandingCount: rentPending._count,
    utilityOutstanding: utilityUnpaid._sum.amount || 0,
    utilityOutstandingCount: utilityUnpaid._count,
  };
}

async function getOverduePaymentsReport() {
  const [overduePayments, overdueBills] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "OVERDUE" },
      include: { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { periodEnd: "asc" },
    }),
    prisma.bill.findMany({
      where: { status: "OVERDUE" },
      include: { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return {
    overduePayments: overduePayments.map((p) => ({
      id: p.id,
      tenantName: `${p.tenant.user.firstName} ${p.tenant.user.lastName}`,
      amount: p.amount,
      periodEnd: p.periodEnd,
    })),
    overdueBills: overdueBills.map((b) => ({
      id: b.id,
      tenantName: `${b.tenant.user.firstName} ${b.tenant.user.lastName}`,
      type: b.type,
      amount: b.amount,
      dueDate: b.dueDate,
    })),
  };
}

async function getMaintenanceSummaryReport() {
  const counts = await prisma.maintenanceRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  return counts.map((c) => ({ status: c.status, count: c._count }));
}

const REPORT_MAP = {
  occupancy: getOccupancyReport,
  revenue: getRevenueReport,
  "overdue-payments": getOverduePaymentsReport,
  "maintenance-summary": getMaintenanceSummaryReport,
};

async function getAll(filters = {}) {
  const [occupancy, revenue, overdue, maintenanceSummary] = await Promise.all([
    getOccupancyReport(),
    getRevenueReport(filters),
    getOverduePaymentsReport(),
    getMaintenanceSummaryReport(),
  ]);

  return { occupancy, revenue, overdue, maintenanceSummary };
}

async function getById(reportKey) {
  const handler = REPORT_MAP[reportKey];
  if (!handler) {
    throw new AppError(
      `Unknown report "${reportKey}". Valid options: ${Object.keys(REPORT_MAP).join(", ")}.`,
      404
    );
  }
  return handler();
}

// Reports are derived/read-only - no create/update/remove.
async function create() {
  throw new AppError("Reports are read-only and cannot be created.", 405);
}
async function update() {
  throw new AppError("Reports are read-only and cannot be updated.", 405);
}
async function remove() {
  throw new AppError("Reports are read-only and cannot be deleted.", 405);
}

module.exports = { getAll, getById, create, update, remove };
