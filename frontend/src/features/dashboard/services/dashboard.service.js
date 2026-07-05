import apiClient from "../../../services/apiClient";

export async function fetchSummary() {
  const { data } = await apiClient.get("/dashboard/summary");
  return data.data;
}

export async function fetchRecentActivity(limit = 5) {
  const { data } = await apiClient.get("/dashboard/recent-activity", { params: { limit } });
  return data.data;
}

export async function fetchOccupancyByBuilding() {
  const { data } = await apiClient.get("/dashboard/occupancy");
  return data.data;
}
