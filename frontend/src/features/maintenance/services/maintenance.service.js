import apiClient from "../../../services/apiClient";

// Kanban or list view of requests by status (Open/In Progress/Resolved/Closed), priority badges
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/maintenance-requests) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/maintenance-requests", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/maintenance-requests/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/maintenance-requests", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/maintenance-requests/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/maintenance-requests/${id}`);
  return data;
}
