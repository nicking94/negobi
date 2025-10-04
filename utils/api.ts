// utils/api.ts (actualizado)
"use client";
import axios from "axios";
import { toast } from "sonner";

const NEGOBI_API = process.env.NEXT_PUBLIC_API_BACK;

const api = axios.create({
  baseURL: NEGOBI_API,
});

api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("NEGOBI_JWT_TOKEN");
  const userApiKey = localStorage.getItem("NEGOBI_USER_API_KEY");
  const apiKeyExpiration = localStorage.getItem("NEGOBI_API_KEY_EXPIRATION");
  const language = localStorage.getItem("language") || "es";
  const rememberMe = localStorage.getItem("NEGOBI_REMEMBER_ME") === "true";

  config.headers["language"] = language;

  // Verificar si la sesión debería expirar
  if (!rememberMe) {
    const tokenTimestamp = localStorage.getItem("NEGOBI_TOKEN_TIMESTAMP");
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (
      tokenTimestamp &&
      Date.now() - parseInt(tokenTimestamp) > TWENTY_FOUR_HOURS
    ) {
      // Token expirado para sesiones no recordadas
      localStorage.removeItem("NEGOBI_JWT_TOKEN");
      localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
      localStorage.removeItem("NEGOBI_USER_DATA");
      localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");

      toast.error(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

      return Promise.reject(new Error("Token expired"));
    }
  }

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;

    if (apiKeyExpiration && new Date() > new Date(apiKeyExpiration)) {
      console.warn("⚠️ API Key ha expirado");
      localStorage.removeItem("NEGOBI_USER_API_KEY");
      localStorage.removeItem("NEGOBI_API_KEY_EXPIRATION");
    }

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const rememberMe = localStorage.getItem("NEGOBI_REMEMBER_ME") === "true";

    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      // Para sesiones no recordadas, no intentar refresh, redirigir directamente
      if (!rememberMe) {
        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        );

        localStorage.removeItem("NEGOBI_JWT_TOKEN");
        localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
        localStorage.removeItem("NEGOBI_USER_DATA");
        localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);

        return Promise.reject(error);
      }

      // Para sesiones recordadas, intentar refresh token
      const refreshToken = localStorage.getItem("NEGOBI_JWT_REFRESH_TOKEN");

      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${NEGOBI_API}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                "x-api-key": "apikey123superadmin",
              },
            }
          );

          const newAccessToken = refreshResponse.data.data.access_token;
          localStorage.setItem("NEGOBI_JWT_TOKEN", newAccessToken);

          // Reintentar la request original con el nuevo token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si el refresh falla, redirigir al login
          toast.error("Tu sesión ha expirado. Redirigiendo al login...");

          localStorage.removeItem("NEGOBI_JWT_TOKEN");
          localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
          localStorage.removeItem("NEGOBI_USER_DATA");
          localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");

          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      } else {
        toast.error("Tu sesión ha expirado. Redirigiendo al login...");

        localStorage.removeItem("NEGOBI_JWT_TOKEN");
        localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
        localStorage.removeItem("NEGOBI_USER_DATA");
        localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
