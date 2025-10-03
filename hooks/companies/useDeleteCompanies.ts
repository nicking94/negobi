import { CompaniesService } from "@/services/companies/companies.service";
import { useState } from "react";

// hooks/companies/useDeleteCompanies.ts
const useDeleteCompanies = () => {
  const [loading, setLoading] = useState(false);

  const deleteCompany = async (id: string) => {
    try {
      setLoading(true);
      console.log("🚀 DELETE API CALL - ID:", id);

      const response = await CompaniesService.deleteCompany(id);

      console.log("✅ DELETE RESPONSE:", response);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (e: unknown) {
      console.error("❌ DELETE ERROR:", e);
      return {
        success: false,
        error: e instanceof Error ? e.message : "Error desconocido",
      };
    } finally {
      setLoading(false);
    }
  };

  return { deleteCompany, loading };
};

export default useDeleteCompanies;
