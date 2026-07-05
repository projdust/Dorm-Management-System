const express = require("express");
const controller = require("../controllers/maintenance/maintenance.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
// TODO: add a validate(maintenanceSchema) middleware once validation schemas are written
// (see validations/auth.validation.js for the pattern)

const router = express.Router();

router.use(authenticate);

// GET    /api/v1/maintenance-requests
router.get("/", controller.getAll);

// GET    /api/v1/maintenance-requests/:id
router.get("/:id", controller.getById);

// POST   /api/v1/maintenance-requests          (any authenticated user can file a request)
router.post("/", controller.create);

// PATCH  /api/v1/maintenance-requests/:id
router.patch("/:id", authorize("ADMIN", "STAFF"), controller.update);

// DELETE /api/v1/maintenance-requests/:id
router.delete("/:id", authorize("ADMIN", "STAFF"), controller.remove);

module.exports = router;
