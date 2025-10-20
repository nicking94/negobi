// hooks/organizations/useAddOrganizations.ts
import { useState } from "react";
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { OrganizationPayload, ApiError } from "@/types";

const useAddOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const newOrganization = async (data: OrganizationPayload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrganizationsService.createOrganization(data);

      return response;
    } catch (err) {
      const apiError = err as ApiError;
      console.error("🔴 Error creando organización:", apiError);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    newOrganization,
    loading,
    error,
  };
};

export default useAddOrganizations;
