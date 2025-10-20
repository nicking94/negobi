// hooks/organizations/useUpdateOrganizations.ts
import { useState } from "react";
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { OrganizationPayload, ApiError } from "@/types";

const useUpdateOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateOrganization = async (
    id: string,
    data: Partial<OrganizationPayload>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrganizationsService.patchOrganization(id, data);

      return response;
    } catch (err) {
      const apiError = err as ApiError;
      console.error("🔴 Error actualizando organización:", apiError);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateOrganization,
    loading,
    error,
  };
};

export default useUpdateOrganizations;
