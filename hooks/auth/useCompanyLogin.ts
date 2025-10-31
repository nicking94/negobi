import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { ApiError } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const useCompanyLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const onCompanyLogin = async (params: any & { rememberMe?: boolean }) => {
    try {
      setLoading(true);
      const { rememberMe, ...loginData } = params;

      const { data, status } = await AuthService.companyLoginAction(loginData);

      if (status === 200) {
        const userData = {
          id: data.data.user?.id?.toString() || "",
          email: data.data.user?.email || "",
          username: data.data.user?.username || "",
          first_name: data.data.user?.first_name || "",
          last_name: data.data.user?.last_name || "",
          phone: data.data.user?.phone || "",
          role: data.data.user?.role || "company",
          company_id: data.data.company_id || null,
        };

        login(
          data.data.access_token,
          userData,
          data.data.refresh_token,
          rememberMe
        );

        toast.success("Inicio de sesión empresarial exitoso");
        router.replace("/dashboard");
        return { data, status, success: true };
      } else {
        toast.error(data.message || "Error en el inicio de sesión empresarial");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        "Error en el inicio de sesión empresarial";
      toast.error(errorMessage);
      return { error: apiError.response?.data, success: false };
    } finally {
      setLoading(false);
    }
  };

  return { onCompanyLogin, loading };
};

export default useCompanyLogin;
