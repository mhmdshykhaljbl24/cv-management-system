import api from "./axios.js";

export const deleteExperienceApi = (id) => api.delete(`/api/experience/${id}`);
export const addExperienceApi = (cvId, payload) =>
  api.post(`/api/experience/cv/${cvId}`, payload);
export const updateExperienceApi = (id, payload) =>
  api.put(`/api/experience/${id}`, payload);
