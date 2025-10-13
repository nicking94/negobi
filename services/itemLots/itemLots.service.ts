import api from "../../utils/api";
import {
  PostItemLot,
  GetItemLots,
  PatchItemLot,
  DeleteItemLot,
} from "../itemLots/itemLots.route";

export interface GetItemLotsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  itemId?: number;
  productLotId?: number;
  quantity?: number;
}

export interface ItemLot {
  // Campos del response (GET)
  id: number;
  quantity: number;

  // Campos de relación
  itemId?: number;
  productLotId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateItemLotData {
  // Campos requeridos para crear un lote de item
  itemId: number;
  productLotId: number;
  quantity: number;
}

export interface UpdateItemLotData {
  // Todos los campos son opcionales para actualización
  itemId?: number;
  productLotId?: number;
  quantity?: number;
}

// Response interfaces
export interface ItemLotResponse {
  success: boolean;
  data: ItemLot;
}

export interface ItemLotsListResponse {
  success: boolean;
  data: ItemLot[];
}

export interface PaginatedItemLotsResponse {
  success: boolean;
  data: {
    data: ItemLot[];
    totalPages: number;
    total: number;
  };
}

export const itemLotService = {
  // Crear un nuevo lote de item
  createItemLot: async (itemLotData: CreateItemLotData): Promise<ItemLot> => {
    const response = await api.post(PostItemLot, itemLotData);
    return response.data.data;
  },

  // Obtener todos los lotes de items
  getItemLots: async (params?: GetItemLotsParams): Promise<ItemLot[]> => {
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
    if (params?.itemId) {
      queryParams.append("itemId", params.itemId.toString());
    }
    if (params?.productLotId) {
      queryParams.append("productLotId", params.productLotId.toString());
    }
    if (params?.quantity) {
      queryParams.append("quantity", params.quantity.toString());
    }

    const response = await api.get(`${GetItemLots}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar un lote de item
  updateItemLot: async (
    id: string,
    updates: UpdateItemLotData
  ): Promise<ItemLot> => {
    const response = await api.patch(`${PatchItemLot}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un lote de item
  deleteItemLot: async (id: string): Promise<void> => {
    await api.delete(`${DeleteItemLot}/${id}`);
  },

  // Obtener un lote de item por ID
  getItemLotById: async (id: string): Promise<ItemLot> => {
    const response = await api.get(`${GetItemLots}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getItemLotsByItem: async (itemId: number): Promise<ItemLot[]> => {
    return itemLotService.getItemLots({
      itemId,
      itemsPerPage: 1000,
    });
  },

  getItemLotsByProductLot: async (productLotId: number): Promise<ItemLot[]> => {
    return itemLotService.getItemLots({
      productLotId,
      itemsPerPage: 1000,
    });
  },

  getItemLotByItemAndProductLot: async (
    itemId: number,
    productLotId: number
  ): Promise<ItemLot | null> => {
    try {
      const itemLots = await itemLotService.getItemLots({
        itemId,
        productLotId,
        itemsPerPage: 1,
      });
      return itemLots.length > 0 ? itemLots[0] : null;
    } catch (error) {
      console.error("Error fetching item lot by item and product lot:", error);
      return null;
    }
  },

  // Calcular cantidad total por item
  getTotalQuantityByItem: async (itemId: number): Promise<number> => {
    try {
      const itemLots = await itemLotService.getItemLotsByItem(itemId);
      return itemLots.reduce((total, itemLot) => total + itemLot.quantity, 0);
    } catch (error) {
      console.error("Error calculating total quantity by item:", error);
      return 0;
    }
  },

  // Calcular cantidad total por lote de producto
  getTotalQuantityByProductLot: async (
    productLotId: number
  ): Promise<number> => {
    try {
      const itemLots = await itemLotService.getItemLotsByProductLot(
        productLotId
      );
      return itemLots.reduce((total, itemLot) => total + itemLot.quantity, 0);
    } catch (error) {
      console.error("Error calculating total quantity by product lot:", error);
      return 0;
    }
  },

  // Crear múltiples lotes de items
  createMultipleItemLots: async (
    itemLotsData: CreateItemLotData[]
  ): Promise<ItemLot[]> => {
    const createdItemLots: ItemLot[] = [];

    for (const itemLotData of itemLotsData) {
      try {
        const createdItemLot = await itemLotService.createItemLot(itemLotData);
        createdItemLots.push(createdItemLot);
      } catch (error) {
        console.error(`Error creating item lot:`, error);
        throw error;
      }
    }

    return createdItemLots;
  },

  // Actualizar cantidad de lote
  updateItemLotQuantity: async (
    id: string,
    newQuantity: number
  ): Promise<ItemLot> => {
    return itemLotService.updateItemLot(id, { quantity: newQuantity });
  },

  // Ajustar cantidad de lote (sumar o restar)
  adjustItemLotQuantity: async (
    id: string,
    adjustment: number
  ): Promise<ItemLot | null> => {
    try {
      const currentItemLot = await itemLotService.getItemLotById(id);
      const newQuantity = Math.max(0, currentItemLot.quantity + adjustment);
      return itemLotService.updateItemLot(id, { quantity: newQuantity });
    } catch (error) {
      console.error("Error adjusting item lot quantity:", error);
      return null;
    }
  },
};
