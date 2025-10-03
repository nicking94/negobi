// hooks/organizations/useDeleteOrganizations.ts
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { useState } from "react";
import { ApiError } from "@/types";

const useDeleteOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteOrganization = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 DELETE ORGANIZATION API CALL - ID:", id);

      const response = await OrganizationsService.deleteOrganization(id);

      console.log("✅ DELETE ORGANIZATION RESPONSE:", response);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (e: unknown) {
      console.error("❌ DELETE ORGANIZATION ERROR:", e);
      const apiError = e as ApiError;
      setError(apiError);
      return {
        success: false,
        error: apiError.message || "Error desconocido",
        status: apiError.response?.status || apiError.status,
      };
    } finally {
      setLoading(false);
    }
  };

  return { deleteOrganization, loading, error };
};

export default useDeleteOrganizations;
