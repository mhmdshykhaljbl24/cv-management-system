import api from "./axios.js";

export const deleteEducationApi = (id) => api.delete(`/api/education/${id}`);
export const addEducationApi = (cvId, data) =>
  api.post(`/api/education/cv/${cvId}`, data);
export const updateEducationApi = (id, data) =>
  api.put(`/api/education/${id}`, data);
