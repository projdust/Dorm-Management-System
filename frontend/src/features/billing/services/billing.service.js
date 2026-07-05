import apiClient from "../../../services/apiClient";

// List utility bills (Electricity/Water/Internet) per tenant/month, mark as paid
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/billing) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/billing", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/billing/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/billing", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/billing/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/billing/${id}`);
  return data;
}
