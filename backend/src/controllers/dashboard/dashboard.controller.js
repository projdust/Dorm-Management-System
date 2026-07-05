const dashboardService = require("../../services/dashboard/dashboard.service");
const catchAsync = require("../../utils/catchAsync");

const getSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.status(200).json({ success: true, data });
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const data = await dashboardService.getRecentActivity(limit);
  res.status(200).json({ success: true, data });
});

const getOccupancyByBuilding = catchAsync(async (req, res) => {
  const data = await dashboardService.getOccupancyByBuilding();
  res.status(200).json({ success: true, data });
});

module.exports = { getSummary, getRecentActivity, getOccupancyByBuilding };
