// hooks/auth/useUserCompany.ts
import { useAuth } from "@/context/AuthContext";

export const useUserCompany = () => {
  const { user, isLoading } = useAuth();

  // Obtener el companyId del usuario
  const companyId = user?.company_id || null;

  return {
    companyId,
    isLoading: isLoading,
    hasCompany: !!companyId,
    user,
  };
};

export default useUserCompany;
