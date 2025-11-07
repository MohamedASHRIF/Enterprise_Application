import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- ADD THIS ---
// This is an "interceptor" that runs before *every* request.
api.interceptors.request.use(
  (config) => {
    // Only access localStorage in a browser environment (guard SSR/prerender)
    if (typeof window !== "undefined" && window.localStorage) {
      const token = window.localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);
// --- END ---

export default api;
