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

  const getOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await OrganizationsService.GetOrganizations({
        search,
        page,
        itemsPerPage,
      });

      if (response.data) {
        if (response.data.data && response.data.data.data) {
          setOrganizationsResponse(response.data.data.data);
          setTotalPage(response.data.data.totalPages || 1);
          setTotal(response.data.data.total || 0);
        } else if (response.data.data) {
          setOrganizationsResponse(response.data.data);
          setTotalPage(response.data.totalPages || 1);
          setTotal(response.data.total || 0);
        } else if (Array.isArray(response.data)) {
          setOrganizationsResponse(response.data);
          setTotalPage(1);
          setTotal(response.data.length);
        }
        // Estructura común
        else {
          setOrganizationsResponse(
            response.data.data || response.data.items || []
          );
          setTotalPage(response.data.totalPages || response.data.lastPage || 1);
          setTotal(response.data.total || response.data.count || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizationsResponse([]);
      setTotalPage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage]);

  useEffect(() => {
    getOrganizations();
  }, [modified, getOrganizations]);

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
  };
};

export default useGetOrganizations;
