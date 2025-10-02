// hooks/auth/useLogout.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NEGOBI_JWT_TOKEN, NEGOBI_JWT_REFRESH_TOKEN } from "@/utils/constants";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    try {
      setLoading(true);

      // Limpiar tokens del localStorage
      localStorage.removeItem(NEGOBI_JWT_TOKEN);
      localStorage.removeItem(NEGOBI_JWT_REFRESH_TOKEN);

      // Opcional: Limpiar cualquier otro dato almacenado
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
