import api from "../../utils/api";
import {
  SupplierCreatePayload,
  SupplierUpdatePayload,
  SupplierQueryType,
  SupplierSyncPayload,
  SupplierResponse,
  SuppliersListResponse,
  SupplierDeleteResponse,
  SupplierSyncResponse,
} from "../../types/index";

export const supplierService = {
  async getSuppliers(
    params: SupplierQueryType
  ): Promise<SuppliersListResponse> {
    const response = await api.get<SuppliersListResponse>("/suppliers", {
      params,
    });
    return response.data;
  },

  // GET - Obtener proveedor por ID
  async getSupplierById(id: number): Promise<SupplierResponse> {
    const response = await api.get<SupplierResponse>(`/suppliers/${id}`);
    return response.data;
  },

  // POST - Crear nuevo proveedor
  async createSupplier(
    supplierData: SupplierCreatePayload
  ): Promise<SupplierResponse> {
    const response = await api.post<SupplierResponse>(
      "/suppliers",
      supplierData
    );
    return response.data;
  },

  // PATCH - Actualizar proveedor
  async updateSupplier(
    id: number,
    supplierData: SupplierUpdatePayload
  ): Promise<SupplierResponse> {
    const response = await api.patch<SupplierResponse>(
      `/suppliers/${id}`,
      supplierData
    );
    return response.data;
  },

  // DELETE - Eliminar proveedor
  async deleteSupplier(id: number): Promise<SupplierDeleteResponse> {
    const response = await api.delete<SupplierDeleteResponse>(
      `/suppliers/${id}`
    );
    return response.data;
  },

  // POST - Sincronizar proveedores desde ERP
  async syncSuppliers(
    syncData: SupplierSyncPayload
  ): Promise<SupplierSyncResponse> {
    const response = await api.post<SupplierSyncResponse>(
      "/suppliers/sync",
      syncData
    );
    return response.data;
  },
};
