import axios from "axios";

export const partnerApi = axios.create({
  baseURL: import.meta.env.VITE_CAPI_LOOP_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

partnerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("partnerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
