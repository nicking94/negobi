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
  companyId: number; // Obligatorio según el swagger
  name?: string;
  code?: string;
}

export interface CompanyBranch {
  // Campos del response (GET)
  id: number;
  name: string;
  code: string;
  contact_email: string;
  main_phone: string;
  physical_address: string;
  is_active: boolean;
  is_central: boolean;

  // Campos de sistema
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
  // Crear una nueva sucursal
  createCompanyBranch: async (
    branchData: CreateCompanyBranchData
  ): Promise<CompanyBranch> => {
    const response = await api.post(PostCompanyBranch, branchData);
    return response.data.data;
  },

  // Obtener todas las sucursales
  getCompanyBranches: async (
    params: GetCompanyBranchesParams
  ): Promise<CompanyBranch[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("companyId", params.companyId.toString());

    // Parámetros opcionales
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
    return response.data.data;
  },

  // Actualizar una sucursal
  updateCompanyBranch: async (
    id: string,
    updates: UpdateCompanyBranchData
  ): Promise<CompanyBranch> => {
    const response = await api.patch(`${PatchCompanyBranch}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una sucursal
  deleteCompanyBranch: async (id: string): Promise<void> => {
    await api.delete(`${DeleteCompanyBranch}/${id}`);
  },

  // Obtener una sucursal por ID
  getCompanyBranchById: async (id: string): Promise<CompanyBranch> => {
    const response = await api.get(`${GetCompanyBranches}/${id}`);
    return response.data.data;
  },
};
