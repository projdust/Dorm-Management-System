import apiClient from "../../../services/apiClient";

export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.data; // { user, accessToken, refreshToken }
}

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data.data;
}

export async function logout(refreshToken) {
  const { data } = await apiClient.post("/auth/logout", { refreshToken });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data.data;
}
