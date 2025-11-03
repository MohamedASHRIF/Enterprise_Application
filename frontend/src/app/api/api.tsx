import axios from "axios";

// When running via docker-compose the auth service is exposed on host port 8081.
// Update this value if you change docker-compose port mappings or use env vars.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- ADD THIS ---
// This is an "interceptor" that runs before *every* request.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage (as seen in your page.tsx)
    const token = localStorage.getItem("token");

    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
