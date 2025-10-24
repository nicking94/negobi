import { useState, useEffect } from "react";
import {
  warehouseService,
  Warehouse,
  CreateWarehouseData,
  UpdateWarehouseData,
  GetWarehousesParams,
} from "../../services/warehouse/warehouse.service";

// Definir el tipo para los filtros del hook
export interface UseWarehousesFilters {
  search?: string;
  companyId?: number;
  branchId?: number;
}

export const useWarehouses = (filters: UseWarehousesFilters = {}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // En hooks/warehouse/useWarehouses.ts
  const loadWarehouses = async (
    customFilters?: Partial<UseWarehousesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const companyId = filters.companyId || customFilters?.companyId;

      if (!companyId) {
        setWarehouses([]);
        return;
      }

      const combinedFilters: GetWarehousesParams = {
        ...filters,
        ...customFilters,
        companyId,
        page: 1,
        itemsPerPage: 10,
      };

      const warehousesData = await warehouseService.getWarehouses(
        combinedFilters
      );

      const safeWarehousesData = Array.isArray(warehousesData)
        ? warehousesData
        : [];

      setWarehouses(safeWarehousesData);
    } catch (err) {
      console.error("❌ Error cargando almacenes:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar almacenes"
      );
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear almacén
  const createWarehouse = async (
    warehouseData: CreateWarehouseData
  ): Promise<Warehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const newWarehouse = await warehouseService.createWarehouse(
        warehouseData
      );
      setWarehouses((prev) => [...prev, newWarehouse]);
      return newWarehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear almacén");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar almacén
  const updateWarehouse = async (
    id: string,
    updates: UpdateWarehouseData
  ): Promise<Warehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedWarehouse = await warehouseService.updateWarehouse(
        id,
        updates
      );
      setWarehouses((prev) =>
        prev.map((warehouse) =>
          warehouse.id.toString() === id ? updatedWarehouse : warehouse
        )
      );
      return updatedWarehouse;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar almacén"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar almacén
  const deleteWarehouse = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await warehouseService.deleteWarehouse(id);
      setWarehouses((prev) =>
        prev.filter((warehouse) => warehouse.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar almacén"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener almacén por ID
  const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
    try {
      setLoading(true);
      setError(null);
      const warehouse = await warehouseService.getWarehouseById(id);
      return warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener almacén");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Activar/desactivar almacén
  const toggleWarehouseStatus = async (
    id: string,
    isActive: boolean
  ): Promise<Warehouse | null> => {
    try {
      return await updateWarehouse(id, { is_active: isActive });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del almacén"
      );
      return null;
    }
  };

  // Verificar si existe un código de almacén
  const checkWarehouseCodeExists = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await warehouseService.checkWarehouseCodeExists(
        code,
        filters.companyId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar código de almacén"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si existe un nombre de almacén
  const checkWarehouseNameExists = async (name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await warehouseService.checkWarehouseNameExists(
        name,
        filters.companyId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar nombre de almacén"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar teléfono
  const validatePhone = (phone: string): boolean => {
    return warehouseService.validatePhone(phone);
  };

  // Formatear teléfono
  const formatPhone = (phone: string): string => {
    return warehouseService.formatPhone(phone);
  };

  // Filtrar almacenes por sucursal
  const getWarehousesByBranch = (branchId: number): Warehouse[] => {
    return warehouses.filter(
      (warehouse) => warehouse.companyBranchId === branchId
    );
  };

  // Cargar almacenes al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadWarehouses();
  }, [filters.search, filters.companyId, filters.branchId]);

  return {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    toggleWarehouseStatus,
    checkWarehouseCodeExists,
    checkWarehouseNameExists,
    validatePhone,
    formatPhone,
    getWarehousesByBranch,
    refetch: loadWarehouses,
  };
};

// Hook especializado para almacenes activos
export const useActiveWarehouses = (companyId?: number) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeWarehouses = await warehouseService.getActiveWarehouses(
        companyId
      );
      setWarehouses(activeWarehouses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar almacenes activos"
      );
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveWarehouses();
  }, [companyId]);

  return {
    warehouses,
    loading,
    error,
    refetch: loadActiveWarehouses,
  };
};

// Hook para select/dropdown de almacenes
export const useWarehousesForSelect = (companyId?: number) => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string; code: string; branchId: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions = await warehouseService.getWarehousesForSelect(
        companyId
      );
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de almacenes"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [companyId]);

  return {
    options,
    loading,
    error,
    refetch: loadOptions,
  };
};

// Hook para búsqueda de almacenes
export const useWarehouseSearch = (companyId?: number) => {
  const [searchResults, setSearchResults] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWarehouses = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await warehouseService.searchWarehousesByName(
        searchTerm,
        companyId
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar almacenes"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchWarehousesByCode = async (code: string) => {
    if (!code.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await warehouseService.searchWarehousesByCode(
        code,
        companyId
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar almacenes por código"
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
    searchWarehouses,
    searchWarehousesByCode,
    clearSearch,
  };
};

// Hook para análisis de almacenes
export const useWarehousesAnalysis = (companyId?: number) => {
  const { warehouses, loading, error } = useActiveWarehouses(companyId);

  const analysis = {
    // Total de almacenes
    totalWarehouses: warehouses.length,

    // Almacenes por sucursal
    warehousesByBranch: warehouses.reduce((branches, warehouse) => {
      const branchId = warehouse.companyBranchId;
      branches[branchId] = (branches[branchId] || 0) + 1;
      return branches;
    }, {} as Record<number, number>),

    // Almacenes activos vs inactivos
    activeWarehouses: warehouses.filter((warehouse) => warehouse.is_active)
      .length,
    inactiveWarehouses: warehouses.filter((warehouse) => !warehouse.is_active)
      .length,

    // Almacenes con información de contacto completa
    warehousesWithCompleteContact: warehouses.filter(
      (warehouse) => warehouse.contact_person && warehouse.contact_phone
    ).length,

    // Almacenes con dirección
    warehousesWithAddress: warehouses.filter(
      (warehouse) =>
        warehouse.location_address && warehouse.location_address.trim() !== ""
    ).length,

    // Sucursales únicas
    uniqueBranches: [
      ...new Set(warehouses.map((warehouse) => warehouse.companyBranchId)),
    ],
  };

  return {
    analysis,
    warehouses,
    loading,
    error,
  };
};
