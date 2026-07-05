const express = require("express");
const dashboardController = require("../controllers/dashboard/dashboard.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN", "STAFF"));

// GET /api/v1/dashboard/summary
router.get("/summary", dashboardController.getSummary);

// GET /api/v1/dashboard/recent-activity
router.get("/recent-activity", dashboardController.getRecentActivity);

// GET /api/v1/dashboard/occupancy
router.get("/occupancy", dashboardController.getOccupancyByBuilding);

module.exports = router;
