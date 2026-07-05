import apiClient from "../../../services/apiClient";

// Two-column layout: assignment form (left) + available rooms list (right), per reference image
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/bed-assignments) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/bed-assignments", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/bed-assignments/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/bed-assignments", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/bed-assignments/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/bed-assignments/${id}`);
  return data;
}
