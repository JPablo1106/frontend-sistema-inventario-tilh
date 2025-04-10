// src/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://backendsistemainventario.onrender.com/api",
});

// Interceptor de solicitud: verifica si hay token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      // Cancelar la solicitud lanzando un error personalizado
      return Promise.reject({ response: { status: 401, message: "No autenticado" } });
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
