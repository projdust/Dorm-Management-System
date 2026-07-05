const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

/**
 * Settings Service
 * Scope: System key-value Setting CRUD (ADMIN only)
 */

function shape(setting) {
  return { id: setting.id, key: setting.key, value: setting.value };
}

async function getAll() {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return settings.map(shape);
}

async function getById(id) {
  const setting = await prisma.setting.findUnique({ where: { id } });
  if (!setting) {
    throw new AppError("Setting not found.", 404);
  }
  return shape(setting);
}

async function create(data) {
  const { key, value } = data;

  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) {
    throw new AppError("A setting with this key already exists. Use update instead.", 409);
  }

  const setting = await prisma.setting.create({ data: { key, value } });
  return shape(setting);
}

async function update(id, data) {
  const existing = await prisma.setting.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Setting not found.", 404);
  }

  const { value } = data;

  const setting = await prisma.setting.update({
    where: { id },
    data: { ...(value !== undefined && { value }) },
  });

  return shape(setting);
}

async function remove(id) {
  const existing = await prisma.setting.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Setting not found.", 404);
  }
  await prisma.setting.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
