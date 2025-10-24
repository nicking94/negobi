// hooks/users/useGetUsers.ts
import {
  UsersService,
  UsersListResponse,
} from "@/services/users/users.service";
import { useEffect, useState, useCallback } from "react";
import { OrganizationQueryType, UserType, ApiError } from "@/types";
import { useUserCompany } from "@/hooks/auth/useUserCompany";

interface UseGetUsersProps {
  roleFilter?: string;
  companyId?: number;
}

interface UseGetUsersReturn {
  loading: boolean;
  users: UserType[];
  modified: boolean;
  setModified: (modified: boolean) => void;
  page: number;
  totalPage: number;
  total: number;
  itemsPerPage: number;
  search: string;
  companyId: number | undefined;
  error: string | null;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSearch: (search: string) => void;
  setCompanyId: (companyId: number | undefined) => void; // Cambiar tipo
  refetch: () => void;
}

const useGetUsers = (props?: UseGetUsersProps): UseGetUsersReturn => {
  const { roleFilter, companyId: propCompanyId } = props || {};

  const { companyId: userCompanyId, isSuperAdmin } = useUserCompany();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // CORRECCIÓN: Estado interno para companyId
  const [companyId, setCompanyId] = useState<number | undefined>(
    propCompanyId || userCompanyId
  );

  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: OrganizationQueryType & { role?: string } = {
        search: search.trim(),
        page,
        itemsPerPage,
      };

      // Lógica de filtrado por empresa
      if (!isSuperAdmin) {
        params.companyId = userCompanyId;
      } else if (companyId) {
        params.companyId = companyId;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      console.log("🔍 [useGetUsers] Params:", params);

      const response: UsersListResponse = await UsersService.getUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.data || []);
        setTotalPage(response.data.totalPages || 0);
        setTotal(response.data.total || 0);
      } else {
        console.warn("⚠️ Respuesta inesperada:", response);
        setUsers([]);
        setTotalPage(0);
        setTotal(0);
      }
    } catch (err: unknown) {
      console.error("❌ [useGetUsers] Error fetching users:", err);

      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al cargar los usuarios";

      setError(errorMessage);
      setUsers([]);
      setTotalPage(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    page,
    itemsPerPage,
    companyId,
    roleFilter,
    isSuperAdmin,
    userCompanyId,
  ]);

  useEffect(() => {
    getUsers();
  }, [modified, search, page, itemsPerPage, companyId, roleFilter, getUsers]);

  const refetch = useCallback(() => {
    setModified((prev) => !prev);
  }, []);

  return {
    loading,
    users,
    modified,
    setModified,
    totalPage,
    total,
    page,
    itemsPerPage,
    search,
    companyId, // Exportar companyId
    error,
    setPage,
    setItemsPerPage,
    setSearch,
    setCompanyId, // Exportar setCompanyId
    refetch,
  };
};

export default useGetUsers;
