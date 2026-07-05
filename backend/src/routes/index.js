const express = require("express");

const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const buildingsRoutes = require("./buildings.routes");
const tenantsRoutes = require("./tenants.routes");
const roomsRoutes = require("./rooms.routes");
const bedAssignmentRoutes = require("./bedAssignment.routes");
const paymentsRoutes = require("./payments.routes");
const billingRoutes = require("./billing.routes");
const maintenanceRoutes = require("./maintenance.routes");
const announcementsRoutes = require("./announcements.routes");
const visitorLogsRoutes = require("./visitorLogs.routes");
const reportsRoutes = require("./reports.routes");
const settingsRoutes = require("./settings.routes");
const notificationsRoutes = require("./notifications.routes");
const usersRoutes = require("./users.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/buildings", buildingsRoutes);
router.use("/tenants", tenantsRoutes);
router.use("/rooms", roomsRoutes);
router.use("/bed-assignments", bedAssignmentRoutes);
router.use("/payments", paymentsRoutes);
router.use("/billing", billingRoutes);
router.use("/maintenance-requests", maintenanceRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/visitor-logs", visitorLogsRoutes);
router.use("/reports", reportsRoutes);
router.use("/settings", settingsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/users", usersRoutes);

module.exports = router;