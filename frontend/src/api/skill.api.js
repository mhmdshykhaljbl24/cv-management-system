import api from "./axios.js";

export const deleteSkillApi = (id) => api.delete(`/api/skill/${id}`);
export const addSkillApi = (cvId, payload) =>
  api.post(`/api/skill/cv/${cvId}`, payload);
export const updateSkillApi = (id, payload) =>
  api.put(`/api/skill/${id}`, payload);
