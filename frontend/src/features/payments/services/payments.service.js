import apiClient from "../../../services/apiClient";

// List rent payments per tenant, filter by status, record new payment
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/payments) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/payments", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/payments/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/payments", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/payments/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/payments/${id}`);
  return data;
}
