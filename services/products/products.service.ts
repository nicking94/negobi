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

// Response interfaces
export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsListResponse {
  success: boolean;
  data: Product[];
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    totalPages: number;
    total: number;
  };
}

export interface DeleteProductResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const productService = {
  // Crear un nuevo producto
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const response = await api.post<ProductResponse>(PostProduct, productData);
    return response.data.data;
  },

  getProducts: async (
    params?: GetProductsParams
  ): Promise<Product[] | PaginatedProductsResponse["data"]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Solo agregar companyId si tiene valor (es requerido según Swagger)
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    // Parámetros opcionales
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

    // CORRECCIÓN: Enviar booleanos como literales true/false
    if (params?.manages_serials !== undefined)
      queryParams.append(
        "manages_serials",
        params.manages_serials ? "true" : "false"
      );
    if (params?.manages_lots !== undefined)
      queryParams.append(
        "manages_lots",
        params.manages_lots ? "true" : "false"
      );
    if (params?.is_tax_exempt !== undefined)
      queryParams.append(
        "is_tax_exempt",
        params.is_tax_exempt ? "true" : "false"
      );
    if (params?.show_in_ecommerce !== undefined)
      queryParams.append(
        "show_in_ecommerce",
        params.show_in_ecommerce ? "true" : "false"
      );
    if (params?.show_in_sales_app !== undefined)
      queryParams.append(
        "show_in_sales_app",
        params.show_in_sales_app ? "true" : "false"
      );
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active ? "true" : "false"); // ← Aquí está la corrección

    console.log(
      "📡 URL final para productos:",
      `${GetProducts}?${queryParams}`
    );

    const response = await api.get<PaginatedProductsResponse>(
      `${GetProducts}?${queryParams}`
    );

    return response.data.data;
  },

  // También aplica la misma corrección en getAllProducts:
  getAllProducts: async (
    params?: Omit<GetProductsParams, "page" | "itemsPerPage">
  ): Promise<Product[]> => {
    const queryParams = new URLSearchParams();

    // Solo agregar companyId si tiene valor
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    // Parámetros opcionales (excluyendo paginación)
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

    // CORRECCIÓN: Aplicar el mismo formato para booleanos
    if (params?.manages_serials !== undefined)
      queryParams.append(
        "manages_serials",
        params.manages_serials ? "true" : "false"
      );
    if (params?.manages_lots !== undefined)
      queryParams.append(
        "manages_lots",
        params.manages_lots ? "true" : "false"
      );
    if (params?.is_tax_exempt !== undefined)
      queryParams.append(
        "is_tax_exempt",
        params.is_tax_exempt ? "true" : "false"
      );
    if (params?.show_in_ecommerce !== undefined)
      queryParams.append(
        "show_in_ecommerce",
        params.show_in_ecommerce ? "true" : "false"
      );
    if (params?.show_in_sales_app !== undefined)
      queryParams.append(
        "show_in_sales_app",
        params.show_in_sales_app ? "true" : "false"
      );
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active ? "true" : "false");

    const response = await api.get<ProductsListResponse>(
      `${GetProducts}?${queryParams}`
    );

    return response.data.data;
  },

  // Obtener producto por ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<ProductResponse>(`${GetProducts}/${id}`);
    return response.data.data;
  },

  // Actualizar producto
  updateProduct: async (
    id: string,
    updates: UpdateProductData
  ): Promise<Product> => {
    const response = await api.patch<ProductResponse>(
      `${PatchProduct}/${id}`,
      updates
    );
    return response.data.data;
  },

  // Eliminar producto
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete<DeleteProductResponse>(`${DeleteProduct}/${id}`);
  },

  // Obtener unidades de productos
  getProductUnits: async (): Promise<ProductUnit[]> => {
    const response = await api.get<ProductUnitsResponse>(GetProductUnits);
    // Asumiendo que la respuesta contiene un array de unidades en data.units
    return response.data.data.units || [];
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
