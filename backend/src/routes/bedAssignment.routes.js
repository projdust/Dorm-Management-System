const express = require("express");
const controller = require("../controllers/bedAssignment/bedAssignment.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
// TODO: add a validate(bedAssignmentSchema) middleware once validation schemas are written
// (see validations/auth.validation.js for the pattern)

const router = express.Router();

router.use(authenticate);

// GET    /api/v1/bed-assignments
router.get("/", controller.getAll);

// GET    /api/v1/bed-assignments/:id
router.get("/:id", controller.getById);

// POST   /api/v1/bed-assignments          (ADMIN/STAFF only - adjust per feature's business rules)
router.post("/", authorize("ADMIN", "STAFF"), controller.create);

// PATCH  /api/v1/bed-assignments/:id
router.patch("/:id", authorize("ADMIN", "STAFF"), controller.update);

// DELETE /api/v1/bed-assignments/:id
router.delete("/:id", authorize("ADMIN", "STAFF"), controller.remove);

module.exports = router;
