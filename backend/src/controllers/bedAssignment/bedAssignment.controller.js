const service = require("../../services/bedAssignment/bedAssignment.service");
const catchAsync = require("../../utils/catchAsync");

/**
 * Bed Assignment Controller
 * Mirrors auth.controller.js / dashboard.controller.js: parse request,
 * call the service layer, shape the HTTP response. No business logic here.
 */

const getAll = catchAsync(async (req, res) => {
  const data = await service.getAll(req.query);
  res.status(200).json({ success: true, data });
});

const getById = catchAsync(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.status(200).json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.body);
  res.status(201).json({ success: true, message: "Bed Assignment created.", data });
});

const update = catchAsync(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: "Bed Assignment updated.", data });
});

const remove = catchAsync(async (req, res) => {
  await service.remove(req.params.id);
  res.status(200).json({ success: true, message: "Bed Assignment deleted." });
});

module.exports = { getAll, getById, create, update, remove };
