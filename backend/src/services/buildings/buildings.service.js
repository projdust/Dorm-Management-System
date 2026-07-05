const prisma = require("../../config/prisma");
const AppError = require("../../utils/AppError");

async function getAll() {
  return prisma.building.findMany({ orderBy: { name: "asc" } });
}

async function create(data) {
  const { name, address } = data;
  const existing = await prisma.building.findUnique({ where: { name } });
  if (existing) {
    throw new AppError("A building with this name already exists.", 409);
  }
  return prisma.building.create({ data: { name, address } });
}

module.exports = { getAll, create };