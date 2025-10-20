import { useState, useEffect } from "react";
import {
  serviceService,
  Service,
  CreateServiceData,
  UpdateServiceData,
  GetServicesParams,
  ServicePriceAnalysis,
} from "../../services/servicios/services.service";

// Definir el tipo para los filtros del hook
export interface UseServicesFilters {
  companyId: string; // Requerido
  categoryId?: string;
  search?: string;
}

export const useServices = (filters: UseServicesFilters) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los servicios con filtros
  const loadServices = async (customFilters?: Partial<UseServicesFilters>) => {
    try {
      setLoading(true);
      setError(null);

      if (!filters.companyId && !customFilters?.companyId) {
        setError("companyId es requerido");
        return;
      }

      const combinedFilters: GetServicesParams = {
        ...filters,
        ...customFilters,
        companyId: customFilters?.companyId || filters.companyId,
        page: 1,
        itemsPerPage: 10,
      };

      const servicesData = await serviceService.getServices(combinedFilters);

      if (Array.isArray(servicesData)) {
        setServices(servicesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", servicesData);
        setServices([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar servicios"
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear servicio
  const createService = async (
    serviceData: CreateServiceData
  ): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos
      const validation = serviceService.validateServiceData(serviceData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      // Verificar si ya existe un servicio con el mismo código
      const codeExists = await serviceService.checkServiceCodeExists(
        filters.companyId,
        serviceData.code
      );
      if (codeExists) {
        setError("Ya existe un servicio con este código");
        return null;
      }

      // Verificar si ya existe un servicio con el mismo nombre
      const nameExists = await serviceService.checkServiceNameExists(
        filters.companyId,
        serviceData.name
      );
      if (nameExists) {
        setError("Ya existe un servicio con este nombre");
        return null;
      }

      const newService = await serviceService.createService(serviceData);
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear servicio");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar servicio
  const updateService = async (
    id: string,
    updates: UpdateServiceData
  ): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

      // Si se actualiza el código, verificar que no exista
      if (updates.code) {
        const existingServices = await serviceService.getServicesByCompany(
          filters.companyId
        );
        const codeExists = existingServices.some(
          (service) =>
            service.code === updates.code && service.id.toString() !== id
        );
        if (codeExists) {
          setError("Ya existe un servicio con este código");
          return null;
        }
      }

      // Si se actualiza el nombre, verificar que no exista
      if (updates.name) {
        const existingServices = await serviceService.getServicesByCompany(
          filters.companyId
        );
        const nameExists = existingServices.some(
          (service) =>
            service.name === updates.name && service.id.toString() !== id
        );
        if (nameExists) {
          setError("Ya existe un servicio con este nombre");
          return null;
        }
      }

      const updatedService = await serviceService.updateService(id, updates);
      setServices((prev) =>
        prev.map((service) =>
          service.id.toString() === id ? updatedService : service
        )
      );
      return updatedService;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar servicio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar servicio
  const deleteService = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await serviceService.deleteService(id);
      setServices((prev) =>
        prev.filter((service) => service.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar servicio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener servicio por ID
  const getServiceById = async (id: string): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);
      const service = await serviceService.getServiceById(id);
      return service;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener servicio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar precios de servicio
  const updateServicePrices = async (
    id: string,
    prices: {
      price_level_1?: number;
      price_level_2?: number;
      price_level_3?: number;
    }
  ): Promise<Service | null> => {
    try {
      return await updateService(id, prices);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar precios del servicio"
      );
      return null;
    }
  };

  // Verificar si existe un código de servicio
  const checkServiceCodeExists = async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await serviceService.checkServiceCodeExists(
        filters.companyId,
        code
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar código de servicio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si existe un nombre de servicio
  const checkServiceNameExists = async (name: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await serviceService.checkServiceNameExists(
        filters.companyId,
        name
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar nombre de servicio"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar datos del servicio
  const validateServiceData = (
    serviceData: CreateServiceData
  ): { isValid: boolean; errors: string[] } => {
    return serviceService.validateServiceData(serviceData);
  };

  // Calcular precio promedio
  const calculateAveragePrice = (service: Service): number => {
    return serviceService.calculateAveragePrice(service);
  };

  // Analizar precios del servicio
  const analyzeServicePrices = (service: Service): ServicePriceAnalysis => {
    return serviceService.analyzeServicePrices(service);
  };

  // Crear múltiples servicios
  const createMultipleServices = async (
    servicesData: CreateServiceData[]
  ): Promise<Service[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todos los servicios primero
      for (const serviceData of servicesData) {
        const validation = serviceService.validateServiceData(serviceData);
        if (!validation.isValid) {
          setError(
            `Error en servicio ${serviceData.name}: ${validation.errors.join(
              ", "
            )}`
          );
          return null;
        }
      }

      const createdServices = await serviceService.createMultipleServices(
        filters.companyId,
        servicesData
      );
      setServices((prev) => [...prev, ...createdServices]);
      return createdServices;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples servicios"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar servicios al montar el hook o cuando cambien los filtros
  useEffect(() => {
    if (filters.companyId) {
      loadServices();
    }
  }, [filters.companyId, filters.categoryId, filters.search]);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    getServiceById,
    updateServicePrices,
    checkServiceCodeExists,
    checkServiceNameExists,
    validateServiceData,
    calculateAveragePrice,
    analyzeServicePrices,
    createMultipleServices,
    refetch: loadServices,
  };
};

// Hook especializado para servicios por compañía
export const useServicesByCompany = (companyId: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServicesByCompany = async (id?: string) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyServices = await serviceService.getServicesByCompany(
        targetCompanyId
      );
      setServices(companyServices);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar servicios de la compañía"
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadServicesByCompany();
    }
  }, [companyId]);

  return {
    services,
    loading,
    error,
    refetch: loadServicesByCompany,
  };
};

// Hook especializado para servicios por categoría
export const useServicesByCategory = (
  companyId: string,
  categoryId?: string
) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServicesByCategory = async (id?: string) => {
    const targetCategoryId = id || categoryId;
    if (!targetCategoryId) {
      setError("categoryId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const categoryServices = await serviceService.getServicesByCategory(
        companyId,
        targetCategoryId
      );
      setServices(categoryServices);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar servicios de la categoría"
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && categoryId) {
      loadServicesByCategory();
    }
  }, [companyId, categoryId]);

  return {
    services,
    loading,
    error,
    refetch: loadServicesByCategory,
  };
};

// Hook para select/dropdown de servicios
export const useServicesForSelect = (companyId: string) => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string; code: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async (id?: string) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const selectOptions = await serviceService.getServicesForSelect(
        targetCompanyId
      );
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de servicios"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadOptions();
    }
  }, [companyId]);

  return {
    options,
    loading,
    error,
    refetch: loadOptions,
  };
};

// Hook para búsqueda de servicios
export const useServiceSearch = (companyId: string) => {
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchServices = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await serviceService.searchServices(
        companyId,
        searchTerm
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar servicios"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchServicesByName = async (name: string) => {
    if (!name.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await serviceService.searchServicesByName(
        companyId,
        name
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar servicios por nombre"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchServicesByCode = async (code: string) => {
    if (!code.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await serviceService.searchServicesByCode(
        companyId,
        code
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar servicios por código"
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
    searchServices,
    searchServicesByName,
    searchServicesByCode,
    clearSearch,
  };
};

// Hook para estadísticas de servicios
export const useServicesStatistics = (companyId: string) => {
  const [statistics, setStatistics] = useState<{
    total: number;
    with_category: number;
    without_category: number;
    average_price: number;
    price_range: { min: number; max: number };
  }>({
    total: 0,
    with_category: 0,
    without_category: 0,
    average_price: 0,
    price_range: { min: 0, max: 0 },
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
      const stats = await serviceService.getServicesStatistics(targetCompanyId);
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de servicios"
      );
      setStatistics({
        total: 0,
        with_category: 0,
        without_category: 0,
        average_price: 0,
        price_range: { min: 0, max: 0 },
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

// Hook para análisis de precios de servicios
export const useServicePriceAnalysis = (companyId: string) => {
  const { services, loading, error } = useServicesByCompany(companyId);

  const priceAnalysis = services.map((service) =>
    serviceService.analyzeServicePrices(service)
  );

  const competitiveServices = priceAnalysis.filter(
    (analysis) => analysis.is_competitive
  );
  const nonCompetitiveServices = priceAnalysis.filter(
    (analysis) => !analysis.is_competitive
  );

  const averagePriceAll =
    priceAnalysis.length > 0
      ? priceAnalysis.reduce(
          (sum, analysis) => sum + analysis.average_price,
          0
        ) / priceAnalysis.length
      : 0;

  return {
    priceAnalysis,
    competitiveServices,
    nonCompetitiveServices,
    averagePriceAll: parseFloat(averagePriceAll.toFixed(2)),
    services,
    loading,
    error,
  };
};

// Hook para servicios con mejor valor
export const useBestValueServices = (companyId: string, limit: number = 10) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBestValueServices = async (id?: string, newLimit?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bestValue = await serviceService.getBestValueServices(
        targetCompanyId,
        newLimit || limit
      );
      setServices(bestValue);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar servicios con mejor valor"
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadBestValueServices();
    }
  }, [companyId, limit]);

  return {
    services,
    loading,
    error,
    refetch: loadBestValueServices,
  };
};
