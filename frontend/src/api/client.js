import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
});

// Sisipkan token JWT dari localStorage ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ckh_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau token kadaluarsa/invalid -> paksa logout & redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ckh_token");
      localStorage.removeItem("ckh_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
