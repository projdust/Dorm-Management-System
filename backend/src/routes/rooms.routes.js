const express = require("express");
const controller = require("../controllers/rooms/rooms.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { createRoomSchema, updateRoomSchema } = require("../validations/rooms.validation");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", authorize("ADMIN", "STAFF"), validate(createRoomSchema), controller.create);
router.patch("/:id", authorize("ADMIN", "STAFF"), validate(updateRoomSchema), controller.update);
router.delete("/:id", authorize("ADMIN", "STAFF"), controller.remove);

module.exports = router;