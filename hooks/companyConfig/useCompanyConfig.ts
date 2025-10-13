import { useState, useEffect } from "react";
import {
  companyConfigService,
  CompanyConfig,
  CreateCompanyConfigData,
  UpdateCompanyConfigData,
  GetCompanyConfigsParams,
} from "../../services/companyConfig/companyConfig.service";

// Definir el tipo para los filtros del hook
export interface UseCompanyConfigFilters {
  companyId?: number;
  search?: string;
  show_available_stock?: boolean;
  price_by_default?: string;
  sync_with_app?: boolean;
  unable_to_debt_client?: boolean;
  connect_with_virtual_store?: boolean;
  enable_data_replication?: boolean;
}

export const useCompanyConfig = (filters: UseCompanyConfigFilters = {}) => {
  const [companyConfigs, setCompanyConfigs] = useState<CompanyConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las configuraciones con filtros
  const loadCompanyConfigs = async (
    customFilters?: Partial<UseCompanyConfigFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetCompanyConfigsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
      };

      console.log(
        "🔵 Enviando parámetros para configuraciones:",
        combinedFilters
      );

      const configsData = await companyConfigService.getCompanyConfigs(
        combinedFilters
      );
      console.log("🟢 Datos de configuraciones recibidos:", configsData);

      if (Array.isArray(configsData)) {
        setCompanyConfigs(configsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", configsData);
        setCompanyConfigs([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar configuraciones"
      );
      setCompanyConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear configuración
  const createCompanyConfig = async (
    configData: CreateCompanyConfigData
  ): Promise<CompanyConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const newConfig = await companyConfigService.createCompanyConfig(
        configData
      );
      setCompanyConfigs((prev) => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear configuración"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar configuración
  const updateCompanyConfig = async (
    id: string,
    updates: UpdateCompanyConfigData
  ): Promise<CompanyConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedConfig = await companyConfigService.updateCompanyConfig(
        id,
        updates
      );
      setCompanyConfigs((prev) =>
        prev.map((config) =>
          config.id.toString() === id ? updatedConfig : config
        )
      );
      return updatedConfig;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar configuración"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar configuración
  const deleteCompanyConfig = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await companyConfigService.deleteCompanyConfig(id);
      setCompanyConfigs((prev) =>
        prev.filter((config) => config.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar configuración"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener configuración por ID
  const getCompanyConfigById = async (
    id: string
  ): Promise<CompanyConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const config = await companyConfigService.getCompanyConfigById(id);
      return config;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener configuración"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener configuración por companyId (método útil)
  const getCompanyConfigByCompanyId = async (
    companyId: number
  ): Promise<CompanyConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const config = await companyConfigService.getCompanyConfigByCompanyId(
        companyId
      );
      return config;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener configuración por empresa"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuraciones al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadCompanyConfigs();
  }, [
    filters.companyId,
    filters.search,
    filters.show_available_stock,
    filters.price_by_default,
    filters.sync_with_app,
    filters.unable_to_debt_client,
    filters.connect_with_virtual_store,
    filters.enable_data_replication,
  ]);

  return {
    companyConfigs,
    loading,
    error,
    createCompanyConfig,
    updateCompanyConfig,
    deleteCompanyConfig,
    getCompanyConfigById,
    getCompanyConfigByCompanyId,
    refetch: loadCompanyConfigs,
  };
};

// Hook especializado para una sola configuración por companyId
export const useCompanyConfigByCompany = (companyId?: number) => {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async (id?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyConfig =
        await companyConfigService.getCompanyConfigByCompanyId(targetCompanyId);
      setConfig(companyConfig);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar configuración"
      );
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadConfig();
    }
  }, [companyId]);

  return {
    config,
    loading,
    error,
    refetch: loadConfig,
  };
};
