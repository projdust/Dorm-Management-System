const express = require("express");
const authController = require("../controllers/auth/auth.controller");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth.middleware");
const { registerSchema, loginSchema, refreshSchema } = require("../validations/auth.validation");

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post("/refresh", validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout
router.post("/logout", validate(refreshSchema), authController.logout);

// GET /api/v1/auth/me  (protected)
router.get("/me", authenticate, authController.me);

module.exports = router;
