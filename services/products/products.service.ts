import api from "../../utils/api";
import {
  PostProduct,
  GetProducts,
  PatchProduct,
  DeleteProduct,
  GetProductUnits,
  SyncProducts,
} from "./products.routes";

export interface GetProductsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
  product_name?: string;
  sku?: string;
  category_id?: number;
  brand_id?: number;
  unit_id?: number;
  default_warehouse_id?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  is_tax_exempt?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  is_active?: boolean;
}

export interface UseProductsFilters {
  page?: number;
  itemsPerPage?: number;
  companyId?: number;
  product_name?: string;
  sku?: string;
  categoryId?: number;
  brand_id?: number;
  unit_id?: number;
  default_warehouse_id?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  is_tax_exempt?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  is_active?: boolean;
  search?: string;
}

export interface Product {
  id: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  product_name: string;
  code: string;
  sku: string;
  description: string;
  base_price: number;
  current_cost: number;
  previous_cost: number;
  average_cost: number;
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  price_level_4: number;
  price_level_5: number;
  manages_serials: boolean;
  manages_lots: boolean;
  uses_decimals_in_quantity: boolean;
  uses_scale_for_weight: boolean;
  is_tax_exempt: boolean;
  weight_value: number;
  weight_unit: string;
  volume_value: number;
  volume_unit: string;
  length_value: number;
  width_value: number;
  height_value: number;
  dimension_unit: string;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;
  stock_quantity: number;
  total_quantity_reserved: number;
  total_quantity_on_order: number;
  is_active: boolean;
  erp_code_inst: string;
  companyId: number;
  categoryId: number;
  category?: {
    id: number;
    category_name?: string;
  };
  brand_id?: number;
}

export interface CreateProductData {
  product_name: string;
  companyId: number;
  categoryId?: number;
  code: string;
  sku: string;
  description?: string;
  base_price: number;
  brand_id?: number | null;
  current_cost?: number;
  previous_cost?: number;
  average_cost?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  uses_decimals_in_quantity?: boolean;
  uses_scale_for_weight?: boolean;
  is_tax_exempt?: boolean;
  weight_value?: number;
  weight_unit?: string;
  volume_value?: number;
  volume_unit?: string;
  length_value?: number;
  width_value?: number;
  height_value?: number;
  dimension_unit?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  price_level_1?: number;
  price_level_2?: number;
  price_level_3?: number;
  price_level_4?: number;
  price_level_5?: number;
  stock_quantity?: number;
  total_quantity_reserved?: number;
  total_quantity_on_order?: number;
  is_active?: boolean;
  erp_code_inst?: string;
  external_code?: string;
}

export interface UpdateProductData {
  product_name?: string;
  categoryId?: number;
  code?: string;
  sku?: string;
  description?: string;
  base_price?: number;
  brand_id?: number | null;
  current_cost?: number;
  previous_cost?: number;
  average_cost?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  uses_decimals_in_quantity?: boolean;
  uses_scale_for_weight?: boolean;
  is_tax_exempt?: boolean;
  weight_value?: number;
  weight_unit?: string;
  volume_value?: number;
  volume_unit?: string;
  length_value?: number;
  width_value?: number;
  height_value?: number;
  dimension_unit?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  price_level_1?: number;
  price_level_2?: number;
  price_level_3?: number;
  price_level_4?: number;
  price_level_5?: number;
  stock_quantity?: number;
  total_quantity_reserved?: number;
  total_quantity_on_order?: number;
  is_active?: boolean;
  erp_code_inst?: string;
  external_code?: string;
  sync_with_erp?: boolean;
  location?: Record<string, any>;
}

export interface SyncProductData {
  product_name: string;
  companyId: number;
  categoryId?: number;
  code: string;
  sku: string;
  description?: string;
  base_price: number;
  brand_id?: number;
  current_cost?: number;
  previous_cost?: number;
  average_cost?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  uses_decimals_in_quantity?: boolean;
  uses_scale_for_weight?: boolean;
  is_tax_exempt?: boolean;
  weight_value?: number;
  weight_unit?: string;
  volume_value?: number;
  volume_unit?: string;
  length_value?: number;
  width_value?: number;
  height_value?: number;
  dimension_unit?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  price_level_1?: number;
  price_level_2?: number;
  price_level_3?: number;
  price_level_4?: number;
  price_level_5?: number;
  stock_quantity?: number;
  total_quantity_reserved?: number;
  total_quantity_on_order?: number;
  is_active?: boolean;
  erp_code_inst: string;
  external_code?: string;
}

export interface SyncProductsPayload {
  companyId: number;
  data: SyncProductData[];
}

export interface SyncProductResponse {
  code: string;
  sync: boolean;
  error: string | null;
  negobi_db_id: number;
}

export interface SyncProductsResponse {
  success: boolean;
  data: SyncProductResponse[];
}

export interface ProductUnit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  is_active: boolean;
}

export interface ProductUnitsResponse {
  success: boolean;
  data: {
    message: string;
    units?: ProductUnit[];
  };
  message?: string;
  statusCode?: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
  statusCode?: number;
}

export interface ProductsListResponse {
  success: boolean;
  data: Product[];
  message?: string;
  statusCode?: number;
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    totalPages: number;
    total: number;
  };
  message?: string;
  statusCode?: number;
}

export interface DeleteProductResponse {
  success: boolean;
  data: {
    message: string;
  };
  message?: string;
  statusCode?: number;
}

export const productService = {
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    try {
      const response = await api.post<ProductResponse>(
        PostProduct,
        productData
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al crear producto");
      }

      const productResponse = response.data.data;
      return {
        ...productResponse,
        categoryId: productResponse.category?.id || productResponse.categoryId,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear producto"
      );
    }
  },

  getProducts: async (
    params?: GetProductsParams
  ): Promise<PaginatedProductsResponse["data"]> => {
    try {
      const cleanParams: Record<string, any> = {};

      if (params) {
        Object.keys(params).forEach((key) => {
          const value = params[key as keyof GetProductsParams];

          if (value !== undefined && value !== null && value !== "") {
            if (
              [
                "page",
                "itemsPerPage",
                "companyId",
                "category_id",
                "brand_id",
                "unit_id",
                "default_warehouse_id",
              ].includes(key)
            ) {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                cleanParams[key] = numValue;
              }
            } else if (
              [
                "manages_serials",
                "manages_lots",
                "is_tax_exempt",
                "show_in_ecommerce",
                "show_in_sales_app",
                "is_active",
              ].includes(key)
            ) {
              cleanParams[key] = Boolean(value);
            } else {
              cleanParams[key] = value;
            }
          }
        });
      }

      const response = await api.get<PaginatedProductsResponse>(GetProducts, {
        params: cleanParams,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener productos");
      }

      const mappedData = {
        ...response.data.data,
        data: response.data.data.data.map((product) => ({
          ...product,
          categoryId: product.category?.id || product.categoryId,
        })),
      };

      return mappedData;
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);

      if (error.response) {
        console.error("❌ Error response:", error.response.data);
        console.error("❌ Error status:", error.response.status);
      }

      throw new Error(
        error.response?.data?.message || "Error al obtener productos"
      );
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<ProductResponse>(`${GetProducts}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Producto no encontrado");
      }

      const productResponse = response.data.data;
      return {
        ...productResponse,
        categoryId: productResponse.category?.id || productResponse.categoryId,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener producto"
      );
    }
  },

  updateProduct: async (
    id: string,
    updates: UpdateProductData
  ): Promise<Product> => {
    try {
      const response = await api.patch<ProductResponse>(
        `${PatchProduct}/${id}`,
        updates
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error al actualizar producto"
        );
      }

      const productResponse = response.data.data;
      return {
        ...productResponse,
        categoryId: productResponse.category?.id || productResponse.categoryId,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar producto"
      );
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<DeleteProductResponse>(
        `${DeleteProduct}/${id}`
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al eliminar producto");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar producto"
      );
    }
  },

  getProductUnits: async (): Promise<ProductUnit[]> => {
    try {
      const response = await api.get<ProductUnitsResponse>(GetProductUnits);
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener unidades");
      }

      return response.data.data.units || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener unidades"
      );
    }
  },

  syncProducts: async (
    syncData: SyncProductsPayload
  ): Promise<SyncProductResponse[]> => {
    const response = await api.post<SyncProductsResponse>(
      SyncProducts,
      syncData
    );
    return response.data.data;
  },

  getProductsByCompany: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const response = await productService.getProducts({
      companyId,
      ...params,
    });
    return response.data;
  },

  getActiveProducts: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const response = await productService.getProducts({
      companyId,
      is_active: true,
      ...params,
    });
    return response.data;
  },

  searchProducts: async (
    companyId: number,
    searchTerm: string,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const response = await productService.getProducts({
      companyId,
      search: searchTerm,
      ...params,
    });
    return response.data;
  },

  getProductsByCategory: async (
    companyId: number,
    categoryId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const response = await productService.getProducts({
      companyId,
      category_id: categoryId,
      ...params,
    });
    return response.data;
  },

  getProductsWithTaxes: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const response = await productService.getProducts({
      companyId,
      ...params,
    });
    return response.data;
  },
};
