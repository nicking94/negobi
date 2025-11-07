// services/companyConfig/companyConfig.service.ts
import api from "@/utils/api";

export interface WorkDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface CompanyConfig {
  id: number;
  show_available_stock: boolean;
  price_by_default: string;
  sync_with_app: boolean;
  work_days: WorkDays;
  unable_to_debt_client: boolean;
  connect_with_virtual_store: boolean;
  enable_data_replication: boolean;
  companyId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCompanyConfigData {
  companyId: number;
  show_available_stock?: boolean;
  price_by_default?: string;
  sync_with_app?: boolean;
  work_days?: WorkDays;
  unable_to_debt_client?: boolean;
  connect_with_virtual_store?: boolean;
  enable_data_replication?: boolean;
  external_code?: string;
}

export interface UpdateCompanyConfigData {
  companyId?: number;
  show_available_stock?: boolean;
  price_by_default?: string;
  sync_with_app?: boolean;
  work_days?: WorkDays;
  unable_to_debt_client?: boolean;
  connect_with_virtual_store?: boolean;
  enable_data_replication?: boolean;
  external_code?: string;
}

interface PaginatedResponse {
  data: CompanyConfig[];
  totalPages: number;
  total: number;
}

interface ApiResponse {
  success: boolean;
  data: CompanyConfig | PaginatedResponse;
}

export const companyConfigService = {
  createCompanyConfig: async (
    configData: CreateCompanyConfigData
  ): Promise<CompanyConfig> => {
    const response = await api.post<ApiResponse>("/company-config", configData);
    return response.data.data as CompanyConfig;
  },

  getCompanyConfigs: async (params?: any): Promise<CompanyConfig[]> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          if (key === "page" || key === "itemsPerPage") {
            queryParams.append(key, parseInt(params[key]).toString());
          } else {
            queryParams.append(key, params[key].toString());
          }
        }
      });
    }

    if (!params?.page) {
      queryParams.append("page", "1");
    }
    if (!params?.itemsPerPage) {
      queryParams.append("itemsPerPage", "10");
    }

    const response = await api.get<ApiResponse>(
      `/company-config?${queryParams}`
    );

    const responseData = response.data.data as PaginatedResponse;
    return responseData.data || [];
  },

  updateCompanyConfig: async (
    id: string,
    updates: UpdateCompanyConfigData
  ): Promise<CompanyConfig> => {
    const response = await api.patch<ApiResponse>(
      `/company-config/${id}`,
      updates
    );
    return response.data.data as CompanyConfig;
  },

  deleteCompanyConfig: async (id: string): Promise<void> => {
    await api.delete(`/company-config/${id}`);
  },

  getCompanyConfigById: async (id: string): Promise<CompanyConfig> => {
    const response = await api.get<ApiResponse>(`/company-config/${id}`);
    return response.data.data as CompanyConfig;
  },

  getCompanyConfigByCompanyId: async (
    companyId: number
  ): Promise<CompanyConfig | null> => {
    try {
      const configs = await companyConfigService.getCompanyConfigs({
        companyId,
        page: 1,
        itemsPerPage: 1,
      });
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error("Error fetching company config by companyId:", error);
      return null;
    }
  },
};
