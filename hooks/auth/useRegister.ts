// hooks/auth/useRegister.ts - MEJORADO
import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { RegisterType } from "@/types";
import { ApiError } from "@/types";
import { useRouter } from "next/navigation";

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onRegister = async (params: RegisterType) => {
    try {
      setLoading(true);

      const registerData = {
        ...params,
        is_active: true,
        code: params.code || "",
        organizationId: 0,
        api_key_duration_days: params.api_key_duration_days || 180,
      };

      const { data, status } = await AuthService.registerAction(registerData);

      if (status === 200 || status === 201) {
        if (data.data.api_key) {
          localStorage.setItem("NEGOBI_USER_API_KEY", data.data.api_key);
        }

        if (data.data.api_key_expiration_date) {
          localStorage.setItem(
            "NEGOBI_API_KEY_EXPIRATION",
            data.data.api_key_expiration_date
          );
        }

        toast.success(
          "Registro exitoso. Empresa y administrador creados correctamente."
        );

        // ✅ Redirigir automáticamente al login después del registro
        setTimeout(() => {
          router.push("/login");
        }, 2000);

        return { data, status, success: true };
      } else {
        toast.error(data.message || "Error en el registro");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      let errorMessage = "Error en el registro";
      let errorData = null;

      if (isApiError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
        errorData = error.response?.data || null;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { error: errorData, success: false };
    } finally {
      setLoading(false);
    }
  };

  return { onRegister, loading };
};

// Type guard para verificar si es un ApiError
const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
};

export default useRegister;
