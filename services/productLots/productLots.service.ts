import api from "../../utils/api";
import {
  PostProductLot,
  GetProductLots,
  PatchProductLot,
  DeleteProductLot,
} from "../productLots/productLots.route";

export interface GetProductLotsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  productId?: number;
  lotNumber?: string;
  currentWarehouseId?: number;
  expirationDate?: string;
  manufacturingDate?: string;
}

export interface ProductLot {
  // Campos del response (GET)
  id: number;
  lot_number: string;
  expiration_date: string;
  manufacturing_date: string;
  quantity: number;
  purchase_price: number;
  notes: string;

  // Campos de relación
  product_id?: number;
  currentWarehouseId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductLotData {
  // Campos requeridos para crear un lote de producto
  product_id: number;
  lot_number: string;
  quantity: number;

  // Campos opcionales para creación
  currentWarehouseId?: number;
  expiration_date?: string;
  manufacturing_date?: string;
  purchase_price?: number;
  notes?: string;
}

export interface UpdateProductLotData {
  // Todos los campos son opcionales para actualización
  product_id?: number;
  lot_number?: string;
  currentWarehouseId?: number;
  expiration_date?: string;
  manufacturing_date?: string;
  quantity?: number;
  purchase_price?: number;
  notes?: string;
}

// Response interfaces
export interface ProductLotResponse {
  success: boolean;
  data: ProductLot;
}

export interface ProductLotsListResponse {
  success: boolean;
  data: ProductLot[];
}

export interface PaginatedProductLotsResponse {
  success: boolean;
  data: {
    data: ProductLot[];
    totalPages: number;
    total: number;
  };
}

export const productLotService = {
  // Crear un nuevo lote de producto
  createProductLot: async (
    productLotData: CreateProductLotData
  ): Promise<ProductLot> => {
    const response = await api.post(PostProductLot, productLotData);
    return response.data.data;
  },

  // Obtener todos los lotes de productos
  getProductLots: async (
    params?: GetProductLotsParams
  ): Promise<ProductLot[]> => {
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
    if (params?.lotNumber) {
      queryParams.append("lotNumber", params.lotNumber);
    }
    if (params?.currentWarehouseId) {
      queryParams.append(
        "currentWarehouseId",
        params.currentWarehouseId.toString()
      );
    }
    if (params?.expirationDate) {
      queryParams.append("expirationDate", params.expirationDate);
    }
    if (params?.manufacturingDate) {
      queryParams.append("manufacturingDate", params.manufacturingDate);
    }

    const response = await api.get(`${GetProductLots}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar un lote de producto
  updateProductLot: async (
    id: string,
    updates: UpdateProductLotData
  ): Promise<ProductLot> => {
    const response = await api.patch(`${PatchProductLot}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un lote de producto
  deleteProductLot: async (id: string): Promise<void> => {
    await api.delete(`${DeleteProductLot}/${id}`);
  },

  // Obtener un lote de producto por ID
  getProductLotById: async (id: string): Promise<ProductLot> => {
    const response = await api.get(`${GetProductLots}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getProductLotsByProduct: async (productId: number): Promise<ProductLot[]> => {
    return productLotService.getProductLots({
      productId,
      itemsPerPage: 1000,
    });
  },

  getProductLotsByWarehouse: async (
    warehouseId: number
  ): Promise<ProductLot[]> => {
    return productLotService.getProductLots({
      currentWarehouseId: warehouseId,
      itemsPerPage: 1000,
    });
  },

  getProductLotByLotNumber: async (
    lotNumber: string
  ): Promise<ProductLot | null> => {
    try {
      const productLots = await productLotService.getProductLots({
        lotNumber,
        itemsPerPage: 1,
      });
      return productLots.length > 0 ? productLots[0] : null;
    } catch (error) {
      console.error("Error fetching product lot by lot number:", error);
      return null;
    }
  },

  getExpiredProductLots: async (): Promise<ProductLot[]> => {
    const allLots = await productLotService.getProductLots({
      itemsPerPage: 10000,
    });

    const today = new Date();
    return allLots.filter((lot) => {
      if (!lot.expiration_date) return false;
      const expirationDate = new Date(lot.expiration_date);
      return expirationDate < today && lot.quantity > 0;
    });
  },

  getExpiringProductLots: async (days: number = 30): Promise<ProductLot[]> => {
    const allLots = await productLotService.getProductLots({
      itemsPerPage: 10000,
    });

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return allLots.filter((lot) => {
      if (!lot.expiration_date) return false;
      const expirationDate = new Date(lot.expiration_date);
      return (
        expirationDate >= today &&
        expirationDate <= futureDate &&
        lot.quantity > 0
      );
    });
  },

  // Calcular cantidad total por producto
  getTotalQuantityByProduct: async (productId: number): Promise<number> => {
    try {
      const productLots = await productLotService.getProductLotsByProduct(
        productId
      );
      return productLots.reduce((total, lot) => total + lot.quantity, 0);
    } catch (error) {
      console.error("Error calculating total quantity by product:", error);
      return 0;
    }
  },

  // Ajustar cantidad de lote
  adjustProductLotQuantity: async (
    id: string,
    adjustment: number
  ): Promise<ProductLot> => {
    const currentLot = await productLotService.getProductLotById(id);
    const newQuantity = Math.max(0, currentLot.quantity + adjustment);
    return productLotService.updateProductLot(id, { quantity: newQuantity });
  },

  // Transferir lote a otro warehouse
  transferProductLotToWarehouse: async (
    id: string,
    warehouseId: number
  ): Promise<ProductLot> => {
    return productLotService.updateProductLot(id, {
      currentWarehouseId: warehouseId,
    });
  },

  // Crear múltiples lotes
  createMultipleProductLots: async (
    productLotsData: CreateProductLotData[]
  ): Promise<ProductLot[]> => {
    const createdLots: ProductLot[] = [];

    for (const lotData of productLotsData) {
      try {
        const createdLot = await productLotService.createProductLot(lotData);
        createdLots.push(createdLot);
      } catch (error) {
        console.error(`Error creating product lot:`, error);
        throw error;
      }
    }

    return createdLots;
  },

  // Obtener estadísticas de lotes por producto
  getProductLotStats: async (
    productId: number
  ): Promise<{
    totalLots: number;
    totalQuantity: number;
    expiredLots: number;
    expiringLots: number;
    averageQuantity: number;
    minQuantity: number;
    maxQuantity: number;
  }> => {
    const allLots = await productLotService.getProductLotsByProduct(productId);
    const expiredLots = await productLotService.getExpiredProductLots();
    const expiringLots = await productLotService.getExpiringProductLots();

    const quantities = allLots.map((lot) => lot.quantity);
    const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

    return {
      totalLots: allLots.length,
      totalQuantity,
      expiredLots: expiredLots.filter((lot) => lot.product_id === productId)
        .length,
      expiringLots: expiringLots.filter((lot) => lot.product_id === productId)
        .length,
      averageQuantity: allLots.length > 0 ? totalQuantity / allLots.length : 0,
      minQuantity: quantities.length > 0 ? Math.min(...quantities) : 0,
      maxQuantity: quantities.length > 0 ? Math.max(...quantities) : 0,
    };
  },
};
