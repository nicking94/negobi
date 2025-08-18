"use client";
import axios from "axios";
import { toast } from "sonner";

const NEGOBI_API = process.env.NEXT_PUBLIC_API_BACK;

const api = axios.create({
  baseURL: NEGOBI_API,
});

// Interceptor de request: agrega token y lenguaje
api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("NEGOBI_JWT_TOKEN");
  const language = localStorage.getItem("language") || "es";

  config.headers["language"] = language;
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    config.headers["x-api-key"] = "apikey123superadmin";
  }

  return config;
});

// Interceptor de respuesta: maneja token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Tu sesión ha expirado. Redirigiendo al login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      localStorage.removeItem("NEGOBI_JWT_TOKEN");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
