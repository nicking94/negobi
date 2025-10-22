import api from "../../utils/api";
import {
  PostWarehouse,
  GetWarehouses,
  GetWarehouseById,
  PatchWarehouse,
  DeleteWarehouse,
  SyncWarehouses,
} from "./warehouse.route";

// Parámetros para obtener almacenes
export interface GetWarehousesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
}

export interface Warehouse {
  id: number;
  companyBranchId: number;
  name: string;
  code: string;
  contact_person?: string;
  contact_phone?: string;
  location_address?: string;
  is_active: boolean;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Datos para crear un almacén
export interface CreateWarehouseData {
  companyBranchId: number;
  name: string;
  code: string;
  contact_person?: string;
  contact_phone?: string;
  location_address?: string;
  is_active?: boolean;
  external_code?: string;
}

// Datos para actualizar un almacén
export interface UpdateWarehouseData {
  companyBranchId?: number;
  name?: string;
  code?: string;
  contact_person?: string;
  contact_phone?: string;
  location_address?: string;
  is_active?: boolean;
  external_code?: string;
}

// Datos para sincronización con ERP
export interface SyncWarehouseData {
  companyId: number;
  data: CreateWarehouseData[];
}

// Interfaces de respuesta
export interface WarehouseResponse {
  success: boolean;
  data: Warehouse;
}

export interface WarehousesListResponse {
  success: boolean;
  data: Warehouse[];
}

export interface PaginatedWarehousesResponse {
  success: boolean;
  data: {
    data: Warehouse[];
    totalPages: number;
    total: number;
  };
}

export interface SyncResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const warehouseService = {
  createWarehouse: async (
    warehouseData: CreateWarehouseData
  ): Promise<Warehouse> => {
    const response = await api.post(PostWarehouse, warehouseData);
    const warehouse = response.data.data;

    return {
      ...warehouse,
      companyBranchId:
        warehouse.company_branch?.id || warehouse.companyBranchId,
    };
  },

  // En services/warehouse/warehouse.service.ts - MÉTODO getWarehouses
  getWarehouses: async (params?: GetWarehousesParams): Promise<Warehouse[]> => {
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
    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    const url = `${GetWarehouses}?${queryParams}`;
    console.log("🔄 Llamando a la API con URL:", url);

    try {
      const response = await api.get(url);
      console.log("✅ Respuesta completa de la API:", response);

      const responseData = response.data.data;
      console.log("📦 Estructura completa recibida:", responseData);

      const warehousesData = responseData.data;
      console.log("📦 Array de almacenes RAW:", warehousesData);

      // ✅ NUEVO: Inspeccionar la estructura del primer warehouse
      if (warehousesData.length > 0) {
        console.log("🔍 Primer warehouse detallado:", {
          id: warehousesData[0].id,
          name: warehousesData[0].name,
          // Verificar todas las propiedades posibles
          companyBranchId: warehousesData[0].companyBranchId,
          company_branch: warehousesData[0].company_branch,
          // Verificar si hay otros campos relacionados
          company_branch_id: warehousesData[0].company_branch_id,
          branchId: warehousesData[0].branchId,
          // Verificar todas las keys
          allKeys: Object.keys(warehousesData[0]),
        });
      }

      if (!Array.isArray(warehousesData)) {
        console.warn("⚠️ warehousesData no es un array:", warehousesData);
        return [];
      }

      const mappedWarehouses = warehousesData.map((warehouse) => {
        console.log(`🔍 Procesando warehouse ${warehouse.id}:`, warehouse);

        // La API SIEMPRE debe devolver companyBranchId directamente
        // según la documentación
        const companyBranchId = warehouse.companyBranchId;

        if (!companyBranchId) {
          console.error("❌ Warehouse sin companyBranchId:", {
            id: warehouse.id,
            name: warehouse.name,
            allProperties: Object.keys(warehouse),
          });
        }

        return {
          ...warehouse,
          companyBranchId: companyBranchId || 0, // Mantener 0 como fallback
        };
      });

      console.log("📦 Almacenes mapeados FINAL:", mappedWarehouses);
      return mappedWarehouses;
    } catch (error) {
      console.error("❌ Error en la llamada a getWarehouses:", error);
      throw error;
    }
  },
  // Obtener un almacén por ID
  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await api.get(`${GetWarehouseById}/${id}`);
    return response.data.data;
  },

  updateWarehouse: async (
    id: string,
    updates: UpdateWarehouseData
  ): Promise<Warehouse> => {
    const response = await api.patch(`${PatchWarehouse}/${id}`, updates);
    const warehouse = response.data.data;

    return {
      ...warehouse,
      companyBranchId:
        warehouse.company_branch?.id || warehouse.companyBranchId,
    };
  },

  // Eliminar un almacén
  deleteWarehouse: async (id: string): Promise<void> => {
    await api.delete(`${DeleteWarehouse}/${id}`);
  },

  // Sincronizar almacenes desde ERP
  syncWarehouses: async (
    syncData: SyncWarehouseData
  ): Promise<SyncResponse> => {
    const response = await api.post(SyncWarehouses, syncData);
    return response.data;
  },

  // Métodos adicionales útiles
  getActiveWarehouses: async (companyId?: number): Promise<Warehouse[]> => {
    return warehouseService.getWarehouses({
      companyId,
      itemsPerPage: 10, // Más almacenes ya que pueden ser muchos
    });
  },

  // Buscar almacenes por nombre
  searchWarehousesByName: async (
    searchTerm: string,
    companyId?: number
  ): Promise<Warehouse[]> => {
    return warehouseService.getWarehouses({
      search: searchTerm,
      companyId,
      itemsPerPage: 20,
    });
  },

  // Buscar almacenes por código
  searchWarehousesByCode: async (
    code: string,
    companyId?: number
  ): Promise<Warehouse[]> => {
    const warehouses = await warehouseService.getWarehouses({
      companyId,
      itemsPerPage: 10,
    });
    return warehouses.filter((warehouse) =>
      warehouse.code.toLowerCase().includes(code.toLowerCase())
    );
  },

  // Obtener almacenes por sucursal
  getWarehousesByBranch: async (branchId: number): Promise<Warehouse[]> => {
    const warehouses = await warehouseService.getActiveWarehouses();
    return warehouses.filter(
      (warehouse) => warehouse.companyBranchId === branchId
    );
  },

  // Activar/desactivar almacén
  toggleWarehouseStatus: async (
    id: string,
    isActive: boolean
  ): Promise<Warehouse> => {
    return warehouseService.updateWarehouse(id, { is_active: isActive });
  },

  // Verificar si existe un almacén con el mismo código
  checkWarehouseCodeExists: async (
    code: string,
    companyId?: number
  ): Promise<boolean> => {
    try {
      const warehouses = await warehouseService.searchWarehousesByCode(
        code,
        companyId
      );
      return warehouses.length > 0;
    } catch (error) {
      console.error("Error checking warehouse code existence:", error);
      return false;
    }
  },

  // Verificar si existe un almacén con el mismo nombre
  checkWarehouseNameExists: async (
    name: string,
    companyId?: number
  ): Promise<boolean> => {
    try {
      const warehouses = await warehouseService.searchWarehousesByName(
        name,
        companyId
      );
      return warehouses.length > 0;
    } catch (error) {
      console.error("Error checking warehouse name existence:", error);
      return false;
    }
  },

  getWarehousesForSelect: async (
    companyId?: number
  ): Promise<
    Array<{ value: number; label: string; code: string; branchId: number }>
  > => {
    try {
      const warehouses = await warehouseService.getActiveWarehouses(companyId);
      return warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: warehouse.name,
        code: warehouse.code,
        branchId: warehouse.companyBranchId,
      }));
    } catch (error) {
      console.error("Error getting warehouses for select:", error);
      return [];
    }
  },

  // Obtener almacenes agrupados por sucursal
  getWarehousesGroupedByBranch: async (
    companyId?: number
  ): Promise<Record<number, Warehouse[]>> => {
    try {
      const warehouses = await warehouseService.getActiveWarehouses(companyId);
      return warehouses.reduce((groups, warehouse) => {
        const branchId = warehouse.companyBranchId;
        if (!groups[branchId]) {
          groups[branchId] = [];
        }
        groups[branchId].push(warehouse);
        return groups;
      }, {} as Record<number, Warehouse[]>);
    } catch (error) {
      console.error("Error grouping warehouses by branch:", error);
      return {};
    }
  },

  // Validar formato de teléfono (básico)
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  // Formatear teléfono
  formatPhone: (phone: string): string => {
    return phone.replace(/\D/g, "").substring(0, 15);
  },
};
