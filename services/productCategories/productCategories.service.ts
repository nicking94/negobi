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
  companyId?: number;
}
export interface ParentCategory {
  id: number;
  category_name: string;
  category_code: string;
}

export interface ProductCategory {
  id: number;
  category_name: string;
  category_code: string;
  description: string;
  is_active: boolean;
  correlative_length: number;
  prefix: string;
  value: number;
  is_service_category: boolean | null;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;
  parentCategoryId?: number;
  parent_category?: ParentCategory | null;
  companyId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductCategoryData {
  companyId: number;
  category_name: string;
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

export interface ProductCategoriesApiResponse {
  success: boolean;
  data: {
    data: ProductCategory[];
    total: number;
    page: number;
    totalPages: number;
    itemsPerPage: number;
    order?: string;
  };
}
export interface ProductCategoryResponse {
  success: boolean;
  data: ProductCategory;
}

export interface ProductCategoriesListResponse {
  success: boolean;
  data: ProductCategory[];
}

export interface PaginatedProductCategoriesResponse {
  data: ProductCategory[];
  total: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  order?: string;
}

export const productCategoryService = {
  createProductCategory: async (
    categoryData: CreateProductCategoryData
  ): Promise<ProductCategory> => {
    const response = await api.post(PostProductCategory, categoryData);
    return response.data.data;
  },

  getProductCategories: async (
    params?: GetProductCategoriesParams
  ): Promise<PaginatedProductCategoriesResponse> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    if (params?.search) queryParams.append("search", params.search);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.parentCategoryId) {
      queryParams.append(
        "parentCategoryId",
        params.parentCategoryId.toString()
      );
    }
    if (params?.category_name)
      queryParams.append("category_name", params.category_name);
    if (params?.category_code)
      queryParams.append("category_code", params.category_code);

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

    const response = await api.get<ProductCategoriesApiResponse>(
      `${GetProductCategories}?${queryParams}`
    );

    return response.data.data;
  },

  updateProductCategory: async (
    id: string,
    updates: UpdateProductCategoryData
  ): Promise<ProductCategory> => {
    const response = await api.patch(`${PatchProductCategory}/${id}`, updates);
    return response.data.data;
  },

  deleteProductCategory: async (id: string): Promise<void> => {
    await api.delete(`${DeleteProductCategory}/${id}`);
  },

  getProductCategoryById: async (id: string): Promise<ProductCategory> => {
    const response = await api.get(`${GetProductCategories}/${id}`);
    return response.data.data;
  },

  syncProductCategories: async (
    syncData: SyncProductCategoriesPayload
  ): Promise<SyncResponse> => {
    const response = await api.post(SyncProductCategories, syncData);
    return response.data;
  },

  getCategoriesByCompany: async (
    companyId: number
  ): Promise<ProductCategory[]> => {
    const response = await productCategoryService.getProductCategories({
      itemsPerPage: 100,
    });
    return response.data;
  },

  getActiveCategories: async (
    companyId?: number
  ): Promise<ProductCategory[]> => {
    const params: GetProductCategoriesParams = {
      is_active: true,
      itemsPerPage: 100,
    };

    const response = await productCategoryService.getProductCategories(params);
    return response.data;
  },

  getCategoriesTree: async (): Promise<ProductCategory[]> => {
    const response = await productCategoryService.getProductCategories({
      itemsPerPage: 100,
    });
    const categories = response.data;

    const buildTree = (parentId?: number): ProductCategory[] => {
      return categories
        .filter((category) => {
          if (!parentId && !category.parent_category) return true;

          if (parentId && category.parent_category) {
            return category.parent_category.id === parentId;
          }
          return false;
        })
        .map((category) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  },
};
