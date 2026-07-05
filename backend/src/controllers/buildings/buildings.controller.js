const service = require("../../services/buildings/buildings.service");
const catchAsync = require("../../utils/catchAsync");

const getAll = catchAsync(async (req, res) => {
  const data = await service.getAll();
  res.status(200).json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.body);
  res.status(201).json({ success: true, message: "Building created.", data });
});

module.exports = { getAll, create };