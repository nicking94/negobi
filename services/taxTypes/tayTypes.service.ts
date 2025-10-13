import api from "../../utils/api";
import {
  PostTaxType,
  GetTaxTypes,
  PatchTaxType,
  DeleteTaxType,
  SyncTaxTypes,
} from "../taxTypes/taxTypes.route";

export interface GetTaxTypesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  tax_name?: string;
  tax_code?: string;
  applies_to?: string;
  is_active?: boolean;
}

// Tipos para los valores enumerados
export type AppliesTo = "Sales" | "Purchases" | "Both";

export interface TaxType {
  // Campos del response (GET)
  id: number;
  tax_name: string;
  tax_code: string;
  default_rate: number;
  is_percentage: boolean;
  applies_to_sales: boolean;
  applies_to_purchase: boolean;
  description: string;
  is_active: boolean;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateTaxTypeData {
  tax_name: string;
  tax_code: string;
  default_rate: number;
  is_percentage?: boolean;
  applies_to_sales?: boolean; // Add this
  applies_to_purchase?: boolean; // Add this
  description?: string;
  is_active?: boolean;
}

export interface UpdateTaxTypeData {
  tax_name?: string;
  tax_code?: string;
  default_rate?: number;
  is_percentage?: boolean;
  applies_to_sales?: boolean; // Add this
  applies_to_purchase?: boolean; // Add this
  description?: string;
  is_active?: boolean;
}

// Interfaces para sincronización
export interface SyncTaxTypeData {
  tax_name: string;
  tax_code: string;
  default_rate: number;
  is_percentage?: boolean;
  applies_to?: AppliesTo;
  description?: string;
  is_active?: boolean;
}

export interface SyncTaxTypesPayload {
  companyId: number;
  data: SyncTaxTypeData[];
}

export interface SyncResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Response interfaces
export interface TaxTypeResponse {
  success: boolean;
  data: TaxType;
}

export interface TaxTypesListResponse {
  success: boolean;
  data: TaxType[];
}

export interface PaginatedTaxTypesResponse {
  success: boolean;
  data: {
    data: TaxType[];
    totalPages: number;
    total: number;
  };
}

export const taxTypeService = {
  // Crear un nuevo tipo de impuesto
  createTaxType: async (taxTypeData: CreateTaxTypeData): Promise<TaxType> => {
    // If user provides applies_to, convert it
    const formattedData = { ...taxTypeData };

    // Remove applies_to if it exists (it shouldn't be in CreateTaxTypeData anymore)
    delete (formattedData as any).applies_to;

    const response = await api.post(PostTaxType, formattedData);
    return response.data;
  },

  // Obtener todos los tipos de impuestos
  getTaxTypes: async (params?: GetTaxTypesParams): Promise<TaxType[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.tax_name) {
      queryParams.append("tax_name", params.tax_name);
    }
    if (params?.tax_code) {
      queryParams.append("tax_code", params.tax_code);
    }
    if (params?.applies_to) {
      queryParams.append("applies_to", params.applies_to);
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetTaxTypes}?${queryParams}`);
    return response.data;
  },

  // Actualizar un tipo de impuesto
  updateTaxType: async (
    id: string,
    updates: UpdateTaxTypeData
  ): Promise<TaxType> => {
    const formattedUpdates = { ...updates };

    // Remove applies_to if it exists
    delete (formattedUpdates as any).applies_to;

    const response = await api.patch(`${PatchTaxType}/${id}`, formattedUpdates);
    return response.data;
  },

  // Eliminar un tipo de impuesto
  deleteTaxType: async (id: string): Promise<void> => {
    await api.delete(`${DeleteTaxType}/${id}`);
  },

  // Obtener un tipo de impuesto por ID
  getTaxTypeById: async (id: string): Promise<TaxType> => {
    const response = await api.get(`${GetTaxTypes}/${id}`);
    return response.data;
  },

  // Sincronizar tipos de impuestos desde ERP
  syncTaxTypes: async (
    syncData: SyncTaxTypesPayload
  ): Promise<SyncResponse> => {
    const response = await api.post(SyncTaxTypes, syncData);
    return response.data;
  },

  // Métodos adicionales útiles
  getActiveTaxTypes: async (): Promise<TaxType[]> => {
    return taxTypeService.getTaxTypes({
      is_active: true,
      itemsPerPage: 10,
    });
  },

  getSalesTaxTypes: async (): Promise<TaxType[]> => {
    const allTaxTypes = await taxTypeService.getTaxTypes({
      itemsPerPage: 10,
    });
    return allTaxTypes.filter(
      (taxType) => taxType.applies_to_sales && taxType.is_active
    );
  },

  getPurchaseTaxTypes: async (): Promise<TaxType[]> => {
    const allTaxTypes = await taxTypeService.getTaxTypes({
      itemsPerPage: 10,
    });
    return allTaxTypes.filter(
      (taxType) => taxType.applies_to_purchase && taxType.is_active
    );
  },

  getTaxTypeByCode: async (code: string): Promise<TaxType | null> => {
    try {
      const taxTypes = await taxTypeService.getTaxTypes({
        tax_code: code,
        itemsPerPage: 1,
      });
      return taxTypes.length > 0 ? taxTypes[0] : null;
    } catch (error) {
      console.error("Error fetching tax type by code:", error);
      return null;
    }
  },

  // Calcular impuesto
  calculateTax: (amount: number, taxType: TaxType): number => {
    if (taxType.is_percentage) {
      return amount * (taxType.default_rate / 100);
    } else {
      return taxType.default_rate;
    }
  },
};
