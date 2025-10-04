// hooks/auth/useLogout.ts (actualizado)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("NEGOBI_JWT_TOKEN");
      localStorage.removeItem("NEGOBI_JWT_REFRESH_TOKEN");
      localStorage.removeItem("NEGOBI_USER_DATA");
      localStorage.removeItem("NEGOBI_REMEMBER_ME");
      localStorage.removeItem("NEGOBI_TOKEN_TIMESTAMP");
      localStorage.removeItem("company_tax_id");
      localStorage.removeItem("user_profile");

      // Mostrar mensaje de éxito
      toast.success("Sesión cerrada correctamente");

      // Redirigir al login
      setTimeout(() => {
        router.push("/login");
      }, 1000);

      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { onLogout, loading };
};

export default useLogout;
