// hooks/organizations/useGetOrganization.ts
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { useEffect, useState } from "react";
import { OrganizationType, ApiError } from "@/types";

const useGetOneOrganization = (id: string) => {
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationType | null>(
    null
  );
  const [error, setError] = useState<ApiError | null>(null);

  const getOrganization = async (organizationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrganizationsService.getOrganization(
        organizationId
      );

      const transformedOrganization: OrganizationType = {
        id: response.data.data.id?.toString() || "",
        name: response.data.data.name || "",
        contact_email: response.data.data.contact_email || "",
        legal_tax_id: response.data.data.legal_tax_id || "",
        main_phone: response.data.data.main_phone || "",
        is_active: response.data.data.is_active ?? true,
        companies: response.data.data.companies || [],
        roles: response.data.data.roles || [],
        logo: response.data.data.logo || "",
      };

      setOrganization(transformedOrganization);
      return response;
    } catch (err: any) {
      console.error("🔴 Error obteniendo organización:", err);
      const apiError = err as ApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getOrganization(id);
    }
  }, [id]);

  return {
    organization,
    loading,
    error,
    refetch: () => (id ? getOrganization(id) : Promise.resolve()),
  };
};

export default useGetOneOrganization;
