// hooks/organizations/useAddOrganizations.ts
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { OrganizationType, ApiError } from "@/types";
import { useState } from "react";

const usePostOrganizations = () => {
  const [loading, setLoading] = useState(false);

  const newOrganizations = async (params: OrganizationType) => {
    try {
      setLoading(true);
      console.log("Sending to API:", params);
      const response = await OrganizationsService.AddOrganizations(params);
      console.log("API Response:", response);
      return response;
    } catch (error: unknown) {
      console.error("Error in newOrganizations hook:", error);

      // Usamos type assertion con tu interfaz ApiError
      const apiError = error as ApiError;

      // Retorna un objeto de error consistente
      return {
        error: true,
        message:
          apiError.response?.data?.message ||
          apiError.message ||
          "Error desconocido",
        status: apiError.response?.status || apiError.status || 500,
        details: apiError.response?.data,
      };
    } finally {
      setLoading(false);
    }
  };

  return { newOrganizations, loading };
};

export default usePostOrganizations;
