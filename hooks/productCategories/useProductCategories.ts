// hooks/productCategories/useProductCategories.ts
import { useState, useEffect } from "react";
import {
  productCategoryService,
  ProductCategory,
  CreateProductCategoryData,
  UpdateProductCategoryData,
  GetProductCategoriesParams,
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

  // Cargar todas las categorías con filtros
  const loadProductCategories = async (
    customFilters?: Partial<UseProductCategoriesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros - REMOVER companyId ya que no es soportado por la API
      const combinedFilters: GetProductCategoriesParams = {
        page,
        itemsPerPage,
        // Solo incluir parámetros válidos
        ...(filters.search && { search: filters.search }),
        ...(filters.category_name && { category_name: filters.category_name }),
        ...(filters.category_code && { category_code: filters.category_code }),
        ...(filters.parentCategoryId && {
          parentCategoryId: filters.parentCategoryId,
        }),
        ...(filters.is_active !== undefined && {
          is_active: filters.is_active,
        }),
        ...(filters.show_in_ecommerce !== undefined && {
          show_in_ecommerce: filters.show_in_ecommerce,
        }),
        ...(filters.show_in_sales_app !== undefined && {
          show_in_sales_app: filters.show_in_sales_app,
        }),
        ...customFilters,
      };

      // Asegurarse de que is_active sea booleano
      if (combinedFilters.is_active !== undefined) {
        combinedFilters.is_active = Boolean(combinedFilters.is_active);
      }

      console.log("🔵 Enviando parámetros para categorías:", combinedFilters);

      const categoriesData = await productCategoryService.getProductCategories(
        combinedFilters
      );
      console.log("🟢 Datos de categorías recibidos:", categoriesData);

      if (Array.isArray(categoriesData)) {
        setProductCategories(categoriesData);
        setTotal(categoriesData.length);
        setTotalPage(Math.ceil(categoriesData.length / itemsPerPage));
      } else {
        console.warn("⚠️ Estructura inesperada:", categoriesData);
        setProductCategories([]);
        setTotal(0);
        setTotalPage(0);
      }
    } catch (err) {
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
      setModified((prev) => !prev); // Trigger refetch
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
      setModified((prev) => !prev); // Trigger refetch
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
      setModified((prev) => !prev); // Trigger refetch
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
