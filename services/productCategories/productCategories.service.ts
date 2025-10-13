import api from "../../utils/api";
import {
  PostProductCategory,
  GetProductCategories,
  PatchProductCategory,
  DeleteProductCategory,
  SyncProductCategories,
} from "../productCategories/productCategories.route";

export interface GetProductCategoriesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  parentCategoryId?: number;
  category_name?: string;
  category_code?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  companyId?: number; // Agregado para filtrar por empresa
}

export interface ProductCategory {
  // Campos del response (GET)
  id: number;
  category_name: string;
  category_code: string;
  description: string;
  is_active: boolean;
  correlative_length: number;
  prefix: string;
  value: number;
  is_service_category: boolean;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;

  // Campos de relación
  parentCategoryId?: number;
  companyId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductCategoryData {
  // Campos requeridos para crear una categoría
  companyId: number;
  category_name: string;

  // Campos opcionales para creación
  parentCategoryId?: number;
  category_code?: string;
  description?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  correlative_length?: number;
  prefix?: string;
}

export interface UpdateProductCategoryData {
  // Todos los campos son opcionales para actualización
  parentCategoryId?: number;
  companyId?: number;
  category_name?: string;
  category_code?: string;
  description?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  correlative_length?: number;
  prefix?: string;
}

// Interfaces para sincronización
export interface SyncProductCategoryData {
  parentCategoryId?: number;
  companyId: number;
  category_name: string;
  category_code?: string;
  description?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  correlative_length?: number;
  prefix?: string;
}

export interface SyncProductCategoriesPayload {
  companyId: number;
  data: SyncProductCategoryData[];
}

export interface SyncResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Response interfaces
export interface ProductCategoryResponse {
  success: boolean;
  data: ProductCategory;
}

export interface ProductCategoriesListResponse {
  success: boolean;
  data: ProductCategory[];
}

export interface PaginatedProductCategoriesResponse {
  success: boolean;
  data: {
    data: ProductCategory[];
    totalPages: number;
    total: number;
  };
}

export const productCategoryService = {
  // Crear una nueva categoría de producto
  createProductCategory: async (
    categoryData: CreateProductCategoryData
  ): Promise<ProductCategory> => {
    const response = await api.post(PostProductCategory, categoryData);
    return response.data.data;
  },

  // Obtener todas las categorías de productos
  getProductCategories: async (
    params?: GetProductCategoriesParams
  ): Promise<ProductCategory[]> => {
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
    if (params?.parentCategoryId) {
      queryParams.append(
        "parentCategoryId",
        params.parentCategoryId.toString()
      );
    }
    if (params?.category_name) {
      queryParams.append("category_name", params.category_name);
    }
    if (params?.category_code) {
      queryParams.append("category_code", params.category_code);
    }
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }
    if (params?.show_in_ecommerce !== undefined) {
      queryParams.append(
        "show_in_ecommerce",
        params.show_in_ecommerce.toString()
      );
    }
    if (params?.show_in_sales_app !== undefined) {
      queryParams.append(
        "show_in_sales_app",
        params.show_in_sales_app.toString()
      );
    }

    const response = await api.get(`${GetProductCategories}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar una categoría de producto
  updateProductCategory: async (
    id: string,
    updates: UpdateProductCategoryData
  ): Promise<ProductCategory> => {
    const response = await api.patch(`${PatchProductCategory}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una categoría de producto
  deleteProductCategory: async (id: string): Promise<void> => {
    await api.delete(`${DeleteProductCategory}/${id}`);
  },

  // Obtener una categoría por ID
  getProductCategoryById: async (id: string): Promise<ProductCategory> => {
    const response = await api.get(`${GetProductCategories}/${id}`);
    return response.data.data;
  },

  // Sincronizar categorías desde ERP
  syncProductCategories: async (
    syncData: SyncProductCategoriesPayload
  ): Promise<SyncResponse> => {
    const response = await api.post(SyncProductCategories, syncData);
    return response.data;
  },

  // Métodos adicionales útiles
  getCategoriesByCompany: async (
    companyId: number
  ): Promise<ProductCategory[]> => {
    return productCategoryService.getProductCategories({
      companyId,
      itemsPerPage: 10,
    });
  },

  getActiveCategories: async (
    companyId?: number
  ): Promise<ProductCategory[]> => {
    const params: GetProductCategoriesParams = {
      is_active: true,
      itemsPerPage: 10,
    };
    if (companyId) {
      params.companyId = companyId;
    }
    return productCategoryService.getProductCategories(params);
  },

  getCategoriesTree: async (companyId: number): Promise<ProductCategory[]> => {
    const categories = await productCategoryService.getCategoriesByCompany(
      companyId
    );

    // Organizar categorías en estructura de árbol
    const buildTree = (parentId?: number): ProductCategory[] => {
      return categories
        .filter((category) => category.parentCategoryId === parentId)
        .map((category) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  },
};
