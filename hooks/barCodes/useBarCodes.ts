import { useState, useEffect } from "react";
import {
  barCodeService,
  BarCode,
  CreateBarCodeData,
  UpdateBarCodeData,
  GetBarCodesParams,
  BarCodeType,
} from "../../services/barCodes/barCodes.service";

// Definir el tipo para los filtros del hook
export interface UseBarCodesFilters {
  companyId: string; // Requerido
  productId?: string;
  search?: string;
}

export const useBarCodes = (filters: UseBarCodesFilters) => {
  const [barCodes, setBarCodes] = useState<BarCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los códigos de barras con filtros
  const loadBarCodes = async (customFilters?: Partial<UseBarCodesFilters>) => {
    try {
      setLoading(true);
      setError(null);

      if (!filters.companyId && !customFilters?.companyId) {
        setError("companyId es requerido");
        return;
      }

      // Combinar filtros
      const combinedFilters: GetBarCodesParams = {
        ...filters,
        ...customFilters,
        companyId: customFilters?.companyId || filters.companyId,
        page: 1,
        itemsPerPage: 10,
      };

      const barCodesData = await barCodeService.getBarCodes(combinedFilters);

      if (Array.isArray(barCodesData)) {
        setBarCodes(barCodesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", barCodesData);
        setBarCodes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar códigos de barras"
      );
      setBarCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear código de barras
  const createBarCode = async (
    barCodeData: CreateBarCodeData
  ): Promise<BarCode | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar formato del código de barras
      const validation = barCodeService.validateBarCodeFormat(barCodeData.code);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      // Verificar si ya existe el código de barras
      const exists = await barCodeService.checkBarCodeExists(
        filters.companyId,
        barCodeData.code
      );
      if (exists) {
        setError("Ya existe un código de barras con este código");
        return null;
      }

      const newBarCode = await barCodeService.createBarCode(barCodeData);
      setBarCodes((prev) => [...prev, newBarCode]);
      return newBarCode;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear código de barras"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar código de barras
  const updateBarCode = async (
    id: string,
    updates: UpdateBarCodeData
  ): Promise<BarCode | null> => {
    try {
      setLoading(true);
      setError(null);

      // Si se actualiza el código, validar formato
      if (updates.code) {
        const validation = barCodeService.validateBarCodeFormat(updates.code);
        if (!validation.isValid) {
          setError(validation.errors.join(", "));
          return null;
        }

        // Verificar si ya existe otro código con el mismo valor
        const existingBarCode = await barCodeService.getBarCodeByCode(
          filters.companyId,
          updates.code
        );
        if (existingBarCode && existingBarCode.id.toString() !== id) {
          setError("Ya existe otro código de barras con este código");
          return null;
        }
      }

      const updatedBarCode = await barCodeService.updateBarCode(id, updates);
      setBarCodes((prev) =>
        prev.map((barCode) =>
          barCode.id.toString() === id ? updatedBarCode : barCode
        )
      );
      return updatedBarCode;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar código de barras"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar código de barras
  const deleteBarCode = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await barCodeService.deleteBarCode(id);
      setBarCodes((prev) =>
        prev.filter((barCode) => barCode.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar código de barras"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener código de barras por ID
  const getBarCodeById = async (id: string): Promise<BarCode | null> => {
    try {
      setLoading(true);
      setError(null);
      const barCode = await barCodeService.getBarCodeById(id);
      return barCode;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener código de barras"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener código de barras por código exacto
  const getBarCodeByCode = async (code: string): Promise<BarCode | null> => {
    try {
      setLoading(true);
      setError(null);
      return await barCodeService.getBarCodeByCode(filters.companyId, code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar código de barras"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si existe un código de barras
  const checkBarCodeExists = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await barCodeService.checkBarCodeExists(filters.companyId, code);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar código de barras"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Asignar código de barras a producto
  const assignBarCodeToProduct = async (
    barCodeId: string,
    productId: number
  ): Promise<BarCode | null> => {
    try {
      return await updateBarCode(barCodeId, { product_id: productId });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al asignar código de barras al producto"
      );
      return null;
    }
  };

  // Desasignar código de barras de producto
  const unassignBarCodeFromProduct = async (
    barCodeId: string
  ): Promise<BarCode | null> => {
    try {
      return await updateBarCode(barCodeId, { product_id: undefined });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al desasignar código de barras del producto"
      );
      return null;
    }
  };

  // Validar formato de código de barras
  const validateBarCodeFormat = (
    code: string
  ): { isValid: boolean; type?: BarCodeType; errors: string[] } => {
    return barCodeService.validateBarCodeFormat(code);
  };

  // Formatear código de barras para visualización
  const formatBarCode = (code: string, type?: BarCodeType): string => {
    return barCodeService.formatBarCode(code, type);
  };

  // Generar dígito de control EAN-13
  const generateEAN13CheckDigit = (code: string): string => {
    try {
      return barCodeService.generateEAN13CheckDigit(code);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar dígito de control"
      );
      return "";
    }
  };

  // Crear múltiples códigos de barras
  const createMultipleBarCodes = async (
    barCodesData: CreateBarCodeData[]
  ): Promise<BarCode[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todos los códigos primero
      for (const barCodeData of barCodesData) {
        const validation = barCodeService.validateBarCodeFormat(
          barCodeData.code
        );
        if (!validation.isValid) {
          setError(
            `Error en código ${barCodeData.code}: ${validation.errors.join(
              ", "
            )}`
          );
          return null;
        }
      }

      const createdBarCodes = await barCodeService.createMultipleBarCodes(
        filters.companyId,
        barCodesData
      );
      setBarCodes((prev) => [...prev, ...createdBarCodes]);
      return createdBarCodes;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples códigos de barras"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generar códigos de barras secuenciales
  const generateSequentialBarCodes = (
    startCode: string,
    count: number,
    productId?: number
  ): CreateBarCodeData[] => {
    return barCodeService.generateSequentialBarCodes(
      startCode,
      count,
      productId
    );
  };

  // Cargar códigos de barras al montar el hook o cuando cambien los filtros
  useEffect(() => {
    if (filters.companyId) {
      loadBarCodes();
    }
  }, [filters.companyId, filters.productId, filters.search]);

  return {
    barCodes,
    loading,
    error,
    createBarCode,
    updateBarCode,
    deleteBarCode,
    getBarCodeById,
    getBarCodeByCode,
    checkBarCodeExists,
    assignBarCodeToProduct,
    unassignBarCodeFromProduct,
    validateBarCodeFormat,
    formatBarCode,
    generateEAN13CheckDigit,
    createMultipleBarCodes,
    generateSequentialBarCodes,
    refetch: loadBarCodes,
  };
};

// Hook especializado para códigos de barras por compañía
export const useBarCodesByCompany = (companyId: string) => {
  const [barCodes, setBarCodes] = useState<BarCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBarCodesByCompany = async (id?: string) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyBarCodes = await barCodeService.getBarCodesByCompany(
        targetCompanyId
      );
      setBarCodes(companyBarCodes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar códigos de barras de la compañía"
      );
      setBarCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadBarCodesByCompany();
    }
  }, [companyId]);

  return {
    barCodes,
    loading,
    error,
    refetch: loadBarCodesByCompany,
  };
};

// Hook especializado para códigos de barras por producto
export const useBarCodesByProduct = (companyId: string, productId?: string) => {
  const [barCodes, setBarCodes] = useState<BarCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBarCodesByProduct = async (id?: string) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const productBarCodes = await barCodeService.getBarCodesByProduct(
        companyId,
        targetProductId
      );
      setBarCodes(productBarCodes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar códigos de barras del producto"
      );
      setBarCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && productId) {
      loadBarCodesByProduct();
    }
  }, [companyId, productId]);

  return {
    barCodes,
    loading,
    error,
    refetch: loadBarCodesByProduct,
  };
};

// Hook para búsqueda de códigos de barras
export const useBarCodeSearch = (companyId: string) => {
  const [searchResults, setSearchResults] = useState<BarCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBarCodes = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await barCodeService.searchBarCodes(
        companyId,
        searchTerm
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar códigos de barras"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchByExactCode = async (code: string) => {
    if (!code.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await barCodeService.getBarCodeByCode(companyId, code);
      setSearchResults(result ? [result] : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar código de barras exacto"
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
    searchBarCodes,
    searchByExactCode,
    clearSearch,
  };
};

// Hook para estadísticas de códigos de barras
export const useBarCodesStatistics = (companyId: string) => {
  const [statistics, setStatistics] = useState<{
    total: number;
    assigned: number;
    unassigned: number;
    by_type: Record<string, number>;
  }>({
    total: 0,
    assigned: 0,
    unassigned: 0,
    by_type: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async (id?: string) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await barCodeService.getBarCodesStatistics(targetCompanyId);
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de códigos de barras"
      );
      setStatistics({
        total: 0,
        assigned: 0,
        unassigned: 0,
        by_type: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadStatistics();
    }
  }, [companyId]);

  return {
    statistics,
    loading,
    error,
    refetch: loadStatistics,
  };
};

// Hook para gestión de asignación de códigos de barras
// Hook para gestión de asignación de códigos de barras
export const useBarCodeAssignment = (companyId: string) => {
  // Usar el hook principal que sí tiene las funciones de asignación
  const {
    barCodes,
    loading,
    error,
    refetch,
    assignBarCodeToProduct,
    unassignBarCodeFromProduct,
  } = useBarCodes({ companyId });

  // Asignar múltiples códigos de barras a un producto
  const assignMultipleBarCodesToProduct = async (
    barCodeIds: string[],
    productId: number
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        barCodeIds.map((id) => assignBarCodeToProduct(id, productId))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error assigning multiple bar codes:", err);
      return false;
    }
  };

  // Desasignar múltiples códigos de barras
  const unassignMultipleBarCodes = async (
    barCodeIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        barCodeIds.map((id) => unassignBarCodeFromProduct(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error unassigning multiple bar codes:", err);
      return false;
    }
  };

  // Obtener códigos de barras asignados a un producto
  const getAssignedBarCodes = (productId: number): BarCode[] => {
    return barCodes.filter((barCode) => barCode.product_id === productId);
  };

  // Obtener códigos de barras no asignados
  const getUnassignedBarCodes = (): BarCode[] => {
    return barCodes.filter((barCode) => !barCode.product_id);
  };

  return {
    barCodes,
    loading,
    error,
    assignBarCodeToProduct,
    unassignBarCodeFromProduct,
    assignMultipleBarCodesToProduct,
    unassignMultipleBarCodes,
    getAssignedBarCodes,
    getUnassignedBarCodes,
    refetch,
  };
};

// Hook para validación y formateo de códigos de barras
export const useBarCodeValidation = () => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    type?: BarCodeType;
    errors: string[];
    formattedCode?: string;
  }>({
    isValid: false,
    errors: [],
  });

  const validateAndFormat = (code: string) => {
    const validation = barCodeService.validateBarCodeFormat(code);
    const formattedCode = validation.isValid
      ? barCodeService.formatBarCode(code, validation.type)
      : undefined;

    setValidationResult({
      ...validation,
      formattedCode,
    });

    return validation;
  };

  const clearValidation = () => {
    setValidationResult({
      isValid: false,
      errors: [],
    });
  };

  return {
    validationResult,
    validateAndFormat,
    clearValidation,
  };
};
