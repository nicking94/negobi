import { useState, useEffect } from "react";
import {
  brandService,
  Brand,
  CreateBrandData,
  UpdateBrandData,
  GetBrandsParams,
} from "../../services/brands/brands.service";

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

      const combinedFilters: GetBrandsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
      };

      const brandsData = await brandService.getBrands(combinedFilters);

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

  const createBrand = async (
    brandData: CreateBrandData
  ): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);

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

  const updateBrand = async (
    id: string,
    updates: UpdateBrandData
  ): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);

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

  const activateBrand = async (id: string): Promise<Brand | null> => {
    return await toggleBrandStatus(id, true);
  };

  const deactivateBrand = async (id: string): Promise<Brand | null> => {
    return await toggleBrandStatus(id, false);
  };

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

  const validateBrandName = (
    brandName: string
  ): { isValid: boolean; errors: string[] } => {
    return brandService.validateBrandName(brandName);
  };

  const validateBrandDescription = (
    description: string
  ): { isValid: boolean; errors: string[] } => {
    return brandService.validateBrandDescription(description);
  };

  const createMultipleBrands = async (
    brandsData: CreateBrandData[]
  ): Promise<Brand[] | null> => {
    try {
      setLoading(true);
      setError(null);

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

export const useBrandStatusManagement = () => {
  const { brands, loading, error, refetch, activateBrand, deactivateBrand } =
    useBrands();

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
