import api from "./axios.js";

export const deleteProjectApi = (id) => api.delete(`/api/project/${id}`);
export const addProjectApi = (cvId, payload) =>
  api.post(`/api/project/cv/${cvId}`, payload);
export const updateProjectApi = (id, payload) =>
  api.put(`/api/project/${id}`, payload);
