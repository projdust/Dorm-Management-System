const express = require("express");
const controller = require("../controllers/buildings/buildings.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getAll);
router.post("/", authorize("ADMIN", "STAFF"), controller.create);

module.exports = router;