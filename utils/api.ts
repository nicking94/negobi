// utils/api.ts
"use client";
import axios from "axios";
import { toast } from "sonner";

const NEGOBI_API = process.env.NEXT_PUBLIC_API_BACK;

const api = axios.create({
  baseURL: NEGOBI_API,
});

// utils/api.ts - Interceptor actualizado con verificación de expiración
api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("NEGOBI_JWT_TOKEN");
  const userApiKey = localStorage.getItem("NEGOBI_USER_API_KEY");
  const apiKeyExpiration = localStorage.getItem("NEGOBI_API_KEY_EXPIRATION");
  const language = localStorage.getItem("language") || "es";

  config.headers["language"] = language;

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;

    // Verificar si la API Key ha expirado
    if (apiKeyExpiration && new Date() > new Date(apiKeyExpiration)) {
      console.warn("⚠️ API Key ha expirado");
      localStorage.removeItem("NEGOBI_USER_API_KEY");
      localStorage.removeItem("NEGOBI_API_KEY_EXPIRATION");
    }

    // Usar API Key del usuario si está disponible y no ha expirado
    if (
      userApiKey &&
      (!apiKeyExpiration || new Date() <= new Date(apiKeyExpiration))
    ) {
      config.headers["x-api-key"] = userApiKey;
    } else {
      config.headers["x-api-key"] = "apikey123superadmin";
    }
  }

  return config;
});

// Interceptor de respuesta: maneja token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    // Excluir el endpoint de login del manejo automático de 401
    const isLoginEndpoint =
      url.includes("/auth/login") || url.includes("/login");

    if (error.response?.status === 401 && !isLoginEndpoint) {
      console.log("🔄 Redirigiendo al login por 401 (sesión expirada)");
      toast.error("Tu sesión ha expirada. Redirigiendo al login...");
      setTimeout(() => {
        window.location.href = "/login";
        localStorage.removeItem("NEGOBI_JWT_TOKEN");
        localStorage.removeItem("NEGOBI_USER_API_KEY");
      }, 1500);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
