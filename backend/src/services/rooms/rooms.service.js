const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 THIS IS THE ROOM SERVICE FILE.
**/

async function getAll(filters = {}) {
  const { search, type, status, buildingId } = filters;

  const where = {
    ...(search && {
      roomNumber: { contains: search, mode: "insensitive" },
    }),
    ...(type && { type }),
    ...(status && { status }),
    ...(buildingId && { buildingId }),
  };

  const rooms = await prisma.room.findMany({
    where,
    include: {
      building: { select: { id: true, name: true } },
      beds: { select: { id: true, bedLabel: true, status: true } },
    },
    orderBy: [{ building: { name: "asc" } }, { roomNumber: "asc" }],
  });

  return rooms.map((room) => {
    const occupied = room.beds.filter((b) => b.status === "OCCUPIED").length;
    const available = room.beds.filter((b) => b.status === "VACANT").length;
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      building: room.building.name,
      buildingId: room.buildingId,
      type: room.type,
      capacity: room.capacity,
      occupied,
      available,
      monthlyRate: room.monthlyRate,
      status: room.status,
      beds: room.beds,
    };
  });
}

async function getById(id) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { building: true, beds: true },
  });
  if (!room) {
    throw new AppError("Room not found.", 404);
  }
  return room;
}

async function create(data) {
  const { roomNumber, buildingId, type, capacity, monthlyRate, floor, bedLabels } = data;

  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) {
    throw new AppError("Selected building does not exist.", 400);
  }

  const labels =
    bedLabels && bedLabels.length > 0
      ? bedLabels
      : Array.from({ length: capacity }, (_, i) => `Bed ${i + 1}`);

  const room = await prisma.room.create({
    data: {
      roomNumber,
      buildingId,
      type,
      capacity,
      monthlyRate,
      floor,
      status: "AVAILABLE",
      beds: {
        create: labels.map((label) => ({ bedLabel: label })),
      },
    },
    include: { beds: true, building: true },
  });

  return room;
}

async function update(id, data) {
  await getById(id);

  const { roomNumber, type, capacity, monthlyRate, floor, status } = data;

  return prisma.room.update({
    where: { id },
    data: {
      ...(roomNumber !== undefined && { roomNumber }),
      ...(type !== undefined && { type }),
      ...(capacity !== undefined && { capacity }),
      ...(monthlyRate !== undefined && { monthlyRate }),
      ...(floor !== undefined && { floor }),
      ...(status !== undefined && { status }),
    },
    include: { beds: true, building: true },
  });
}

async function remove(id) {
  const room = await getById(id);

  const hasOccupiedBed = room.beds.some((b) => b.status === "OCCUPIED");
  if (hasOccupiedBed) {
    throw new AppError("Cannot delete a room with active tenants. Move them out first.", 409);
  }

  await prisma.room.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };