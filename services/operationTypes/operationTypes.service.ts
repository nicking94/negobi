import api from "../../utils/api";
import {
  PostOperationType,
  GetOperationTypes,
  GetOperationTypeById,
  PatchOperationType,
  DeleteOperationType,
} from "../operationTypes/operationTypes.route";

export interface GetOperationTypesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  type_name?: string;
  description?: string;
  applies_to_module?: string;
  transaction_direction?: string;
  is_active?: boolean;
}

export interface OperationType {
  id: number;
  type_name: string;
  description: string;
  applies_to_module: string;
  transaction_direction: string;
  is_active: boolean;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateOperationTypeData {
  type_name: string;
  description: string;
  applies_to_module: string;
  transaction_direction: string;
  is_active: boolean;
  external_code?: string;
}

export interface UpdateOperationTypeData {
  type_name?: string;
  description?: string;
  applies_to_module?: string;
  transaction_direction?: string;
  is_active?: boolean;
  external_code?: string;
}

export interface OperationTypeResponse {
  success: boolean;
  data: OperationType;
}

export interface OperationTypesListResponse {
  success: boolean;
  data: OperationType[];
}

export interface PaginatedOperationTypesResponse {
  success: boolean;
  data: {
    data: OperationType[];
    totalPages: number;
    total: number;
  };
}

export const OPERATION_MODULES = {
  SALES: "sales",
  INVENTORY: "inventory",
  PURCHASE: "purchase",
  PRODUCTION: "production",
  TRANSFER: "transfer",
} as const;

export const TRANSACTION_DIRECTIONS = {
  IN: "in",
  OUT: "out",
  NEUTRAL: "neutral",
} as const;

export type OperationModule =
  (typeof OPERATION_MODULES)[keyof typeof OPERATION_MODULES];
export type TransactionDirection =
  (typeof TRANSACTION_DIRECTIONS)[keyof typeof TRANSACTION_DIRECTIONS];

export const operationTypeService = {
  createOperationType: async (
    operationTypeData: CreateOperationTypeData
  ): Promise<OperationType> => {
    const response = await api.post(PostOperationType, operationTypeData);
    return response.data.data;
  },

  getOperationTypes: async (
    params?: GetOperationTypesParams
  ): Promise<OperationType[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.type_name) {
      queryParams.append("type_name", params.type_name);
    }
    if (params?.description) {
      queryParams.append("description", params.description);
    }
    if (params?.applies_to_module) {
      queryParams.append("applies_to_module", params.applies_to_module);
    }
    if (params?.transaction_direction) {
      queryParams.append("transaction_direction", params.transaction_direction);
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetOperationTypes}?${queryParams}`);
    return response.data.data;
  },

  getOperationTypeById: async (id: string): Promise<OperationType> => {
    const response = await api.get(`${GetOperationTypeById}/${id}`);
    return response.data.data;
  },

  updateOperationType: async (
    id: string,
    updates: UpdateOperationTypeData
  ): Promise<OperationType> => {
    const response = await api.patch(`${PatchOperationType}/${id}`, updates);
    return response.data.data;
  },

  deleteOperationType: async (id: string): Promise<void> => {
    await api.delete(`${DeleteOperationType}/${id}`);
  },

  getActiveOperationTypes: async (): Promise<OperationType[]> => {
    return operationTypeService.getOperationTypes({
      is_active: true,
      itemsPerPage: 10,
    });
  },

  getOperationTypesByModule: async (
    module: OperationModule
  ): Promise<OperationType[]> => {
    return operationTypeService.getOperationTypes({
      applies_to_module: module,
      itemsPerPage: 10,
    });
  },

  getOperationTypesByDirection: async (
    direction: TransactionDirection
  ): Promise<OperationType[]> => {
    return operationTypeService.getOperationTypes({
      transaction_direction: direction,
      itemsPerPage: 10,
    });
  },

  searchOperationTypesByName: async (
    searchTerm: string
  ): Promise<OperationType[]> => {
    return operationTypeService.getOperationTypes({
      search: searchTerm,
      itemsPerPage: 10,
    });
  },

  toggleOperationTypeStatus: async (
    id: string,
    isActive: boolean
  ): Promise<OperationType> => {
    return operationTypeService.updateOperationType(id, {
      is_active: isActive,
    });
  },

  checkTypeNameExists: async (typeName: string): Promise<boolean> => {
    try {
      const operationTypes = await operationTypeService.getOperationTypes({
        type_name: typeName,
        itemsPerPage: 1,
      });
      return operationTypes.length > 0;
    } catch (error) {
      console.error("Error checking type name existence:", error);
      return false;
    }
  },

  getOperationTypesForSelect: async (): Promise<
    Array<{ value: number; label: string }>
  > => {
    try {
      const operationTypes =
        await operationTypeService.getActiveOperationTypes();
      return operationTypes.map((type) => ({
        value: type.id,
        label: type.type_name,
      }));
    } catch (error) {
      console.error("Error getting operation types for select:", error);
      return [];
    }
  },

  getOperationTypesGroupedByModule: async (): Promise<
    Record<string, OperationType[]>
  > => {
    try {
      const operationTypes =
        await operationTypeService.getActiveOperationTypes();
      return operationTypes.reduce((groups, type) => {
        const module = type.applies_to_module;
        if (!groups[module]) {
          groups[module] = [];
        }
        groups[module].push(type);
        return groups;
      }, {} as Record<string, OperationType[]>);
    } catch (error) {
      console.error("Error grouping operation types by module:", error);
      return {};
    }
  },
};
