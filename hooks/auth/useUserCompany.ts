// hooks/auth/useUserCompany.ts
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export const useUserCompany = () => {
  const { user, isLoading } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  // Obtener el companyId del usuario o usar el seleccionado
  const companyId = selectedCompanyId || user?.company_id || null;

  // Efecto para inicializar con la empresa del usuario
  useEffect(() => {
    if (user?.company_id && !selectedCompanyId) {
      setSelectedCompanyId(user.company_id);
    }
  }, [user?.company_id, selectedCompanyId]);

  return {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    isLoading: isLoading,
    hasCompany: !!companyId,
    user,
  };
};

export default useUserCompany;
