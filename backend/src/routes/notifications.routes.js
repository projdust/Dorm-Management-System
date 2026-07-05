const express = require("express");
const controller = require("../controllers/notifications/notifications.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
// TODO: add a validate(notificationsSchema) middleware once validation schemas are written
// (see validations/auth.validation.js for the pattern)

const router = express.Router();

router.use(authenticate);

// GET    /api/v1/notifications
router.get("/", controller.getAll);

// GET    /api/v1/notifications/:id
router.get("/:id", controller.getById);

// POST   /api/v1/notifications          (ADMIN/STAFF only - adjust per feature's business rules)
router.post("/", authorize("ADMIN", "STAFF"), controller.create);

// PATCH  /api/v1/notifications/:id      (mark as read - owner only, enforced in service)
router.patch("/:id", controller.update);

// DELETE /api/v1/notifications/:id      (owner only, enforced in service)
router.delete("/:id", controller.remove);

module.exports = router;
