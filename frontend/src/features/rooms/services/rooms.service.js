import apiClient from "../../../services/apiClient";

// List/search rooms by type/status, Add Room button (see reference image: table with Room Number, Type, Capacity, Occupied, Available, Status)
// TODO: flesh these out to match the actual backend response shapes
// once the corresponding backend service (/rooms) is implemented.

export async function fetchAll(params) {
  const { data } = await apiClient.get("/rooms", { params });
  return data.data;
}

export async function fetchById(id) {
  const { data } = await apiClient.get(`/rooms/${id}`);
  return data.data;
}

export async function create(payload) {
  const { data } = await apiClient.post("/rooms", payload);
  return data.data;
}

export async function update(id, payload) {
  const { data } = await apiClient.patch(`/rooms/${id}`, payload);
  return data.data;
}

export async function remove(id) {
  const { data } = await apiClient.delete(`/rooms/${id}`);
  return data;
}
