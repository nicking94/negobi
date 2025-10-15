import { useState, useEffect } from "react";
import {
  brandService,
  Brand,
  CreateBrandData,
  UpdateBrandData,
  GetBrandsParams,
} from "../../services/brands/brands.service";

// Definir el tipo para los filtros del hook
export interface UseBrandsFilters {
  brand_name?: string;
  description?: string;
  is_active?: boolean;
  search?: string;
}

export const useBrands = (filters: UseBrandsFilters = {}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = async (customFilters?: Partial<UseBrandsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetBrandsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100, // Aumentar items para mejor búsqueda
      };

      console.log("🔵 Enviando parámetros para marcas:", combinedFilters);

      const brandsData = await brandService.getBrands(combinedFilters);
      console.log("🟢 Datos de marcas recibidos:", brandsData);

      if (Array.isArray(brandsData)) {
        setBrands(brandsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", brandsData);
        setBrands([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar marcas");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear marca
  const createBrand = async (
    brandData: CreateBrandData
  ): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos
      const nameValidation = brandService.validateBrandName(
        brandData.brand_name
      );
      if (!nameValidation.isValid) {
        setError(nameValidation.errors.join(", "));
        return null;
      }

      const descriptionValidation = brandService.validateBrandDescription(
        brandData.description
      );
      if (!descriptionValidation.isValid) {
        setError(descriptionValidation.errors.join(", "));
        return null;
      }

      // Verificar si ya existe una marca con el mismo nombre
      const exists = await brandService.checkBrandNameExists(
        brandData.brand_name
      );
      if (exists) {
        setError("Ya existe una marca con este nombre");
        return null;
      }

      const newBrand = await brandService.createBrand(brandData);
      setBrands((prev) => [...prev, newBrand]);
      return newBrand;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear marca");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar marca
  const updateBrand = async (
    id: string,
    updates: UpdateBrandData
  ): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos si se están actualizando
      if (updates.brand_name) {
        const nameValidation = brandService.validateBrandName(
          updates.brand_name
        );
        if (!nameValidation.isValid) {
          setError(nameValidation.errors.join(", "));
          return null;
        }
      }

      if (updates.description) {
        const descriptionValidation = brandService.validateBrandDescription(
          updates.description
        );
        if (!descriptionValidation.isValid) {
          setError(descriptionValidation.errors.join(", "));
          return null;
        }
      }

      const updatedBrand = await brandService.updateBrand(id, updates);
      setBrands((prev) =>
        prev.map((brand) => (brand.id.toString() === id ? updatedBrand : brand))
      );
      return updatedBrand;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar marca"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar marca
  const deleteBrand = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await brandService.deleteBrand(id);
      setBrands((prev) => prev.filter((brand) => brand.id.toString() !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar marca");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener marca por ID
  const getBrandById = async (id: string): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);
      const brand = await brandService.getBrandById(id);
      return brand;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener marca");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Activar/desactivar marca
  const toggleBrandStatus = async (
    id: string,
    isActive: boolean
  ): Promise<Brand | null> => {
    try {
      return await updateBrand(id, { is_active: isActive });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado de la marca"
      );
      return null;
    }
  };

  // Activar marca
  const activateBrand = async (id: string): Promise<Brand | null> => {
    return await toggleBrandStatus(id, true);
  };

  // Desactivar marca
  const deactivateBrand = async (id: string): Promise<Brand | null> => {
    return await toggleBrandStatus(id, false);
  };

  // Verificar si existe un nombre de marca
  const checkBrandNameExists = async (brandName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await brandService.checkBrandNameExists(brandName);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar nombre de marca"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar nombre de marca
  const validateBrandName = (
    brandName: string
  ): { isValid: boolean; errors: string[] } => {
    return brandService.validateBrandName(brandName);
  };

  // Validar descripción de marca
  const validateBrandDescription = (
    description: string
  ): { isValid: boolean; errors: string[] } => {
    return brandService.validateBrandDescription(description);
  };

  // Crear múltiples marcas
  const createMultipleBrands = async (
    brandsData: CreateBrandData[]
  ): Promise<Brand[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todas las marcas primero
      for (const brandData of brandsData) {
        const nameValidation = brandService.validateBrandName(
          brandData.brand_name
        );
        if (!nameValidation.isValid) {
          setError(
            `Error en ${brandData.brand_name}: ${nameValidation.errors.join(
              ", "
            )}`
          );
          return null;
        }

        const descriptionValidation = brandService.validateBrandDescription(
          brandData.description
        );
        if (!descriptionValidation.isValid) {
          setError(
            `Error en ${
              brandData.brand_name
            }: ${descriptionValidation.errors.join(", ")}`
          );
          return null;
        }
      }

      const createdBrands = await brandService.createMultipleBrands(brandsData);
      setBrands((prev) => [...prev, ...createdBrands]);
      return createdBrands;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear múltiples marcas"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar marcas al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadBrands();
  }, [
    filters.brand_name,
    filters.description,
    filters.is_active,
    filters.search,
  ]);

  return {
    brands,
    loading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    toggleBrandStatus,
    activateBrand,
    deactivateBrand,
    checkBrandNameExists,
    validateBrandName,
    validateBrandDescription,
    createMultipleBrands,
    refetch: loadBrands,
  };
};

// Hook especializado para marcas activas
export const useActiveBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeBrands = await brandService.getActiveBrands();
      setBrands(activeBrands);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar marcas activas"
      );
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: loadActiveBrands,
  };
};

// Hook especializado para marcas inactivas
export const useInactiveBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInactiveBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const inactiveBrands = await brandService.getInactiveBrands();
      setBrands(inactiveBrands);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar marcas inactivas"
      );
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInactiveBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: loadInactiveBrands,
  };
};

// Hook para select/dropdown de marcas
export const useBrandsForSelect = () => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions = await brandService.getBrandsForSelect();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de marcas"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: loadOptions,
  };
};

// Hook para select/dropdown de marcas con descripción
export const useBrandsForSelectWithDescription = () => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string; description: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions =
        await brandService.getBrandsForSelectWithDescription();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de marcas con descripción"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: loadOptions,
  };
};

// Hook para búsqueda de marcas
export const useBrandSearch = () => {
  const [searchResults, setSearchResults] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBrands = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await brandService.searchBrandsByName(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar marcas");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchBrandsByDescription = async (description: string) => {
    if (!description.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await brandService.searchBrandsByDescription(description);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar marcas por descripción"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    searchBrands,
    searchBrandsByDescription,
    clearSearch,
  };
};

// Hook para estadísticas de marcas
export const useBrandsStatistics = () => {
  const [statistics, setStatistics] = useState<{
    total: number;
    active: number;
    inactive: number;
  }>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await brandService.getBrandsStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de marcas"
      );
      setStatistics({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: loadStatistics,
  };
};

// Hook para marcas populares
export const usePopularBrands = (limit: number = 10) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPopularBrands = async (newLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const popularBrands = await brandService.getPopularBrands(
        newLimit || limit
      );
      setBrands(popularBrands);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar marcas populares"
      );
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopularBrands();
  }, [limit]);

  return {
    brands,
    loading,
    error,
    refetch: loadPopularBrands,
  };
};

// Hook para gestión de estado de marcas
export const useBrandStatusManagement = () => {
  const { brands, loading, error, refetch, activateBrand, deactivateBrand } =
    useBrands();

  // Activar múltiples marcas
  const activateMultipleBrands = async (
    brandIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        brandIds.map((id) => activateBrand(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error activating multiple brands:", err);
      return false;
    }
  };

  // Desactivar múltiples marcas
  const deactivateMultipleBrands = async (
    brandIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        brandIds.map((id) => deactivateBrand(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error deactivating multiple brands:", err);
      return false;
    }
  };

  // Toggle múltiples marcas
  const toggleMultipleBrandsStatus = async (
    brandIds: string[],
    isActive: boolean
  ): Promise<boolean> => {
    if (isActive) {
      return await activateMultipleBrands(brandIds);
    } else {
      return await deactivateMultipleBrands(brandIds);
    }
  };

  return {
    brands,
    loading,
    error,
    activateBrand,
    deactivateBrand,
    activateMultipleBrands,
    deactivateMultipleBrands,
    toggleMultipleBrandsStatus,
    refetch,
  };
};
