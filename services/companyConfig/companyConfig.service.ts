import api from "../../utils/api";
import {
  PostCompanyConfig,
  GetCompanyConfigs,
  PatchCompanyConfig,
  DeleteCompanyConfig,
} from "../companyConfig/companyConfig.route";

export interface GetCompanyConfigsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
  show_available_stock?: boolean;
  price_by_default?: string;
  sync_with_app?: boolean;
  unable_to_debt_client?: boolean;
  connect_with_virtual_store?: boolean;
  enable_data_replication?: boolean;
}

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
}

export interface CompanyConfigResponse {
  success: boolean;
  data: CompanyConfig;
}

export interface CompanyConfigsListResponse {
  success: boolean;
  data: CompanyConfig[];
}

export interface PaginatedCompanyConfigsResponse {
  success: boolean;
  data: {
    data: CompanyConfig[];
    totalPages: number;
    total: number;
  };
}

export const companyConfigService = {
  createCompanyConfig: async (
    configData: CreateCompanyConfigData
  ): Promise<CompanyConfig> => {
    const response = await api.post(PostCompanyConfig, configData);
    return response.data.data;
  },

  getCompanyConfigs: async (
    params?: GetCompanyConfigsParams
  ): Promise<CompanyConfig[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.show_available_stock !== undefined) {
      queryParams.append(
        "show_available_stock",
        params.show_available_stock.toString()
      );
    }
    if (params?.price_by_default) {
      queryParams.append("price_by_default", params.price_by_default);
    }
    if (params?.sync_with_app !== undefined) {
      queryParams.append("sync_with_app", params.sync_with_app.toString());
    }
    if (params?.unable_to_debt_client !== undefined) {
      queryParams.append(
        "unable_to_debt_client",
        params.unable_to_debt_client.toString()
      );
    }
    if (params?.connect_with_virtual_store !== undefined) {
      queryParams.append(
        "connect_with_virtual_store",
        params.connect_with_virtual_store.toString()
      );
    }
    if (params?.enable_data_replication !== undefined) {
      queryParams.append(
        "enable_data_replication",
        params.enable_data_replication.toString()
      );
    }

    const response = await api.get(`${GetCompanyConfigs}?${queryParams}`);
    return response.data.data;
  },

  updateCompanyConfig: async (
    id: string,
    updates: UpdateCompanyConfigData
  ): Promise<CompanyConfig> => {
    const response = await api.patch(`${PatchCompanyConfig}/${id}`, updates);
    return response.data.data;
  },

  deleteCompanyConfig: async (id: string): Promise<void> => {
    await api.delete(`${DeleteCompanyConfig}/${id}`);
  },

  getCompanyConfigById: async (id: string): Promise<CompanyConfig> => {
    const response = await api.get(`${GetCompanyConfigs}/${id}`);
    return response.data.data;
  },

  getCompanyConfigByCompanyId: async (
    companyId: number
  ): Promise<CompanyConfig | null> => {
    try {
      const configs = await companyConfigService.getCompanyConfigs({
        companyId,
        itemsPerPage: 1,
      });
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error("Error fetching company config by companyId:", error);
      return null;
    }
  },
};
