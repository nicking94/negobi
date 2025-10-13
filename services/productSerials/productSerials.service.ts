import api from "../../utils/api";
import {
  PostProductSerial,
  GetProductSerials,
  PatchProductSerial,
  DeleteProductSerial,
} from "../productSerials/productSerials.route";

export interface GetProductSerialsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  productId?: number;
  serialNumber?: string;
  currentWarehouseId?: number;
  status?: ProductSerialStatus;
}

// Tipos para los valores enumerados
export type ProductSerialStatus =
  | "Available"
  | "Sold"
  | "Reserved"
  | "In Transit"
  | "Defective";

export interface ProductSerial {
  // Campos del response (GET)
  id: number;
  product_id: number;
  serial_number: string;
  status: ProductSerialStatus;
  purchase_date: string;
  purchase_price: number;
  notes: string;

  // Campos de relación
  currentWarehouseId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductSerialData {
  // Campos requeridos para crear un serial de producto
  product_id: number;
  serial_number: string;

  // Campos opcionales para creación
  currentWarehouseId?: number;
  status?: ProductSerialStatus;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
}

export interface UpdateProductSerialData {
  // Todos los campos son opcionales para actualización
  product_id?: number;
  serial_number?: string;
  currentWarehouseId?: number;
  status?: ProductSerialStatus;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
}

// Response interfaces
export interface ProductSerialResponse {
  success: boolean;
  data: ProductSerial;
}

export interface ProductSerialsListResponse {
  success: boolean;
  data: ProductSerial[];
}

export interface PaginatedProductSerialsResponse {
  success: boolean;
  data: {
    data: ProductSerial[];
    totalPages: number;
    total: number;
  };
}

export const productSerialService = {
  // Crear un nuevo serial de producto
  createProductSerial: async (
    productSerialData: CreateProductSerialData
  ): Promise<ProductSerial> => {
    const response = await api.post(PostProductSerial, productSerialData);
    return response.data.data;
  },

  // Obtener todos los seriales de productos
  getProductSerials: async (
    params?: GetProductSerialsParams
  ): Promise<ProductSerial[]> => {
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
    if (params?.productId) {
      queryParams.append("productId", params.productId.toString());
    }
    if (params?.serialNumber) {
      queryParams.append("serialNumber", params.serialNumber);
    }
    if (params?.currentWarehouseId) {
      queryParams.append(
        "currentWarehouseId",
        params.currentWarehouseId.toString()
      );
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }

    const response = await api.get(`${GetProductSerials}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar un serial de producto
  updateProductSerial: async (
    id: string,
    updates: UpdateProductSerialData
  ): Promise<ProductSerial> => {
    const response = await api.patch(`${PatchProductSerial}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un serial de producto
  deleteProductSerial: async (id: string): Promise<void> => {
    await api.delete(`${DeleteProductSerial}/${id}`);
  },

  // Obtener un serial de producto por ID
  getProductSerialById: async (id: string): Promise<ProductSerial> => {
    const response = await api.get(`${GetProductSerials}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getProductSerialsByProduct: async (
    productId: number
  ): Promise<ProductSerial[]> => {
    return productSerialService.getProductSerials({
      productId,
      itemsPerPage: 10,
    });
  },

  getProductSerialsByWarehouse: async (
    warehouseId: number
  ): Promise<ProductSerial[]> => {
    return productSerialService.getProductSerials({
      currentWarehouseId: warehouseId,
      itemsPerPage: 10,
    });
  },

  getProductSerialsByStatus: async (
    status: ProductSerialStatus
  ): Promise<ProductSerial[]> => {
    return productSerialService.getProductSerials({
      status,
      itemsPerPage: 10,
    });
  },

  getProductSerialBySerialNumber: async (
    serialNumber: string
  ): Promise<ProductSerial | null> => {
    try {
      const productSerials = await productSerialService.getProductSerials({
        serialNumber,
        itemsPerPage: 1,
      });
      return productSerials.length > 0 ? productSerials[0] : null;
    } catch (error) {
      console.error("Error fetching product serial by serial number:", error);
      return null;
    }
  },

  getAvailableProductSerials: async (
    productId?: number
  ): Promise<ProductSerial[]> => {
    const params: GetProductSerialsParams = {
      status: "Available",
      itemsPerPage: 10,
    };
    if (productId) {
      params.productId = productId;
    }
    return productSerialService.getProductSerials(params);
  },

  // Cambiar estado de serial
  changeSerialStatus: async (
    id: string,
    newStatus: ProductSerialStatus
  ): Promise<ProductSerial> => {
    return productSerialService.updateProductSerial(id, { status: newStatus });
  },

  // Transferir serial a otro warehouse
  transferSerialToWarehouse: async (
    id: string,
    warehouseId: number
  ): Promise<ProductSerial> => {
    return productSerialService.updateProductSerial(id, {
      currentWarehouseId: warehouseId,
      status: "In Transit",
    });
  },

  // Marcar serial como vendido
  markAsSold: async (id: string): Promise<ProductSerial> => {
    return productSerialService.changeSerialStatus(id, "Sold");
  },

  // Marcar serial como defectuoso
  markAsDefective: async (id: string): Promise<ProductSerial> => {
    return productSerialService.changeSerialStatus(id, "Defective");
  },

  // Crear múltiples seriales
  createMultipleProductSerials: async (
    productSerialsData: CreateProductSerialData[]
  ): Promise<ProductSerial[]> => {
    const createdSerials: ProductSerial[] = [];

    for (const serialData of productSerialsData) {
      try {
        const createdSerial = await productSerialService.createProductSerial(
          serialData
        );
        createdSerials.push(createdSerial);
      } catch (error) {
        console.error(`Error creating product serial:`, error);
        throw error;
      }
    }

    return createdSerials;
  },

  // Verificar disponibilidad de serial
  isSerialAvailable: async (serialNumber: string): Promise<boolean> => {
    try {
      const serial = await productSerialService.getProductSerialBySerialNumber(
        serialNumber
      );
      return serial ? serial.status === "Available" : false;
    } catch (error) {
      console.error("Error checking serial availability:", error);
      return false;
    }
  },

  // Obtener estadísticas de seriales por producto
  getProductSerialStats: async (
    productId: number
  ): Promise<{
    total: number;
    available: number;
    sold: number;
    reserved: number;
    inTransit: number;
    defective: number;
  }> => {
    const allSerials = await productSerialService.getProductSerialsByProduct(
      productId
    );

    return {
      total: allSerials.length,
      available: allSerials.filter((s) => s.status === "Available").length,
      sold: allSerials.filter((s) => s.status === "Sold").length,
      reserved: allSerials.filter((s) => s.status === "Reserved").length,
      inTransit: allSerials.filter((s) => s.status === "In Transit").length,
      defective: allSerials.filter((s) => s.status === "Defective").length,
    };
  },
};
