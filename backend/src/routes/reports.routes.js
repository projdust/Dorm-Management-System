const express = require("express");
const controller = require("../controllers/reports/reports.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
// TODO: add a validate(reportsSchema) middleware once validation schemas are written
// (see validations/auth.validation.js for the pattern)

const router = express.Router();

router.use(authenticate);

// GET    /api/v1/reports
router.get("/", controller.getAll);

// GET    /api/v1/reports/:id
router.get("/:id", controller.getById);

// POST   /api/v1/reports          (ADMIN/STAFF only - adjust per feature's business rules)
router.post("/", authorize("ADMIN", "STAFF"), controller.create);

// PATCH  /api/v1/reports/:id
router.patch("/:id", authorize("ADMIN", "STAFF"), controller.update);

// DELETE /api/v1/reports/:id
router.delete("/:id", authorize("ADMIN", "STAFF"), controller.remove);

module.exports = router;
