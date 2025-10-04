// hooks/companies/useUpdateCompanies.ts
import { useState } from "react";
import { CompaniesService } from "@/services/companies/companies.service";
import { NewCompanyType, ApiError } from "@/types";

const useUpdateCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateCompany = async (id: string, data: Partial<NewCompanyType>) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🟡 Actualizando empresa ID:", id, "Data:", data);

      const response = await CompaniesService.patchCompany(id, data);

      console.log("🟢 Respuesta de actualización:", response);
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      console.error("🔴 Error actualizando empresa:", apiError);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCompany,
    loading,
    error,
  };
};

export default useUpdateCompanies;
