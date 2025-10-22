import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { ApiError, ChangePasswordType } from "@/types";
import { useRouter } from "next/navigation";

const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChangePassword = async (
    params: ChangePasswordType & { token?: string | null }
  ) => {
    try {
      setLoading(true);

      const { token, ...changePasswordData } = params;

      const { data, status } = await AuthService.changePasswordAction(
        changePasswordData
      );
      if (token) {
        localStorage.removeItem("tempToken");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }

      if (status === 200) {
        toast.success("Contraseña actualizada correctamente");

        if (token) {
          localStorage.removeItem("tempToken");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }

        return { data, status, success: true };
      } else {
        toast.error(data.message || "Error al cambiar la contraseña");
        return { data, status, success: false };
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Error al cambiar la contraseña";
      toast.error(errorMessage);
      return { error: apiError.response?.data, success: false };
    } finally {
      setLoading(false);
    }
  };

  return { onChangePassword, loading };
};

export default useChangePassword;
