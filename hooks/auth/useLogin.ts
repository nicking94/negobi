// hooks/auth/useLogin.ts (actualizado)
import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { ApiError, LoginType } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const onLogin = async (params: LoginType) => {
    try {
      setLoading(true);
      const { data, status } = await AuthService.loginAction(params);

      if (status === 200 || status === 201) {
        // Usar el contexto para login
        login(
          data.data.access_token,
          data.data.user || {
            id: data.data.user_id || "",
            email: params.email,
            username: params.email.split("@")[0],
            first_name: "",
            last_name: "",
            phone: "",
            role: data.data.role || "user",
          },
          data.data.refresh_token
        );

        // Almacenar API Key si viene en la respuesta
        if (data.data.api_key) {
          localStorage.setItem("NEGOBI_USER_API_KEY", data.data.api_key);
        }

        toast.success("Inicio de sesión exitoso");

        // Usar replace y forzar una navegación completa
        router.replace("/dashboard");
        return { data, status, success: true };
      } else {
        toast.error(data.message || "Error en el inicio de sesión");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Error en el inicio de sesión";
      toast.error(errorMessage);
      return { error: apiError.response?.data, success: false };
    } finally {
      setLoading(false);
    }
  };

  return { onLogin, loading };
};

export default useLogin;
