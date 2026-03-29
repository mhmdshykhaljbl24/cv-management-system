import api from "./axios";

export const getMyCvsApi = async () => {
  return api.get("/api/cv");
};
export const getDashboardSummaryApi = () => api.get("/api/dashboard/summary");
export const getAdminSummaryApi = () => api.get("/api/dashboard/admin/summary");
