// hooks/productCategories/useProductCategories.ts
import { useState, useEffect } from "react";
import {
  productCategoryService,
  ProductCategory,
  CreateProductCategoryData,
  UpdateProductCategoryData,
  GetProductCategoriesParams,
  PaginatedProductCategoriesResponse, // Importar la interfaz corregida
} from "../../services/productCategories/productCategories.service";

export interface UseProductCategoriesFilters {
  parentCategoryId?: number;
  search?: string;
  category_name?: string;
  category_code?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  page?: number;
  itemsPerPage?: number;
}

export const useProductCategories = (
  filters: UseProductCategoriesFilters = {}
) => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(filters.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(filters.itemsPerPage || 10);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [modified, setModified] = useState(false);

  const loadProductCategories = async (
    customFilters?: Partial<UseProductCategoriesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetProductCategoriesParams = {
        page,
        itemsPerPage,
        ...(filters.is_active !== undefined && {
          is_active: filters.is_active,
        }),
        ...(filters.search && { search: filters.search }),
        ...(filters.category_name && { category_name: filters.category_name }),
        ...(filters.category_code && { category_code: filters.category_code }),
        ...(filters.parentCategoryId && {
          parentCategoryId: filters.parentCategoryId,
        }),
        ...(filters.show_in_ecommerce !== undefined && {
          show_in_ecommerce: filters.show_in_ecommerce,
        }),
        ...(filters.show_in_sales_app !== undefined && {
          show_in_sales_app: filters.show_in_sales_app,
        }),
        ...customFilters,
      };

      console.log("🔵 Enviando parámetros para categorías:", combinedFilters);

      const response: PaginatedProductCategoriesResponse =
        await productCategoryService.getProductCategories(combinedFilters);

      console.log("🟢 Respuesta completa de categorías:", response);

      // Ahora response tiene la estructura correcta
      if (response && Array.isArray(response.data)) {
        setProductCategories(response.data);
        setTotal(response.total);
        setTotalPage(response.totalPages);

        // Sincronizar la página actual con la respuesta
        if (response.page && response.page !== page) {
          setPage(response.page);
        }

        // Sincronizar itemsPerPage si es diferente
        if (response.itemsPerPage && response.itemsPerPage !== itemsPerPage) {
          setItemsPerPage(response.itemsPerPage);
        }
      } else {
        console.warn("⚠️ Estructura inesperada:", response);
        setProductCategories([]);
        setTotal(0);
        setTotalPage(0);
      }
    } catch (err) {
      console.error("❌ Error al cargar categorías:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías"
      );
      setProductCategories([]);
      setTotal(0);
      setTotalPage(0);
    } finally {
      setLoading(false);
    }
  };

  // Crear categoría
  const createProductCategory = async (
    categoryData: CreateProductCategoryData
  ): Promise<ProductCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await productCategoryService.createProductCategory(
        categoryData
      );
      // Recargar las categorías después de crear
      await loadProductCategories();
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear categoría");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría
  const updateProductCategory = async (
    id: string,
    updates: UpdateProductCategoryData
  ): Promise<ProductCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory =
        await productCategoryService.updateProductCategory(id, updates);
      // Recargar las categorías después de actualizar
      await loadProductCategories();
      return updatedCategory;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar categoría"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteProductCategory = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productCategoryService.deleteProductCategory(id);
      // Recargar las categorías después de eliminar
      await loadProductCategories();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar categoría"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadProductCategories();
  }, [
    filters.parentCategoryId,
    filters.search,
    filters.category_name,
    filters.category_code,
    filters.is_active,
    filters.show_in_ecommerce,
    filters.show_in_sales_app,
    page,
    itemsPerPage,
    modified,
  ]);

  return {
    productCategories,
    loading,
    error,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    total,
    totalPage,
    setModified,
    refetch: loadProductCategories,
  };
};
