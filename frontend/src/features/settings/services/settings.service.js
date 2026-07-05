import apiClient from "../../../services/apiClient";

// System settings form (ADMIN only): dorm name, currency, late fee rules, etc.
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/settings) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/settings", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/settings/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/settings", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/settings/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/settings/${id}`);
  return data;
}
