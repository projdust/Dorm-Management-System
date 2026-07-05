const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Maintenance Requests Service
 * Scope: MaintenanceRequest CRUD + status workflow (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)
 */

function shape(request) {
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    priority: request.priority,
    status: request.status,
    requestedById: request.requestedById,
    requestedByName: `${request.requestedBy.firstName} ${request.requestedBy.lastName}`,
    assignedToId: request.assignedToId,
    assignedToName: request.assignedTo
      ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}`
      : null,
    roomId: request.roomId,
    roomNumber: request.room?.roomNumber || null,
    resolvedAt: request.resolvedAt,
    createdAt: request.createdAt,
  };
}

const include = {
  requestedBy: { select: { firstName: true, lastName: true } },
  assignedTo: { select: { firstName: true, lastName: true } },
  room: true,
};

async function getAll(filters = {}) {
  const { status, priority, assignedToId, requestedById } = filters;
  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedToId && { assignedToId }),
    ...(requestedById && { requestedById }),
  };

  const requests = await prisma.maintenanceRequest.findMany({
    where,
    include,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return requests.map(shape);
}

async function getById(id) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id }, include });
  if (!request) {
    throw new AppError("Maintenance request not found.", 404);
  }
  return shape(request);
}

async function create(data, requestedById) {
  const { title, description, priority, roomId, assignedToId } = data;

  const request = await prisma.maintenanceRequest.create({
    data: {
      title,
      description,
      priority: priority || "MEDIUM",
      roomId: roomId || null,
      assignedToId: assignedToId || null,
      requestedById,
      status: "OPEN",
    },
    include,
  });

  return shape(request);
}

async function update(id, data) {
  const existing = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Maintenance request not found.", 404);
  }

  const { title, description, priority, status, assignedToId } = data;
  const isResolving = status && ["RESOLVED", "CLOSED"].includes(status) && !existing.resolvedAt;

  const request = await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(isResolving && { resolvedAt: new Date() }),
    },
    include,
  });

  return shape(request);
}

async function remove(id) {
  const existing = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Maintenance request not found.", 404);
  }
  await prisma.maintenanceRequest.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
