const authRepository = require("../../repositories/auth/auth.repository");
const { hashPassword, comparePassword } = require("../../auth/password.service");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../auth/token.service");
const AppError = require("../../utils/AppError");

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function register({ firstName, lastName, email, password, phone, role }) {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    phone,
    passwordHash,
    // Only allow self-registration as TENANT; ADMIN/STAFF should be created
    // by an existing admin via a protected endpoint, not open registration.
    role: "TENANT",
  });

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function login({ email, password }) {
  const user = await authRepository.findUserByEmail(email);
  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  await authRepository.updateLastLogin(user.id);
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function issueTokens(user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await authRepository.storeRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const storedToken = await authRepository.findRefreshToken(refreshToken);
  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token is no longer valid. Please log in again.", 401);
  }

  const user = await authRepository.findUserById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError("Account not found or deactivated.", 401);
  }

  // Rotate refresh token (revoke old, issue new) to limit replay window
  await authRepository.revokeRefreshToken(refreshToken);
  const tokens = await issueTokens(user);
  return tokens;
}

async function logout({ refreshToken }) {
  const storedToken = await authRepository.findRefreshToken(refreshToken);
  if (storedToken) {
    await authRepository.revokeRefreshToken(refreshToken);
  }
  return { message: "Logged out successfully." };
}

module.exports = { register, login, refresh, logout, sanitizeUser };
