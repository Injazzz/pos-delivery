/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Auto-attach token dari localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const xsrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
    }

    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 → redirect ke login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ Handle CSRF token expired (dengan max retry untuk prevent infinite loop)
    if (error.response?.status === 419) {
      const retryCount = (error.config as any)._retryCount || 0;

      // Prevent infinite loop: max 2 retries untuk CSRF
      if (retryCount < 2) {
        try {
          // Call Sanctum's CSRF endpoint at root level (not under /api)
          await axios.get(`${window.location.origin}/sanctum/csrf-cookie`, {
            withCredentials: true,
          });

          // Mark retry count untuk prevent infinite loop
          (error.config as any)._retryCount = retryCount + 1;

          // Ulangi request original
          return apiClient(error.config);
        } catch (refreshError) {
          console.error("Failed to refresh CSRF token", refreshError);
        }
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    console.error(
      "[API Error]",
      error.config?.url,
      error.response?.status || error.message,
    );
    return Promise.reject(error);
  },
);

export default apiClient;
