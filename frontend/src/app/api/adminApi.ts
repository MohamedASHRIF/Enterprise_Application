import axios from "axios";

// Admin service is mapped to host port 8085 in docker-compose.yml
const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://localhost:8085/api",
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;


