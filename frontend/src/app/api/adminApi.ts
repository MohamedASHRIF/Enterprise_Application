import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:8081/api",
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


