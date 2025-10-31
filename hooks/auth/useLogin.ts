// hooks/auth/useLogin.ts
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

  const onLogin = async (params: LoginType & { rememberMe?: boolean }) => {
    try {
      setLoading(true);
      const { rememberMe, ...loginData } = params;

      const { data, status } = await AuthService.loginAction(loginData);

      if (status === 200 || status === 201) {
        const userData = {
          id:
            data.data.user?.id?.toString() ||
            data.data.user_id?.toString() ||
            "",
          email: data.data.user?.email || params.email,
          username: data.data.user?.username || params.email.split("@")[0],
          first_name: data.data.user?.first_name || "",
          last_name: data.data.user?.last_name || "",
          phone: data.data.user?.phone || "",
          role: data.data.user?.role || data.data.role || "user",
        };

        login(
          data.data.access_token,
          userData,
          data.data.refresh_token,
          rememberMe
        );

        if (data.data.api_key) {
          localStorage.setItem("NEGOBI_USER_API_KEY", data.data.api_key);
        }

        toast.success("Inicio de sesión exitoso");
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
