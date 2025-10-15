import api from "../../utils/api";
import {
  PostProduct,
  GetProducts,
  PatchProduct,
  DeleteProduct,
  GetProductUnits,
  SyncProducts,
} from "./products.routes";

// Interfaces para parámetros de búsqueda - CORREGIR
export interface GetProductsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
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
}

// Interface principal del producto
// Interface principal del producto - CORREGIR
export interface Product {
  // Campos del sistema
  id: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Información básica
  product_name: string;
  code: string;
  sku: string;
  description: string;

  // Precios y costos
  base_price: number;
  current_cost: number;
  previous_cost: number;
  average_cost: number;

  // Niveles de precio
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  price_level_4: number;
  price_level_5: number;

  // Gestión de inventario
  manages_serials: boolean;
  manages_lots: boolean;
  uses_decimals_in_quantity: boolean;
  uses_scale_for_weight: boolean;

  // Impuestos
  is_tax_exempt: boolean;

  // Dimensiones y peso
  weight_value: number;
  weight_unit: string;
  volume_value: number;
  volume_unit: string;
  length_value: number;
  width_value: number;
  height_value: number;
  dimension_unit: string;

  // Visibilidad
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;

  // Stock
  stock_quantity: number;
  total_quantity_reserved: number;
  total_quantity_on_order: number;

  // Estado
  is_active: boolean;

  // Códigos ERP
  erp_code_inst: string;

  companyId?: number;
  categoryId?: number; // ← Mantener para compatibilidad
  category?: {
    // ← AGREGAR para manejar la respuesta del backend
    id: number;
    category_name?: string; // Opcional: para mostrar nombre directamente
  };
  brand_id?: number;
}
// Interface para crear producto
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

// Interface para actualizar producto
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
}

// Interface para sincronización
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

// Interface para unidades
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
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  // Agregar propiedades opcionales según Swagger
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

export interface ProductUnitsResponse {
  success: boolean;
  data: {
    message: string;
    units?: ProductUnit[];
  };
  message?: string;
  statusCode?: number;
}

export interface SyncProductsResponse {
  success: boolean;
  data: SyncProductResponse[];
  message?: string;
  statusCode?: number;
}

export const productService = {
  // Crear un nuevo producto (ACTUALIZADO)
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    try {
      const response = await api.post<ProductResponse>(
        PostProduct,
        productData
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al crear producto");
      }

      // MAPEAR LA RESPUESTA PARA MANEJAR category object
      const productResponse = response.data.data;
      return {
        ...productResponse,
        // Asegurar que categoryId esté disponible tanto si viene en category object como directamente
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
      // Crear objeto de parámetros limpio
      const cleanParams: Record<string, any> = {};

      if (params) {
        // Procesar cada parámetro individualmente
        Object.keys(params).forEach((key) => {
          const value = params[key as keyof GetProductsParams];

          // Solo incluir valores definidos y no vacíos
          if (value !== undefined && value !== null && value !== "") {
            // Para parámetros numéricos, asegurarse de que sean números válidos
            if (
              [
                "page",
                "itemsPerPage",
                "companyId",
                "categoryId",
                "brand_id",
                "unit_id",
                "default_warehouse_id",
              ].includes(key)
            ) {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                cleanParams[key] = numValue;
              }
            }
            // Para parámetros booleanos
            else if (
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
            }
            // Para strings y otros
            else {
              cleanParams[key] = value;
            }
          }
        });
      }

      console.log("🔵 Fetching products with cleaned params:", cleanParams);
      console.log(
        "🔵 URL params:",
        new URLSearchParams(cleanParams).toString()
      );

      const response = await api.get<PaginatedProductsResponse>(GetProducts, {
        params: cleanParams,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener productos");
      }

      // MAPEAR LOS PRODUCTOS PARA GARANTIZAR categoryId ESTÉ DISPONIBLE
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

      // Log detallado del error
      if (error.response) {
        console.error("❌ Error response:", error.response.data);
        console.error("❌ Error status:", error.response.status);
      }

      throw new Error(
        error.response?.data?.message || "Error al obtener productos"
      );
    }
  },

  // Obtener producto por ID (ACTUALIZADO)
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<ProductResponse>(`${GetProducts}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Producto no encontrado");
      }

      // MAPEAR LA RESPUESTA
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

  // Actualizar producto (ACTUALIZADO)
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

      // MAPEAR LA RESPUESTA
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

  // Eliminar producto (CORREGIDO)
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

  // Obtener unidades de productos (CORREGIDO)
  getProductUnits: async (): Promise<ProductUnit[]> => {
    try {
      const response = await api.get<ProductUnitsResponse>(GetProductUnits);
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener unidades");
      }
      // Ajustar según la estructura real de tu API
      return (response.data.data as any).units || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener unidades"
      );
    }
  },

  // Sincronizar productos desde ERP
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
    return response.data; // Extraer el array de productos de la respuesta paginada
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
      categoryId: categoryId,
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
