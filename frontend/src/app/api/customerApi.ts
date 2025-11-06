import axios from "axios";

// Customer Service API Configuration
// The customer service runs on port 8085 (from docker-compose.yml)
// This API instance is for customer-specific endpoints like appointments, vehicles, etc.
const customerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL || "http://localhost:8085",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add JWT token to all requests
customerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - redirect to login
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error - Customer Service may not be running:', {
        baseURL: customerApi.defaults.baseURL,
        url: error.config?.url,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default customerApi;

