// hooks/auth/useLogin.ts
import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { ApiError, LoginType } from "@/types";
import { useRouter } from "next/navigation";

// Define el tipo para el error de Axios/Api

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async (params: LoginType) => {
    try {
      setLoading(true);
      const { data, status } = await AuthService.loginAction(params);

      if (status === 200 || status === 201) {
        // Almacenar token JWT
        localStorage.setItem("NEGOBI_JWT_TOKEN", data.data.access_token);

        // Almacenar API Key si viene en la respuesta
        if (data.data.api_key) {
          localStorage.setItem("NEGOBI_USER_API_KEY", data.data.api_key);
        }

        // Almacenar información del usuario si es necesario
        if (data.data.user) {
          localStorage.setItem(
            "NEGOBI_USER_DATA",
            JSON.stringify(data.data.user)
          );
        }

        toast.success("Inicio de sesión exitoso");
        router.push("/dashboard");
        return { data, status, success: true };
      } else {
        toast.error(data.message || "Error en el inicio de sesión");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      // Type assertion para el error
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
