import { useState, useEffect } from "react";
import {
  businessTypeService,
  BusinessType,
  CreateBusinessTypeData,
  UpdateBusinessTypeData,
  GetBusinessTypesParams,
  CommonBusinessType,
  COMMON_BUSINESS_TYPES,
} from "../../services/businessTypes/businessTypes.service";

// Definir el tipo para los filtros del hook
export interface UseBusinessTypesFilters {
  name?: string;
  search?: string;
}

export const useBusinessTypes = (filters: UseBusinessTypesFilters = {}) => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los tipos de negocio con filtros
  const loadBusinessTypes = async (
    customFilters?: Partial<UseBusinessTypesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetBusinessTypesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const businessTypesData = await businessTypeService.getBusinessTypes(
        combinedFilters
      );

      if (Array.isArray(businessTypesData)) {
        setBusinessTypes(businessTypesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", businessTypesData);
        setBusinessTypes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar tipos de negocio"
      );
      setBusinessTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear tipo de negocio
  const createBusinessType = async (
    businessTypeData: CreateBusinessTypeData
  ): Promise<BusinessType | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos
      const validation =
        businessTypeService.validateBusinessTypeData(businessTypeData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      // Verificar si ya existe un tipo de negocio con el mismo nombre
      const exists = await businessTypeService.checkBusinessTypeNameExists(
        businessTypeData.name
      );
      if (exists) {
        setError("Ya existe un tipo de negocio con este nombre");
        return null;
      }

      const newBusinessType = await businessTypeService.createBusinessType(
        businessTypeData
      );
      setBusinessTypes((prev) => [...prev, newBusinessType]);
      return newBusinessType;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear tipo de negocio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tipo de negocio
  const updateBusinessType = async (
    id: string,
    updates: UpdateBusinessTypeData
  ): Promise<BusinessType | null> => {
    try {
      setLoading(true);
      setError(null);

      // Si se actualiza el nombre, verificar que no exista
      if (updates.name) {
        const existingBusinessTypes =
          await businessTypeService.getBusinessTypes({ itemsPerPage: 10 });
        const nameExists = existingBusinessTypes.some(
          (businessType) =>
            businessType.name === updates.name &&
            businessType.id.toString() !== id
        );
        if (nameExists) {
          setError("Ya existe un tipo de negocio con este nombre");
          return null;
        }
      }

      const updatedBusinessType = await businessTypeService.updateBusinessType(
        id,
        updates
      );
      setBusinessTypes((prev) =>
        prev.map((businessType) =>
          businessType.id.toString() === id ? updatedBusinessType : businessType
        )
      );
      return updatedBusinessType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar tipo de negocio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tipo de negocio
  const deleteBusinessType = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await businessTypeService.deleteBusinessType(id);
      setBusinessTypes((prev) =>
        prev.filter((businessType) => businessType.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar tipo de negocio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener tipo de negocio por ID
  const getBusinessTypeById = async (
    id: string
  ): Promise<BusinessType | null> => {
    try {
      setLoading(true);
      setError(null);
      const businessType = await businessTypeService.getBusinessTypeById(id);
      return businessType;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener tipo de negocio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si existe un nombre de tipo de negocio
  const checkBusinessTypeNameExists = async (
    name: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await businessTypeService.checkBusinessTypeNameExists(name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar nombre de tipo de negocio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar datos del tipo de negocio
  const validateBusinessTypeData = (
    businessTypeData: CreateBusinessTypeData
  ): { isValid: boolean; errors: string[] } => {
    return businessTypeService.validateBusinessTypeData(businessTypeData);
  };

  // Buscar tipos de negocio similares
  const findSimilarBusinessTypes = async (
    name: string,
    threshold: number = 0.7
  ): Promise<BusinessType[]> => {
    try {
      setLoading(true);
      setError(null);
      return await businessTypeService.findSimilarBusinessTypes(
        name,
        threshold
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar tipos de negocio similares"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear tipos de negocio comunes predefinidos
  const createCommonBusinessTypes = async (): Promise<BusinessType[]> => {
    try {
      setLoading(true);
      setError(null);
      const createdTypes =
        await businessTypeService.createCommonBusinessTypes();
      // Recargar la lista después de crear los tipos comunes
      await loadBusinessTypes();
      return createdTypes;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear tipos de negocio comunes"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear múltiples tipos de negocio
  const createMultipleBusinessTypes = async (
    businessTypesData: CreateBusinessTypeData[]
  ): Promise<BusinessType[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todos los tipos primero
      for (const businessTypeData of businessTypesData) {
        const validation =
          businessTypeService.validateBusinessTypeData(businessTypeData);
        if (!validation.isValid) {
          setError(
            `Error en tipo de negocio ${
              businessTypeData.name
            }: ${validation.errors.join(", ")}`
          );
          return null;
        }
      }

      const createdBusinessTypes =
        await businessTypeService.createMultipleBusinessTypes(
          businessTypesData
        );
      setBusinessTypes((prev) => [...prev, ...createdBusinessTypes]);
      return createdBusinessTypes;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples tipos de negocio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos de negocio al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadBusinessTypes();
  }, [filters.name, filters.search]);

  return {
    businessTypes,
    loading,
    error,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    getBusinessTypeById,
    checkBusinessTypeNameExists,
    validateBusinessTypeData,
    findSimilarBusinessTypes,
    createCommonBusinessTypes,
    createMultipleBusinessTypes,
    refetch: loadBusinessTypes,
  };
};

// Hook especializado para tipos de negocio por nombre
export const useBusinessTypesByName = (name?: string) => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessTypesByName = async (businessTypeName?: string) => {
    const targetName = businessTypeName || name;
    if (!targetName) {
      setError("Nombre es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const typesByName = await businessTypeService.getBusinessTypesByName(
        targetName
      );
      setBusinessTypes(typesByName);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de negocio por nombre"
      );
      setBusinessTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) {
      loadBusinessTypesByName();
    }
  }, [name]);

  return {
    businessTypes,
    loading,
    error,
    refetch: loadBusinessTypesByName,
  };
};

// Hook para select/dropdown de tipos de negocio
export const useBusinessTypesForSelect = () => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions =
        await businessTypeService.getBusinessTypesForSelect();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de tipos de negocio"
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

// Hook para select/dropdown de tipos de negocio con descripción
export const useBusinessTypesForSelectWithDescription = () => {
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
        await businessTypeService.getBusinessTypesForSelectWithDescription();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de tipos de negocio con descripción"
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

// Hook para búsqueda de tipos de negocio
export const useBusinessTypeSearch = () => {
  const [searchResults, setSearchResults] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBusinessTypes = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await businessTypeService.searchBusinessTypes(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar tipos de negocio"
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
    searchBusinessTypes,
    clearSearch,
  };
};

// Hook para estadísticas de tipos de negocio
export const useBusinessTypesStatistics = () => {
  const [statistics, setStatistics] = useState<{
    total: number;
    average_name_length: number;
    average_description_length: number;
  }>({
    total: 0,
    average_name_length: 0,
    average_description_length: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await businessTypeService.getBusinessTypesStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de tipos de negocio"
      );
      setStatistics({
        total: 0,
        average_name_length: 0,
        average_description_length: 0,
      });
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

// Hook para tipos de negocio populares
export const usePopularBusinessTypes = (limit: number = 10) => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPopularBusinessTypes = async (newLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const popularTypes = await businessTypeService.getPopularBusinessTypes(
        newLimit || limit
      );
      setBusinessTypes(popularTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de negocio populares"
      );
      setBusinessTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopularBusinessTypes();
  }, [limit]);

  return {
    businessTypes,
    loading,
    error,
    refetch: loadPopularBusinessTypes,
  };
};

// Hook para tipos de negocio agrupados por categoría
export const useBusinessTypesGroupedByCategory = () => {
  const [groupedBusinessTypes, setGroupedBusinessTypes] = useState<
    Record<string, BusinessType[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupedBusinessTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const grouped =
        await businessTypeService.getBusinessTypesGroupedByCategory();
      setGroupedBusinessTypes(grouped);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de negocio agrupados"
      );
      setGroupedBusinessTypes({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupedBusinessTypes();
  }, []);

  return {
    groupedBusinessTypes,
    loading,
    error,
    refetch: loadGroupedBusinessTypes,
  };
};

// Hook para gestión de tipos de negocio comunes
export const useCommonBusinessTypes = () => {
  const { businessTypes, loading, error, refetch, createCommonBusinessTypes } =
    useBusinessTypes();

  // Verificar si los tipos comunes ya existen
  const commonTypesExist = Object.values(COMMON_BUSINESS_TYPES).every(
    (commonType) => businessTypes.some((type) => type.name === commonType)
  );

  // Obtener tipos comunes que faltan
  const missingCommonTypes = Object.values(COMMON_BUSINESS_TYPES).filter(
    (commonType) => !businessTypes.some((type) => type.name === commonType)
  );

  return {
    businessTypes,
    loading,
    error,
    commonTypesExist,
    missingCommonTypes,
    createCommonBusinessTypes,
    refetch,
  };
};
