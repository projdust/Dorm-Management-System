import apiClient from "../../../services/apiClient";

// ADMIN-only: manage user accounts and roles (Admin/Staff/Tenant)
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/users) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/users", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/users", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}
