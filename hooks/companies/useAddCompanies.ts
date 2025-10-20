// hooks/companies/useAddCompanies.ts
import { useState } from "react";
import { CompaniesService } from "@/services/companies/companies.service";
import { NewCompanyType, ApiError } from "@/types";

const useAddCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const newCompany = async (data: NewCompanyType) => {
    try {
      setLoading(true);
      setError(null);

      const response = await CompaniesService.createCompany(data);

      return response;
    } catch (err) {
      const apiError = err as ApiError;
      console.error("🔴 Error creando empresa:", apiError);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    newCompany,
    loading,
    error,
  };
};

export default useAddCompanies;
