import apiClient from "../../../services/apiClient";

// Read-only aggregated views: occupancy trends, revenue, overdue payments (charts + export)
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/reports) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/reports", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/reports/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/reports", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/reports/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/reports/${id}`);
  return data;
}
