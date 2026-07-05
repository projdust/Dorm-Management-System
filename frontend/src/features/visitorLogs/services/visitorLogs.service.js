import apiClient from "../../../services/apiClient";

// Check-in/check-out log table per tenant, filter by date
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/visitor-logs) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/visitor-logs", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/visitor-logs/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/visitor-logs", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/visitor-logs/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/visitor-logs/${id}`);
  return data;
}
