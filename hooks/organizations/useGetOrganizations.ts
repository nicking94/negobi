// hooks/organizations/useGetOrganizations.ts
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { useEffect, useState, useCallback } from "react";
import { OrganizationType } from "@/types";

const useGetOrganizations = () => {
  const [loading, setLoading] = useState(false);
  const [organizationsResponse, setOrganizationsResponse] = useState<
    OrganizationType[]
  >([]);
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrganizationsService.getOrganizations({
        search: search.trim(),
        page,
        itemsPerPage,
        order: "ASC",
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error en la respuesta del servidor"
        );
      }

      const responseData = response.data;

      let organizationsArray: any[] = [];
      let totalPages = 1;
      let totalCount = 0;

      if (
        responseData.data &&
        responseData.data.data &&
        Array.isArray(responseData.data.data)
      ) {
        organizationsArray = responseData.data.data;
        totalCount = responseData.data.total || 0;
        totalPages = responseData.data.totalPages || 1;
      } else {
        console.warn("⚠️ Estructura de respuesta inesperada");
        organizationsArray = [];
        totalPages = 0;
        totalCount = 0;
      }

      const transformedOrganizations = organizationsArray.map(
        (organization: any) => ({
          id: organization.id?.toString() || "",
          name: organization.name || "",
          contact_email: organization.contact_email || "",
          legal_tax_id: organization.legal_tax_id || "",
          main_phone: organization.main_phone || "",
          is_active: organization.is_active ?? true,
          companies: organization.companies || [],
          roles: organization.roles || [],
          logo: organization.logo || "",
          external_code: organization.external_code,
          sync_with_erp: organization.sync_with_erp,
          created_at: organization.created_at,
          updated_at: organization.updated_at,
          deleted_at: organization.deleted_at,
        })
      );

      setOrganizationsResponse(transformedOrganizations);
      setTotalPage(totalPages);
      setTotal(totalCount);
    } catch (e: any) {
      console.error(
        "❌ [useGetOrganizations] Error fetching organizations:",
        e
      );
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        "Error al cargar las organizaciones";
      setError(errorMessage);
      setOrganizationsResponse([]);
      setTotalPage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage]);

  useEffect(() => {
    getOrganizations();
  }, [modified, search, page, itemsPerPage, getOrganizations]);

  const refetch = useCallback(() => {
    setModified((prev) => !prev);
  }, []);

  return {
    setModified,
    loading,
    organizationsResponse,
    modified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch,
    page,
    itemsPerPage,
    search,
    error,
    refetch,
  };
};

export default useGetOrganizations;
