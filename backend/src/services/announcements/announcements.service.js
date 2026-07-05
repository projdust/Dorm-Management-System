const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Announcements Service
 * Scope: Announcement CRUD, visible to all authenticated users, pinning support
 */

function shape(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    createdById: announcement.createdById,
    createdByName: `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`,
    isPinned: announcement.isPinned,
    publishedAt: announcement.publishedAt,
    expiresAt: announcement.expiresAt,
    createdAt: announcement.createdAt,
  };
}

const include = { createdBy: { select: { firstName: true, lastName: true } } };

async function getAll(filters = {}) {
  const { search, activeOnly } = filters;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(activeOnly === "true" && {
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    }),
  };

  const announcements = await prisma.announcement.findMany({
    where,
    include,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return announcements.map(shape);
}

async function getById(id) {
  const announcement = await prisma.announcement.findUnique({ where: { id }, include });
  if (!announcement) {
    throw new AppError("Announcement not found.", 404);
  }
  return shape(announcement);
}

async function create(data, createdById) {
  const { title, content, isPinned, expiresAt } = data;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      isPinned: !!isPinned,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById,
    },
    include,
  });

  return shape(announcement);
}

async function update(id, data) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Announcement not found.", 404);
  }

  const { title, content, isPinned, expiresAt } = data;

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(isPinned !== undefined && { isPinned }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
    include,
  });

  return shape(announcement);
}

async function remove(id) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Announcement not found.", 404);
  }
  await prisma.announcement.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
