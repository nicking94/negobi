import api from "../../utils/api";
import {
  PostProduct,
  GetProducts,
  PatchProduct,
  DeleteProduct,
  GetProductUnits,
  SyncProducts,
} from "./products.routes";

// Interfaces para parámetros de búsqueda
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

// Interface principal del producto
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

  // Relaciones
  companyId?: number;
  categoryId?: number;
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
  // Crear un nuevo producto (CORREGIDO)
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    try {
      const response = await api.post<ProductResponse>(
        PostProduct,
        productData
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Error al crear producto");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear producto"
      );
    }
  },

  // Obtener productos paginados (CORREGIDO)
  getProducts: async (
    params?: GetProductsParams
  ): Promise<PaginatedProductsResponse["data"]> => {
    try {
      const queryParams = new URLSearchParams();

      // Parámetros requeridos
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.itemsPerPage)
        queryParams.append("itemsPerPage", params.itemsPerPage.toString());

      // Parámetros opcionales - CORREGIDO: usar nombres exactos del Swagger
      if (params?.companyId)
        queryParams.append("companyId", params.companyId.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.order) queryParams.append("order", params.order);
      if (params?.product_name)
        queryParams.append("product_name", params.product_name);
      if (params?.sku) queryParams.append("sku", params.sku);
      if (params?.category_id)
        queryParams.append("category_id", params.category_id.toString());
      if (params?.brand_id)
        queryParams.append("brand_id", params.brand_id.toString());
      if (params?.unit_id)
        queryParams.append("unit_id", params.unit_id.toString());
      if (params?.default_warehouse_id)
        queryParams.append(
          "default_warehouse_id",
          params.default_warehouse_id.toString()
        );

      // Parámetros booleanos - CORREGIDO: enviar como string "true"/"false"
      if (params?.manages_serials !== undefined)
        queryParams.append(
          "manages_serials",
          params.manages_serials.toString()
        );
      if (params?.manages_lots !== undefined)
        queryParams.append("manages_lots", params.manages_lots.toString());
      if (params?.is_tax_exempt !== undefined)
        queryParams.append("is_tax_exempt", params.is_tax_exempt.toString());
      if (params?.show_in_ecommerce !== undefined)
        queryParams.append(
          "show_in_ecommerce",
          params.show_in_ecommerce.toString()
        );
      if (params?.show_in_sales_app !== undefined)
        queryParams.append(
          "show_in_sales_app",
          params.show_in_sales_app.toString()
        );
      if (params?.is_active !== undefined)
        queryParams.append("is_active", params.is_active.toString());

      console.log(
        "🔵 Fetching products with params:",
        Object.fromEntries(queryParams)
      );

      const response = await api.get<PaginatedProductsResponse>(
        `${GetProducts}?${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener productos");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener productos"
      );
    }
  },

  // Obtener todos los productos sin paginación (CORREGIDO)
  getAllProducts: async (
    params?: Omit<GetProductsParams, "page" | "itemsPerPage">
  ): Promise<Product[]> => {
    try {
      // Usar getProducts con paginación grande para obtener todos
      const paginatedResponse = await productService.getProducts({
        ...params,
        page: 1,
        itemsPerPage: 1000, // O un número suficientemente grande
      });

      return paginatedResponse.data;
    } catch (error: any) {
      console.error("❌ Error fetching all products:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener productos"
      );
    }
  },

  // Obtener producto por ID (CORREGIDO)
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<ProductResponse>(`${GetProducts}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Producto no encontrado");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener producto"
      );
    }
  },

  // Actualizar producto (CORREGIDO)
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
      return response.data.data;
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

  // Métodos adicionales útiles
  getProductsByCompany: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    return productService.getAllProducts({
      companyId,
      ...params,
    });
  },

  getActiveProducts: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    return productService.getAllProducts({
      companyId,
      is_active: true,
      ...params,
    });
  },

  searchProducts: async (
    companyId: number,
    searchTerm: string,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    return productService.getAllProducts({
      companyId,
      search: searchTerm,
      ...params,
    });
  },

  getProductsByCategory: async (
    companyId: number,
    categoryId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    return productService.getAllProducts({
      companyId,
      category_id: categoryId,
      ...params,
    });
  },

  // Método para obtener productos con impuestos
  getProductsWithTaxes: async (
    companyId: number,
    params?: Partial<GetProductsParams>
  ): Promise<Product[]> => {
    const products = await productService.getAllProducts({
      companyId,
      ...params,
    });

    return products;
  },
};
