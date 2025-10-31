import { useState, useEffect } from "react";
import {
  serviceService,
  Service,
  CreateServiceData,
  UpdateServiceData,
  GetServicesParams,
  ServicePriceAnalysis,
} from "../../services/servicios/services.service";

export interface UseServicesFilters {
  companyId: string;
  categoryId?: string;
  search?: string;
}

export const useServices = (filters: UseServicesFilters) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const createService = async (
    serviceData: CreateServiceData
  ): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

      const validation = serviceService.validateServiceData(serviceData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      const codeExists = await serviceService.checkServiceCodeExists(
        filters.companyId,
        serviceData.code
      );
      if (codeExists) {
        setError("Ya existe un servicio con este código");
        return null;
      }

      const nameExists = await serviceService.checkServiceNameExists(
        filters.companyId,
        serviceData.name
      );
      if (nameExists) {
        setError("Ya existe un servicio con este nombre");
        return null;
      }

      const newService = await serviceService.createService(serviceData);

      const normalizedService: Service = {
        id: newService.id,
        price_level_1: newService.price_level_1,
        price_level_2: newService.price_level_2,
        price_level_3: newService.price_level_3,
        description: newService.description,
        name: newService.name,
        code: newService.code,
        erp_code_inst: newService.erp_code_inst || "",
        category_id: newService.category_id,
        company_id: newService.company_id,
        external_code: newService.external_code || "",
        sync_with_erp: newService.sync_with_erp,
        created_at: newService.created_at,
        updated_at: newService.updated_at,
        deleted_at: newService.deleted_at,
      };

      setServices((prev) => [...prev, normalizedService]);
      return normalizedService;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear servicio");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (
    id: string,
    updates: UpdateServiceData
  ): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

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

      const normalizedService: Service = {
        id: updatedService.id,
        price_level_1: updatedService.price_level_1,
        price_level_2: updatedService.price_level_2,
        price_level_3: updatedService.price_level_3,
        description: updatedService.description,
        name: updatedService.name,
        code: updatedService.code,
        erp_code_inst: updatedService.erp_code_inst || "",
        category_id: updatedService.category_id,
        company_id: updatedService.company_id,
        external_code: updatedService.external_code || "",
        sync_with_erp: updatedService.sync_with_erp,
        created_at: updatedService.created_at,
        updated_at: updatedService.updated_at,
        deleted_at: updatedService.deleted_at,
      };

      setServices((prev) =>
        prev.map((service) =>
          service.id.toString() === id ? normalizedService : service
        )
      );
      return normalizedService;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar servicio"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

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

  const validateServiceData = (
    serviceData: CreateServiceData
  ): { isValid: boolean; errors: string[] } => {
    return serviceService.validateServiceData(serviceData);
  };

  const calculateAveragePrice = (service: Service): number => {
    return serviceService.calculateAveragePrice(service);
  };

  const analyzeServicePrices = (service: Service): ServicePriceAnalysis => {
    return serviceService.analyzeServicePrices(service);
  };

  const createMultipleServices = async (
    servicesData: CreateServiceData[]
  ): Promise<Service[] | null> => {
    try {
      setLoading(true);
      setError(null);

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
