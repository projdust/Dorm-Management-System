const authService = require("../../services/auth/auth.service");
const catchAsync = require("../../utils/catchAsync");

/**
 * Controllers only: parse request -> call service -> shape response.
 * No business logic and no direct Prisma calls here.
 */

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: result,
  });
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refresh(req.body);
  res.status(200).json({
    success: true,
    message: "Token refreshed successfully.",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  const result = await authService.logout(req.body);
  res.status(200).json({ success: true, ...result });
});

const me = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

module.exports = { register, login, refresh, logout, me };
