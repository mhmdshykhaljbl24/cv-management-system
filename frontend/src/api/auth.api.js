import api from "./axios";

export const registerApi = (payload) => api.post("/api/auth/register", payload);
export const loginApi = (payload) => api.post("/api/auth/login", payload);
export const meApi = () => api.get("/api/auth/me");
