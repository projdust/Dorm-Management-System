import apiClient from "../../../services/apiClient";

// List of notifications for the logged-in user, mark as read
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/notifications) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/notifications", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/notifications/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/notifications", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/notifications/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
}
