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
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching organizations with params:", {
        search: searchTerm,
        page,
        itemsPerPage,
      });

      const response = await OrganizationsService.getOrganizations({
        search: searchTerm,
        page,
        itemsPerPage,
        order: "ASC" as const,
      });

      console.log("📦 Raw API Response:", response);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error en la respuesta del servidor"
        );
      }

      const responseData = response.data;

      console.log("📊 Response data structure:", responseData);

      // ✅ CORREGIDO: Extraer datos de la estructura correcta
      let organizationsArray: any[] = [];
      let totalPages = 1;
      let totalCount = 0;

      // La estructura es: response.data.data.data (array) y response.data.data.total, etc.
      if (
        responseData.data &&
        responseData.data.data &&
        Array.isArray(responseData.data.data)
      ) {
        organizationsArray = responseData.data.data;
        totalCount = responseData.data.total || organizationsArray.length;
        totalPages =
          responseData.data.totalPages || Math.ceil(totalCount / itemsPerPage);

        console.log("✅ Datos extraídos correctamente:", {
          organizationsCount: organizationsArray.length,
          total: totalCount,
          totalPages: totalPages,
          currentPage: page,
          itemsPerPage: itemsPerPage,
        });
      } else {
        console.warn("⚠️ Estructura de respuesta inesperada");
        organizationsArray = [];
        totalPages = 0;
        totalCount = 0;
      }

      // Transformar los datos a OrganizationType
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

      console.log("🎯 Organizaciones transformadas:", transformedOrganizations);

      setOrganizationsResponse(transformedOrganizations);
      setTotalPage(totalPages);
      setTotal(totalCount);
    } catch (e: any) {
      console.error("❌ Error fetching organizations:", e);
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
  }, [searchTerm, page, itemsPerPage]);

  useEffect(() => {
    getOrganizations();
  }, [modified, searchTerm, page, itemsPerPage, getOrganizations]);

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
    setSearchTerm,
    page,
    itemsPerPage,
    searchTerm,
    error,
    refetch,
  };
};

export default useGetOrganizations;
