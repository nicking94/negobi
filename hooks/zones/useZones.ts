import { useState, useEffect } from "react";
import {
  zoneService,
  Zone,
  CreateZoneData,
  UpdateZoneData,
  GetZonesParams,
} from "../../services/zones/zones.service";

// Definir el tipo para los filtros del hook
export interface UseZonesFilters {
  zone_name?: string;
  zip_code?: string;
  search?: string;
}

export const useZones = (filters: UseZonesFilters = {}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las zonas con filtros
  const loadZones = async (customFilters?: Partial<UseZonesFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetZonesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log("🔵 Enviando parámetros para zonas:", combinedFilters);

      const zonesData = await zoneService.getZones(combinedFilters);
      console.log("🟢 Datos de zonas recibidos:", zonesData);

      if (Array.isArray(zonesData)) {
        setZones(zonesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", zonesData);
        setZones([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar zonas");
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear zona
  const createZone = async (zoneData: CreateZoneData): Promise<Zone | null> => {
    try {
      setLoading(true);
      setError(null);
      const newZone = await zoneService.createZone(zoneData);
      setZones((prev) => [...prev, newZone]);
      return newZone;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear zona");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar zona
  const updateZone = async (
    id: string,
    updates: UpdateZoneData
  ): Promise<Zone | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedZone = await zoneService.updateZone(id, updates);
      setZones((prev) =>
        prev.map((zone) => (zone.id.toString() === id ? updatedZone : zone))
      );
      return updatedZone;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar zona");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar zona
  const deleteZone = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await zoneService.deleteZone(id);
      setZones((prev) => prev.filter((zone) => zone.id.toString() !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar zona");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener zona por ID
  const getZoneById = async (id: string): Promise<Zone | null> => {
    try {
      setLoading(true);
      setError(null);
      const zone = await zoneService.getZoneById(id);
      return zone;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener zona");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Activar/desactivar zona
  const toggleZoneStatus = async (
    id: string,
    isActive: boolean
  ): Promise<Zone | null> => {
    try {
      return await updateZone(id, { is_active: isActive });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado de la zona"
      );
      return null;
    }
  };

  // Verificar si existe un nombre de zona
  const checkZoneNameExists = async (zoneName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await zoneService.checkZoneNameExists(zoneName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al verificar nombre de zona"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si existe un código postal
  const checkZipCodeExists = async (zipCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await zoneService.checkZipCodeExists(zipCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al verificar código postal"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar código postal
  const validateZipCode = (zipCode: string): boolean => {
    return zoneService.validateZipCode(zipCode);
  };

  // Formatear código postal
  const formatZipCode = (zipCode: string): string => {
    return zoneService.formatZipCode(zipCode);
  };

  // Cargar zonas al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadZones();
  }, [filters.zone_name, filters.zip_code, filters.search]);

  return {
    zones,
    loading,
    error,
    createZone,
    updateZone,
    deleteZone,
    getZoneById,
    toggleZoneStatus,
    checkZoneNameExists,
    checkZipCodeExists,
    validateZipCode,
    formatZipCode,
    refetch: loadZones,
  };
};

// Hook especializado para zonas activas
export const useActiveZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeZones = await zoneService.getActiveZones();
      setZones(activeZones);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar zonas activas"
      );
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveZones();
  }, []);

  return {
    zones,
    loading,
    error,
    refetch: loadActiveZones,
  };
};

// Hook para select/dropdown de zonas
export const useZonesForSelect = () => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string; zip_code: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions = await zoneService.getZonesForSelect();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar opciones de zonas"
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

// Hook para búsqueda de zonas
export const useZoneSearch = () => {
  const [searchResults, setSearchResults] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchZones = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await zoneService.searchZonesByName(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar zonas");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchZonesByZipCode = async (zipCode: string) => {
    if (!zipCode.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await zoneService.searchZonesByZipCode(zipCode);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar zonas por código postal"
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
    searchZones,
    searchZonesByZipCode,
    clearSearch,
  };
};

// Hook para gestión de representantes
export const useZoneRepresentatives = () => {
  const [representatives, setRepresentatives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepresentatives = async () => {
    try {
      setLoading(true);
      setError(null);
      const reps = await zoneService.getUniqueRepresentatives();
      setRepresentatives(reps);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar representantes"
      );
      setRepresentatives([]);
    } finally {
      setLoading(false);
    }
  };

  const getZonesByRepresentative = async (
    representative: string
  ): Promise<Zone[]> => {
    try {
      setLoading(true);
      setError(null);
      const zones = await zoneService.getZonesByRepresentative(representative);
      return zones;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar zonas del representante"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepresentatives();
  }, []);

  return {
    representatives,
    loading,
    error,
    getZonesByRepresentative,
    refetch: loadRepresentatives,
  };
};

// Hook para análisis de zonas
export const useZonesAnalysis = () => {
  const { zones, loading, error } = useActiveZones();

  const analysis = {
    // Total de zonas
    totalZones: zones.length,

    // Zonas por código postal (primeros 2 dígitos)
    zonesByZipCodeArea: zones.reduce((areas, zone) => {
      const zipArea = zone.zip_code.substring(0, 2);
      areas[zipArea] = (areas[zipArea] || 0) + 1;
      return areas;
    }, {} as Record<string, number>),

    // Zonas con representante
    zonesWithRepresentative: zones.filter(
      (zone) => zone.representative && zone.representative.trim() !== ""
    ),

    // Zonas sin representante
    zonesWithoutRepresentative: zones.filter(
      (zone) => !zone.representative || zone.representative.trim() === ""
    ),

    // Códigos postales únicos
    uniqueZipCodes: [...new Set(zones.map((zone) => zone.zip_code))],

    // Representantes únicos
    uniqueRepresentatives: [
      ...new Set(zones.map((zone) => zone.representative).filter(Boolean)),
    ],
  };

  return {
    analysis,
    zones,
    loading,
    error,
  };
};
