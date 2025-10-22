import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const useRefreshToken = () => {
  const [loading, setLoading] = useState(false);
  const { updateToken } = useAuth();

  const onRefreshToken = async () => {
    try {
      setLoading(true);

      // Usar el refresh token como authorization header
      const refreshToken = localStorage.getItem("NEGOBI_JWT_REFRESH_TOKEN");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Configurar el interceptor para esta petición específica
      const { data, status } = await AuthService.refreshTokenAction();

      if (status === 200) {
        // Actualizar tokens en el contexto y localStorage
        updateToken(data.data.access_token, data.data.refresh_token);

        return {
          data,
          status,
          success: true,
          newAccessToken: data.data.access_token,
          newRefreshToken: data.data.refresh_token,
        };
      } else {
        toast.error(data.message || "Error al refrescar el token");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      console.error("Error refreshing token:", error);

      // Forzar logout si el refresh token es inválido
      if ((error as any)?.response?.status === 401) {
        localStorage.removeItem("NEGOBI_JWT_TOKEN");
        localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
        localStorage.removeItem("NEGOBI_USER_DATA");
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login";
      } else {
        toast.error("Error al refrescar la sesión");
      }

      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { onRefreshToken, loading };
};

export default useRefreshToken;
