// hooks/companyConfig/useCompanyConfig.ts
import { useState, useEffect } from "react";
import {
  companyConfigService,
  CompanyConfig,
  CreateCompanyConfigData,
  UpdateCompanyConfigData,
} from "@/services/companyConfig/companyConfig.service";

export const useCompanyConfig = (companyId?: number) => {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      const companyConfig =
        await companyConfigService.getCompanyConfigByCompanyId(companyId);
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

  const createConfig = async (
    configData: CreateCompanyConfigData
  ): Promise<CompanyConfig | null> => {
    try {
      setLoading(true);
      setError(null);
      const newConfig = await companyConfigService.createCompanyConfig(
        configData
      );
      setConfig(newConfig);
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

  const updateConfig = async (
    updates: UpdateCompanyConfigData
  ): Promise<CompanyConfig | null> => {
    if (!config?.id) return null;

    try {
      setLoading(true);
      setError(null);
      const updatedConfig = await companyConfigService.updateCompanyConfig(
        config.id.toString(),
        updates
      );
      setConfig(updatedConfig);
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

  useEffect(() => {
    if (companyId) {
      loadConfig();
    }
  }, [companyId]);

  return {
    config,
    loading,
    error,
    createConfig,
    updateConfig,
    refetch: loadConfig,
  };
};
