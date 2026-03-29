import api from "./axios";

export const listCvsApi = () => api.get("/api/cv");
export const createCvApi = (payload) => api.post("/api/cv", payload);
export const deleteCvApi = (id) => api.delete(`/api/cv/${id}`);
export const getCvFullApi = (id) => api.get(`/api/cv/${id}/full`);
