const prisma = require("../../config/prisma");

async function getSummary() {
  const [totalResidents, occupiedBeds, availableBeds, unpaidBills] = await Promise.all([
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.bed.count({ where: { status: "OCCUPIED" } }),
    prisma.bed.count({ where: { status: "VACANT" } }),
    prisma.bill.aggregate({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalResidents,
    occupiedBeds,
    availableBeds,
    outstandingUtilityBills: unpaidBills._sum.amount || 0,
  };
}

async function getRecentActivity(limit = 5) {
  // Pulls the most recent bed assignments as a simple "activity feed".
  // TODO: extend this to union payments + check-ins + maintenance events
  // once those features are implemented, then sort by createdAt.
  return prisma.bedAssignment.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
      bed: { include: { room: true } },
    },
  });
}

async function getOccupancyByBuilding() {
  const buildings = await prisma.building.findMany({
    include: {
      rooms: {
        include: { beds: true },
      },
    },
  });

  return buildings.map((building) => {
    const beds = building.rooms.flatMap((room) => room.beds);
    const occupied = beds.filter((bed) => bed.status === "OCCUPIED").length;
    const available = beds.filter((bed) => bed.status === "VACANT").length;
    return { building: building.name, occupied, available, total: beds.length };
  });
}

module.exports = { getSummary, getRecentActivity, getOccupancyByBuilding };
