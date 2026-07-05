const { z } = require("zod");

const createRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1, "Room number is required"),
    buildingId: z.string().uuid("Invalid building"),
    type: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "QUADRUPLE"]),
    capacity: z.number().int().min(1).max(10),
    monthlyRate: z.number().positive("Monthly rate must be greater than 0"),
    floor: z.number().int().optional(),
    bedLabels: z.array(z.string()).optional(),
  }),
});

const updateRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1).optional(),
    type: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "QUADRUPLE"]).optional(),
    capacity: z.number().int().min(1).max(10).optional(),
    monthlyRate: z.number().positive().optional(),
    floor: z.number().int().optional(),
    status: z.enum(["AVAILABLE", "PARTIAL", "FULL", "MAINTENANCE"]).optional(),
  }),
});

module.exports = { createRoomSchema, updateRoomSchema };