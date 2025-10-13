import { useState, useEffect } from "react";
import {
  productCategoryService,
  ProductCategory,
  CreateProductCategoryData,
  UpdateProductCategoryData,
  GetProductCategoriesParams,
  SyncProductCategoriesPayload,
  SyncResponse,
} from "../../services/productCategories/productCategories.service";

// Definir el tipo para los filtros del hook
export interface UseProductCategoriesFilters {
  companyId?: number;
  parentCategoryId?: number;
  search?: string;
  category_name?: string;
  category_code?: string;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
}

export const useProductCategories = (
  filters: UseProductCategoriesFilters = {}
) => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las categorías con filtros
  const loadProductCategories = async (
    customFilters?: Partial<UseProductCategoriesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetProductCategoriesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10, // Más grande para categorías
      };

      console.log("🔵 Enviando parámetros para categorías:", combinedFilters);

      const categoriesData = await productCategoryService.getProductCategories(
        combinedFilters
      );
      console.log("🟢 Datos de categorías recibidos:", categoriesData);

      if (Array.isArray(categoriesData)) {
        setProductCategories(categoriesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", categoriesData);
        setProductCategories([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías"
      );
      setProductCategories([]);
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
      setProductCategories((prev) => [...prev, newCategory]);
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
      setProductCategories((prev) =>
        prev.map((category) =>
          category.id.toString() === id ? updatedCategory : category
        )
      );
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
      setProductCategories((prev) =>
        prev.filter((category) => category.id.toString() !== id)
      );
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

  // Obtener categoría por ID
  const getProductCategoryById = async (
    id: string
  ): Promise<ProductCategory | null> => {
    try {
      setLoading(true);
      setError(null);
      const category = await productCategoryService.getProductCategoryById(id);
      return category;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener categoría"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar categorías desde ERP
  const syncProductCategories = async (
    syncData: SyncProductCategoriesPayload
  ): Promise<SyncResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await productCategoryService.syncProductCategories(
        syncData
      );
      // Recargar categorías después de sincronizar
      await loadProductCategories();
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al sincronizar categorías"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadProductCategories();
  }, [
    filters.companyId,
    filters.parentCategoryId,
    filters.search,
    filters.category_name,
    filters.category_code,
    filters.is_active,
    filters.show_in_ecommerce,
    filters.show_in_sales_app,
  ]);

  return {
    productCategories,
    loading,
    error,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategoryById,
    syncProductCategories,
    refetch: loadProductCategories,
  };
};

// Hook especializado para categorías por empresa
export const useProductCategoriesByCompany = (companyId?: number) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async (id?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyCategories =
        await productCategoryService.getCategoriesByCompany(targetCompanyId);
      setCategories(companyCategories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías"
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener árbol de categorías
  const getCategoriesTree = (): ProductCategory[] => {
    const buildTree = (parentId?: number): ProductCategory[] => {
      return categories
        .filter((category) => category.parentCategoryId === parentId)
        .map((category) => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  };

  useEffect(() => {
    if (companyId) {
      loadCategories();
    }
  }, [companyId]);

  return {
    categories,
    categoriesTree: getCategoriesTree(),
    loading,
    error,
    refetch: loadCategories,
  };
};

// Hook para categorías activas
export const useActiveProductCategories = (companyId?: number) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveCategories = async (id?: number) => {
    const targetCompanyId = id || companyId;

    try {
      setLoading(true);
      setError(null);
      const activeCategories = await productCategoryService.getActiveCategories(
        targetCompanyId
      );
      setCategories(activeCategories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar categorías activas"
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveCategories();
  }, [companyId]);

  return {
    activeCategories: categories,
    loading,
    error,
    refetch: loadActiveCategories,
  };
};
