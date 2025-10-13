import api from "../../utils/api";
import {
  PostZone,
  GetZones,
  GetZoneById,
  PatchZone,
  DeleteZone,
} from "../zones/zones.route";

// Parámetros para obtener zonas
export interface GetZonesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  zone_name?: string;
  zip_code?: string;
}

// Interfaz principal de la zona
export interface Zone {
  // Campos principales
  id: number;
  zone_name: string;
  zip_code: string;
  is_active: boolean;
  representative?: string;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Datos para crear una zona
export interface CreateZoneData {
  zone_name: string;
  zip_code: string;
  representative?: string;
}

// Datos para actualizar una zona
export interface UpdateZoneData {
  zone_name?: string;
  zip_code?: string;
  is_active?: boolean;
  representative?: string;
}

// Interfaces de respuesta
export interface ZoneResponse {
  success: boolean;
  data: Zone;
}

export interface ZonesListResponse {
  success: boolean;
  data: Zone[];
}

export interface PaginatedZonesResponse {
  success: boolean;
  data: {
    data: Zone[];
    totalPages: number;
    total: number;
  };
}

export const zoneService = {
  // Crear una nueva zona
  createZone: async (zoneData: CreateZoneData): Promise<Zone> => {
    const response = await api.post(PostZone, zoneData);
    return response.data.data;
  },

  // Obtener todas las zonas
  getZones: async (params?: GetZonesParams): Promise<Zone[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.zone_name) {
      queryParams.append("zone_name", params.zone_name);
    }
    if (params?.zip_code) {
      queryParams.append("zip_code", params.zip_code);
    }

    const response = await api.get(`${GetZones}?${queryParams}`);
    return response.data.data;
  },

  // Obtener una zona por ID
  getZoneById: async (id: string): Promise<Zone> => {
    const response = await api.get(`${GetZoneById}/${id}`);
    return response.data.data;
  },

  // Actualizar una zona
  updateZone: async (id: string, updates: UpdateZoneData): Promise<Zone> => {
    const response = await api.patch(`${PatchZone}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una zona
  deleteZone: async (id: string): Promise<void> => {
    await api.delete(`${DeleteZone}/${id}`);
  },

  // Métodos adicionales útiles
  getActiveZones: async (): Promise<Zone[]> => {
    return zoneService.getZones({
      itemsPerPage: 1000,
    });
  },

  // Buscar zonas por nombre
  searchZonesByName: async (searchTerm: string): Promise<Zone[]> => {
    return zoneService.getZones({
      search: searchTerm,
      itemsPerPage: 1000,
    });
  },

  // Buscar zonas por código postal
  searchZonesByZipCode: async (zipCode: string): Promise<Zone[]> => {
    return zoneService.getZones({
      zip_code: zipCode,
      itemsPerPage: 1000,
    });
  },

  // Activar/desactivar zona
  toggleZoneStatus: async (id: string, isActive: boolean): Promise<Zone> => {
    return zoneService.updateZone(id, { is_active: isActive });
  },

  // Verificar si existe una zona con el mismo nombre
  checkZoneNameExists: async (zoneName: string): Promise<boolean> => {
    try {
      const zones = await zoneService.getZones({
        zone_name: zoneName,
        itemsPerPage: 1,
      });
      return zones.length > 0;
    } catch (error) {
      console.error("Error checking zone name existence:", error);
      return false;
    }
  },

  // Verificar si existe una zona con el mismo código postal
  checkZipCodeExists: async (zipCode: string): Promise<boolean> => {
    try {
      const zones = await zoneService.getZones({
        zip_code: zipCode,
        itemsPerPage: 1,
      });
      return zones.length > 0;
    } catch (error) {
      console.error("Error checking zip code existence:", error);
      return false;
    }
  },

  // Obtener zonas para select/dropdown
  getZonesForSelect: async (): Promise<
    Array<{ value: number; label: string; zip_code: string }>
  > => {
    try {
      const zones = await zoneService.getActiveZones();
      return zones.map((zone) => ({
        value: zone.id,
        label: zone.zone_name,
        zip_code: zone.zip_code,
      }));
    } catch (error) {
      console.error("Error getting zones for select:", error);
      return [];
    }
  },

  // Obtener zonas agrupadas por código postal (primeros 2 dígitos)
  getZonesGroupedByZipCodeArea: async (): Promise<Record<string, Zone[]>> => {
    try {
      const zones = await zoneService.getActiveZones();
      return zones.reduce((groups, zone) => {
        const zipArea = zone.zip_code.substring(0, 2);
        if (!groups[zipArea]) {
          groups[zipArea] = [];
        }
        groups[zipArea].push(zone);
        return groups;
      }, {} as Record<string, Zone[]>);
    } catch (error) {
      console.error("Error grouping zones by zip code area:", error);
      return {};
    }
  },

  // Obtener representantes únicos
  getUniqueRepresentatives: async (): Promise<string[]> => {
    try {
      const zones = await zoneService.getActiveZones();
      const representatives = zones
        .map((zone) => zone.representative)
        .filter((rep): rep is string => !!rep && rep.trim() !== "");

      return [...new Set(representatives)];
    } catch (error) {
      console.error("Error getting unique representatives:", error);
      return [];
    }
  },

  // Obtener zonas por representante
  getZonesByRepresentative: async (representative: string): Promise<Zone[]> => {
    try {
      const zones = await zoneService.getActiveZones();
      return zones.filter((zone) => zone.representative === representative);
    } catch (error) {
      console.error("Error getting zones by representative:", error);
      return [];
    }
  },

  // Validar formato de código postal
  validateZipCode: (zipCode: string): boolean => {
    const zipCodeRegex = /^\d{4,10}$/;
    return zipCodeRegex.test(zipCode);
  },

  // Formatear código postal
  formatZipCode: (zipCode: string): string => {
    return zipCode.replace(/\D/g, "").substring(0, 10);
  },
};
