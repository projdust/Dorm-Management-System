const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dorm.com" },
    update: {},
    create: {
      email: "admin@dorm.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  const building = await prisma.building.upsert({
    where: { name: "Building A" },
    update: {},
    create: { name: "Building A", address: "Cebu City" },
  });

  const room = await prisma.room.create({
    data: {
      roomNumber: "A-101",
      buildingId: building.id,
      type: "DOUBLE",
      capacity: 2,
      monthlyRate: 3500,
      status: "AVAILABLE",
      beds: {
        create: [{ bedLabel: "Bed 1" }, { bedLabel: "Bed 2" }],
      },
    },
  });

  console.log({ admin: admin.email, building: building.name, room: room.roomNumber });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
