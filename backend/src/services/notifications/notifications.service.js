const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Notifications Service
 * Scope: Notification list/read/mark-as-read, scoped to the authenticated user
 */

function shape(notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}

async function getAll(filters = {}, userId) {
  const { isRead, type } = filters;
  const where = {
    userId,
    ...(isRead !== undefined && { isRead: isRead === "true" }),
    ...(type && { type }),
  };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(shape);
}

async function getById(id, userId) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    throw new AppError("Notification not found.", 404);
  }
  return shape(notification);
}

async function create(data) {
  // Typically created by the system (e.g. announcements/payment due jobs),
  // but exposed here so ADMIN/STAFF can also send manual notifications.
  const { userId, type, title, message } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Target user not found.", 404);
  }

  const notification = await prisma.notification.create({
    data: { userId, type, title, message },
  });

  return shape(notification);
}

async function update(id, data, userId) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new AppError("Notification not found.", 404);
  }

  const { isRead } = data;

  const notification = await prisma.notification.update({
    where: { id },
    data: { ...(isRead !== undefined && { isRead }) },
  });

  return shape(notification);
}

async function remove(id, userId) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new AppError("Notification not found.", 404);
  }
  await prisma.notification.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
