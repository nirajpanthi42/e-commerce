// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (typeof window !== "undefined") {
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        window.location.href = "/login";
      }

      // Optional: handle server errors globally
      if (status >= 500) {
        console.error("Server error:", error.response?.data || error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;