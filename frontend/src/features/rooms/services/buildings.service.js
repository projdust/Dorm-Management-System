import apiClient from "../../../services/apiClient";

export async function fetchAll() {
  const { data } = await apiClient.get("/buildings");
  return data.data;
}