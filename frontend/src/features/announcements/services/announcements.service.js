import apiClient from "../../../services/apiClient";

// Feed of announcements, pin/unpin, create new (ADMIN/STAFF only)
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/announcements) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/announcements", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/announcements/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/announcements", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/announcements/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/announcements/${id}`);
  return data;
}
