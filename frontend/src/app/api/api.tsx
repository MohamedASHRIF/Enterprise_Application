import axios from "axios";

const api = axios.create({
    baseURL : 'http://localhost:8081/api',
    headers :{
        "Content-Type" : "application/json"
    }
});

// --- ADD THIS ---
// This is an "interceptor" that runs before *every* request.
api.interceptors.request.use(
    (config) => {
        // 1. Get the token from localStorage (as seen in your page.tsx)
        const token = localStorage.getItem('token');
        
        // 2. If the token exists, add it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
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
