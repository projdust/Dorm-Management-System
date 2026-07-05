import apiClient from "../../../services/apiClient";

// List/search/add/edit/remove tenants (see reference image: table with Name, Room, Move-in, Contact, Email, Status, Actions)
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/tenants) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/tenants", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/tenants/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/tenants", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/tenants/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/tenants/${id}`);
  return data;
}
