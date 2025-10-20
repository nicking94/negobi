import api from "../../utils/api";
import {
  PostCompanyBranch,
  GetCompanyBranches,
  PatchCompanyBranch,
  DeleteCompanyBranch,
} from "./companyBranches.route";

export interface GetCompanyBranchesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
  name?: string;
  code?: string;
}

export interface CompanyBranch {
  id: number;
  name: string;
  code: string;
  contact_email: string;
  main_phone: string;
  physical_address: string;
  is_active: boolean;
  is_central: boolean;
  companyId: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCompanyBranchData {
  // Campos requeridos para crear una sucursal
  companyId: number;
  name: string;
  code: string;

  // Campos opcionales para creación
  contact_email?: string;
  main_phone?: string;
  physical_address?: string;
  is_active?: boolean;
  is_central?: boolean;
}

export interface UpdateCompanyBranchData {
  // Todos los campos son opcionales para actualización
  name?: string;
  code?: string;
  contact_email?: string;
  main_phone?: string;
  physical_address?: string;
  is_active?: boolean;
  is_central?: boolean;
}

// Response interfaces
export interface CompanyBranchResponse {
  success: boolean;
  data: CompanyBranch;
}

export interface CompanyBranchesListResponse {
  success: boolean;
  data: CompanyBranch[];
}

export interface PaginatedCompanyBranchesResponse {
  success: boolean;
  data: {
    data: CompanyBranch[];
    totalPages: number;
    total: number;
  };
}

export const companyBranchService = {
  getCompanyBranches: async (
    params: GetCompanyBranchesParams
  ): Promise<CompanyBranch[]> => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("page", params?.page?.toString() || "1");
      queryParams.append(
        "itemsPerPage",
        params?.itemsPerPage?.toString() || "1000"
      );

      if (params.companyId && params.companyId > 0) {
        queryParams.append("companyId", params.companyId.toString());
      } else {
        console.log("🔵 Solicitando TODAS las sucursales (sin companyId)");
      }

      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.order) {
        queryParams.append("order", params.order);
      }
      if (params?.name) {
        queryParams.append("name", params.name);
      }
      if (params?.code) {
        queryParams.append("code", params.code);
      }

      const response = await api.get(`${GetCompanyBranches}?${queryParams}`);
      const responseData = response.data;

      if (responseData.success) {
        const branches = responseData.data?.data || responseData.data || [];
        return branches;
      } else {
        console.warn("⚠️ Respuesta no exitosa:", responseData);
        return [];
      }
    } catch (error) {
      console.error("❌ Error en getCompanyBranches:", error);
      throw error;
    }
  },

  createCompanyBranch: async (
    branchData: CreateCompanyBranchData
  ): Promise<CompanyBranch> => {
    const response = await api.post(PostCompanyBranch, branchData);
    const responseData = response.data;

    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || "Error al crear sucursal");
    }
  },

  // Actualizar una sucursal - CORREGIDO
  updateCompanyBranch: async (
    id: string,
    updates: UpdateCompanyBranchData
  ): Promise<CompanyBranch> => {
    const response = await api.patch(`${PatchCompanyBranch}/${id}`, updates);
    const responseData = response.data;

    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || "Error al actualizar sucursal");
    }
  },

  // Obtener una sucursal por ID - CORREGIDO
  getCompanyBranchById: async (id: string): Promise<CompanyBranch> => {
    const response = await api.get(`${GetCompanyBranches}/${id}`);
    const responseData = response.data;

    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || "Error al obtener sucursal");
    }
  },
  deleteCompanyBranch: async (id: string): Promise<void> => {
    const response = await api.delete(`${DeleteCompanyBranch}/${id}`);
    const responseData = response.data;

    if (!responseData.success) {
      throw new Error(responseData.message || "Error al eliminar sucursal");
    }
  },
};
