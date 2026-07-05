const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Bed Assignment Service
 * Scope: Assign/unassign a Tenant to a Bed (BedAssignment model), auto-update Bed.status & Room.status
 */

function shape(assignment) {
  return {
    id: assignment.id,
    tenantId: assignment.tenantId,
    tenantName: `${assignment.tenant.user.firstName} ${assignment.tenant.user.lastName}`,
    bedId: assignment.bedId,
    bedLabel: assignment.bed.bedLabel,
    roomId: assignment.bed.room.id,
    roomNumber: assignment.bed.room.roomNumber,
    building: assignment.bed.room.building?.name,
    moveInDate: assignment.moveInDate,
    expectedMoveOutDate: assignment.expectedMoveOutDate,
    actualMoveOutDate: assignment.actualMoveOutDate,
    status: assignment.status,
  };
}

const include = {
  tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
  bed: { include: { room: { include: { building: true } } } },
};

async function getAll(filters = {}) {
  const { status, tenantId, roomId } = filters;
  const where = {
    ...(status && { status }),
    ...(tenantId && { tenantId }),
    ...(roomId && { bed: { roomId } }),
  };

  const assignments = await prisma.bedAssignment.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return assignments.map(shape);
}

async function getById(id) {
  const assignment = await prisma.bedAssignment.findUnique({ where: { id }, include });
  if (!assignment) {
    throw new AppError("Bed assignment not found.", 404);
  }
  return shape(assignment);
}

async function recalculateRoomStatus(roomId, tx = prisma) {
  const beds = await tx.bed.findMany({ where: { roomId } });
  const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
  let status = "AVAILABLE";
  if (occupied === 0) status = "AVAILABLE";
  else if (occupied === beds.length) status = "FULL";
  else status = "PARTIAL";

  await tx.room.update({ where: { id: roomId }, data: { status } });
}

async function create(data) {
  const { tenantId, bedId, moveInDate, expectedMoveOutDate } = data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }

  const bed = await prisma.bed.findUnique({ where: { id: bedId } });
  if (!bed) {
    throw new AppError("Bed not found.", 404);
  }
  if (bed.status === "OCCUPIED") {
    throw new AppError("This bed is already occupied.", 409);
  }

  const existingActive = await prisma.bedAssignment.findFirst({
    where: { tenantId, status: "ACTIVE" },
  });
  if (existingActive) {
    throw new AppError("This tenant already has an active bed assignment. End it first.", 409);
  }

  const assignment = await prisma.$transaction(async (tx) => {
    const created = await tx.bedAssignment.create({
      data: {
        tenantId,
        bedId,
        moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
        expectedMoveOutDate: expectedMoveOutDate ? new Date(expectedMoveOutDate) : null,
        status: "ACTIVE",
      },
      include,
    });

    await tx.bed.update({ where: { id: bedId }, data: { status: "OCCUPIED" } });
    await recalculateRoomStatus(bed.roomId, tx);

    return created;
  });

  return shape(assignment);
}

async function update(id, data) {
  const existing = await prisma.bedAssignment.findUnique({ where: { id }, include: { bed: true } });
  if (!existing) {
    throw new AppError("Bed assignment not found.", 404);
  }

  const { expectedMoveOutDate, status, actualMoveOutDate } = data;

  const assignment = await prisma.$transaction(async (tx) => {
    const updated = await tx.bedAssignment.update({
      where: { id },
      data: {
        ...(expectedMoveOutDate !== undefined && {
          expectedMoveOutDate: expectedMoveOutDate ? new Date(expectedMoveOutDate) : null,
        }),
        ...(status !== undefined && { status }),
        ...(actualMoveOutDate !== undefined && {
          actualMoveOutDate: actualMoveOutDate ? new Date(actualMoveOutDate) : null,
        }),
      },
      include,
    });

    if (status && status !== "ACTIVE" && existing.status === "ACTIVE") {
      await tx.bed.update({ where: { id: existing.bedId }, data: { status: "VACANT" } });
      await recalculateRoomStatus(existing.bed.roomId, tx);
    }

    return updated;
  });

  return shape(assignment);
}

async function remove(id) {
  const existing = await prisma.bedAssignment.findUnique({ where: { id }, include: { bed: true } });
  if (!existing) {
    throw new AppError("Bed assignment not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    if (existing.status === "ACTIVE") {
      await tx.bed.update({ where: { id: existing.bedId }, data: { status: "VACANT" } });
      await recalculateRoomStatus(existing.bed.roomId, tx);
    }
    await tx.bedAssignment.update({
      where: { id },
      data: { status: "ENDED", actualMoveOutDate: new Date() },
    });
  });
}

module.exports = { getAll, getById, create, update, remove };
