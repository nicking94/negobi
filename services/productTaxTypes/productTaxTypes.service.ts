import api from "../../utils/api";
import {
  PostProductTaxType,
  GetProductTaxTypes,
  PatchProductTaxType,
  DeleteProductTaxType,
  SyncProductTaxTypes,
} from "../productTaxTypes/productTaxTypes.route";

export interface GetProductTaxTypesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  productId?: number;
  taxTypeId?: number;
  is_active?: boolean;
}

export interface ProductTaxType {
  // Campos del response (GET)
  id: number;
  tax_rate: number;
  erp_code_product: string;
  erp_code_tax: string;

  // Campos de relación
  productId?: number;
  taxTypeId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductTaxTypeData {
  // Campos requeridos para crear una relación producto-impuesto
  productId: number;
  taxTypeId: number;

  // Campos opcionales para creación
  tax_rate_override?: number;
  erp_code_product?: string;
  erp_code_tax?: string;
}

export interface UpdateProductTaxTypeData {
  // Todos los campos son opcionales para actualización
  productId?: number;
  taxTypeId?: number;
  tax_rate_override?: number;
  erp_code_product?: string;
  erp_code_tax?: string;
}

// Interfaces para sincronización
export interface SyncProductTaxTypeData {
  productId: number;
  taxTypeId: number;
  tax_rate_override?: number;
  erp_code_product?: string;
  erp_code_tax?: string;
}

export interface SyncProductTaxTypesPayload {
  companyId: number;
  data: SyncProductTaxTypeData[];
}

export interface SyncResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Response interfaces
export interface ProductTaxTypeResponse {
  success: boolean;
  data: ProductTaxType;
}

export interface ProductTaxTypesListResponse {
  success: boolean;
  data: ProductTaxType[];
}

export interface PaginatedProductTaxTypesResponse {
  success: boolean;
  data: {
    data: ProductTaxType[];
    totalPages: number;
    total: number;
  };
}

export const productTaxTypeService = {
  // Crear una nueva relación producto-impuesto
  createProductTaxType: async (
    productTaxTypeData: CreateProductTaxTypeData
  ): Promise<ProductTaxType> => {
    const response = await api.post(PostProductTaxType, productTaxTypeData);
    return response.data.data;
  },

  // Obtener todas las relaciones producto-impuesto
  getProductTaxTypes: async (
    params?: GetProductTaxTypesParams
  ): Promise<ProductTaxType[]> => {
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
    if (params?.productId) {
      queryParams.append("productId", params.productId.toString());
    }
    if (params?.taxTypeId) {
      queryParams.append("taxTypeId", params.taxTypeId.toString());
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetProductTaxTypes}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar una relación producto-impuesto
  updateProductTaxType: async (
    id: string,
    updates: UpdateProductTaxTypeData
  ): Promise<ProductTaxType> => {
    const response = await api.patch(`${PatchProductTaxType}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una relación producto-impuesto
  deleteProductTaxType: async (id: string): Promise<void> => {
    await api.delete(`${DeleteProductTaxType}/${id}`);
  },

  // Obtener una relación por ID
  getProductTaxTypeById: async (id: string): Promise<ProductTaxType> => {
    const response = await api.get(`${GetProductTaxTypes}/${id}`);
    return response.data.data;
  },

  // Sincronizar relaciones producto-impuesto desde ERP
  syncProductTaxTypes: async (
    syncData: SyncProductTaxTypesPayload
  ): Promise<SyncResponse> => {
    const response = await api.post(SyncProductTaxTypes, syncData);
    return response.data;
  },

  // Métodos adicionales útiles
  getProductTaxTypesByProduct: async (
    productId: number
  ): Promise<ProductTaxType[]> => {
    return productTaxTypeService.getProductTaxTypes({
      productId,
      itemsPerPage: 1000,
    });
  },

  getProductTaxTypesByTaxType: async (
    taxTypeId: number
  ): Promise<ProductTaxType[]> => {
    return productTaxTypeService.getProductTaxTypes({
      taxTypeId,
      itemsPerPage: 1000,
    });
  },

  getTaxRateForProduct: async (
    productId: number,
    taxTypeId: number
  ): Promise<number | null> => {
    try {
      const productTaxTypes = await productTaxTypeService.getProductTaxTypes({
        productId,
        taxTypeId,
        itemsPerPage: 1,
      });

      if (productTaxTypes.length > 0) {
        return productTaxTypes[0].tax_rate;
      }
      return null;
    } catch (error) {
      console.error("Error fetching tax rate for product:", error);
      return null;
    }
  },

  // Asignar múltiples impuestos a un producto
  assignTaxTypesToProduct: async (
    productId: number,
    taxTypeIds: number[],
    taxRates?: { [taxTypeId: number]: number }
  ): Promise<ProductTaxType[]> => {
    const createdRelations: ProductTaxType[] = [];

    for (const taxTypeId of taxTypeIds) {
      try {
        const taxRate = taxRates?.[taxTypeId];
        const relationData: CreateProductTaxTypeData = {
          productId,
          taxTypeId,
          tax_rate_override: taxRate,
        };

        const createdRelation =
          await productTaxTypeService.createProductTaxType(relationData);
        createdRelations.push(createdRelation);
      } catch (error) {
        console.error(
          `Error assigning tax type ${taxTypeId} to product ${productId}:`,
          error
        );
        throw error;
      }
    }

    return createdRelations;
  },

  // Remover todos los impuestos de un producto
  removeAllTaxTypesFromProduct: async (productId: number): Promise<void> => {
    try {
      const productTaxTypes =
        await productTaxTypeService.getProductTaxTypesByProduct(productId);

      for (const relation of productTaxTypes) {
        await productTaxTypeService.deleteProductTaxType(
          relation.id.toString()
        );
      }
    } catch (error) {
      console.error("Error removing tax types from product:", error);
      throw error;
    }
  },
};
