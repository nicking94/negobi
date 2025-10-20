import { useState, useEffect } from "react";
import {
  operationTypeService,
  OperationType,
  CreateOperationTypeData,
  UpdateOperationTypeData,
  GetOperationTypesParams,
  OperationModule,
  TransactionDirection,
} from "../../services/operationTypes/operationTypes.service";

// Definir el tipo para los filtros del hook
export interface UseOperationTypesFilters {
  type_name?: string;
  description?: string;
  applies_to_module?: string;
  transaction_direction?: string;
  is_active?: boolean;
  search?: string;
}

export const useOperationTypes = (filters: UseOperationTypesFilters = {}) => {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los tipos de operación con filtros
  const loadOperationTypes = async (
    customFilters?: Partial<UseOperationTypesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetOperationTypesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const operationTypesData = await operationTypeService.getOperationTypes(
        combinedFilters
      );

      if (Array.isArray(operationTypesData)) {
        setOperationTypes(operationTypesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", operationTypesData);
        setOperationTypes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de operación"
      );
      setOperationTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear tipo de operación
  const createOperationType = async (
    operationTypeData: CreateOperationTypeData
  ): Promise<OperationType | null> => {
    try {
      setLoading(true);
      setError(null);
      const newOperationType = await operationTypeService.createOperationType(
        operationTypeData
      );
      setOperationTypes((prev) => [...prev, newOperationType]);
      return newOperationType;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear tipo de operación"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tipo de operación
  const updateOperationType = async (
    id: string,
    updates: UpdateOperationTypeData
  ): Promise<OperationType | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOperationType =
        await operationTypeService.updateOperationType(id, updates);
      setOperationTypes((prev) =>
        prev.map((operationType) =>
          operationType.id.toString() === id
            ? updatedOperationType
            : operationType
        )
      );
      return updatedOperationType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar tipo de operación"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tipo de operación
  const deleteOperationType = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await operationTypeService.deleteOperationType(id);
      setOperationTypes((prev) =>
        prev.filter((operationType) => operationType.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar tipo de operación"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener tipo de operación por ID
  const getOperationTypeById = async (
    id: string
  ): Promise<OperationType | null> => {
    try {
      setLoading(true);
      setError(null);
      const operationType = await operationTypeService.getOperationTypeById(id);
      return operationType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener tipo de operación"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Activar/desactivar tipo de operación
  const toggleOperationTypeStatus = async (
    id: string,
    isActive: boolean
  ): Promise<OperationType | null> => {
    try {
      return await updateOperationType(id, { is_active: isActive });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del tipo de operación"
      );
      return null;
    }
  };

  // Verificar si existe un nombre de tipo
  const checkTypeNameExists = async (typeName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await operationTypeService.checkTypeNameExists(typeName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al verificar nombre de tipo"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos de operación al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadOperationTypes();
  }, [
    filters.type_name,
    filters.description,
    filters.applies_to_module,
    filters.transaction_direction,
    filters.is_active,
    filters.search,
  ]);

  return {
    operationTypes,
    loading,
    error,
    createOperationType,
    updateOperationType,
    deleteOperationType,
    getOperationTypeById,
    toggleOperationTypeStatus,
    checkTypeNameExists,
    refetch: loadOperationTypes,
  };
};

// Hook especializado para tipos de operación activos
export const useActiveOperationTypes = () => {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveOperationTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeTypes = await operationTypeService.getActiveOperationTypes();
      setOperationTypes(activeTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de operación activos"
      );
      setOperationTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveOperationTypes();
  }, []);

  return {
    operationTypes,
    loading,
    error,
    refetch: loadActiveOperationTypes,
  };
};

// Hook especializado para tipos de operación por módulo
export const useOperationTypesByModule = (module?: OperationModule) => {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperationTypesByModule = async (targetModule?: OperationModule) => {
    const targetModuleToUse = targetModule || module;
    if (!targetModuleToUse) {
      setError("Módulo es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const types = await operationTypeService.getOperationTypesByModule(
        targetModuleToUse
      );
      setOperationTypes(types);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de operación por módulo"
      );
      setOperationTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (module) {
      loadOperationTypesByModule();
    }
  }, [module]);

  return {
    operationTypes,
    loading,
    error,
    refetch: loadOperationTypesByModule,
  };
};

// Hook especializado para tipos de operación por dirección
export const useOperationTypesByDirection = (
  direction?: TransactionDirection
) => {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperationTypesByDirection = async (
    targetDirection?: TransactionDirection
  ) => {
    const targetDirectionToUse = targetDirection || direction;
    if (!targetDirectionToUse) {
      setError("Dirección de transacción es requerida");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const types = await operationTypeService.getOperationTypesByDirection(
        targetDirectionToUse
      );
      setOperationTypes(types);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de operación por dirección"
      );
      setOperationTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (direction) {
      loadOperationTypesByDirection();
    }
  }, [direction]);

  return {
    operationTypes,
    loading,
    error,
    refetch: loadOperationTypesByDirection,
  };
};

// Hook para select/dropdown de tipos de operación
export const useOperationTypesForSelect = () => {
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
        await operationTypeService.getOperationTypesForSelect();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de tipos de operación"
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

// Hook para tipos de operación agrupados por módulo
export const useOperationTypesGroupedByModule = () => {
  const [groupedOperationTypes, setGroupedOperationTypes] = useState<
    Record<string, OperationType[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupedOperationTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const grouped =
        await operationTypeService.getOperationTypesGroupedByModule();
      setGroupedOperationTypes(grouped);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar tipos de operación agrupados"
      );
      setGroupedOperationTypes({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupedOperationTypes();
  }, []);

  return {
    groupedOperationTypes,
    loading,
    error,
    refetch: loadGroupedOperationTypes,
  };
};

// Hook para búsqueda de tipos de operación
export const useOperationTypeSearch = () => {
  const [searchResults, setSearchResults] = useState<OperationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOperationTypes = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await operationTypeService.searchOperationTypesByName(
        searchTerm
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar tipos de operación"
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
    searchOperationTypes,
    clearSearch,
  };
};
