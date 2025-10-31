import api from "../../utils/api";
import {
  PostStockByWarehouse,
  GetStockByWarehouse,
  GetStockByWarehouseById,
  PatchStockByWarehouse,
  DeleteStockByWarehouse,
  SyncStockByWarehouse,
} from "../stockByWarehouse/stockByWarehouse.route";

export interface GetStockByWarehouseParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  warehouseId?: number;
  productId?: number;
}

export interface StockByWarehouse {
  id: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  reserve_stock: number;
  incoming_stock: number;
  location_in_warehouse: string;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;
  erp_code_product: string;
  erp_code_warehouse: string;
  warehouseId?: number;
  productId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateStockByWarehouseData {
  warehouseId: number;
  productId: number;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  reserve_stock?: number;
  incoming_stock?: number;
  location_in_warehouse?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  erp_code_product?: string;
  erp_code_warehouse?: string;
}

export interface UpdateStockByWarehouseData {
  warehouseId?: number;
  productId?: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  reserve_stock?: number;
  incoming_stock?: number;
  location_in_warehouse?: string;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  erp_code_product?: string;
  erp_code_warehouse?: string;
}

export interface SyncStockByWarehouseData {
  companyId: number;
  data: Array<{
    warehouseId: number;
    productId: number;
    stock: number;
    min_stock?: number;
    max_stock?: number;
    reserve_stock?: number;
    incoming_stock?: number;
    location_in_warehouse?: string;
    show_in_ecommerce?: boolean;
    show_in_sales_app?: boolean;
    erp_code_product?: string;
    erp_code_warehouse?: string;
  }>;
}

export interface StockByWarehouseResponse {
  success: boolean;
  data: StockByWarehouse;
}

export interface StockByWarehouseListResponse {
  success: boolean;
  data: StockByWarehouse[];
}

export interface PaginatedStockByWarehouseResponse {
  success: boolean;
  data: {
    data: StockByWarehouse[];
    totalPages: number;
    total: number;
  };
}

export interface SyncStockByWarehouseResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface StockAnalysis {
  available_stock: number;
  reserved_stock: number;
  incoming_stock: number;
  total_physical_stock: number;
  stock_level: "LOW" | "NORMAL" | "HIGH" | "OUT_OF_STOCK";
  needs_replenishment: boolean;
  reorder_quantity?: number;
}

export const stockByWarehouseService = {
  createStockByWarehouse: async (
    stockData: CreateStockByWarehouseData
  ): Promise<StockByWarehouse> => {
    const response = await api.post(PostStockByWarehouse, stockData);
    return response.data.data;
  },

  getStockByWarehouse: async (
    params?: GetStockByWarehouseParams
  ): Promise<StockByWarehouse[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.warehouseId) {
      queryParams.append("warehouseId", params.warehouseId.toString());
    }
    if (params?.productId) {
      queryParams.append("productId", params.productId.toString());
    }

    const response = await api.get(`${GetStockByWarehouse}?${queryParams}`);
    return response.data.data;
  },

  getStockByWarehouseById: async (id: string): Promise<StockByWarehouse> => {
    const response = await api.get(`${GetStockByWarehouseById}/${id}`);
    return response.data.data;
  },

  updateStockByWarehouse: async (
    id: string,
    updates: UpdateStockByWarehouseData
  ): Promise<StockByWarehouse> => {
    const response = await api.patch(`${PatchStockByWarehouse}/${id}`, updates);
    return response.data.data;
  },

  deleteStockByWarehouse: async (id: string): Promise<void> => {
    await api.delete(`${DeleteStockByWarehouse}/${id}`);
  },

  syncStockByWarehouse: async (
    syncData: SyncStockByWarehouseData
  ): Promise<SyncStockByWarehouseResponse> => {
    const response = await api.post(SyncStockByWarehouse, syncData);
    return response.data;
  },

  getStockByWarehouseAndProduct: async (
    warehouseId: number,
    productId: number
  ): Promise<StockByWarehouse | null> => {
    try {
      const stocks = await stockByWarehouseService.getStockByWarehouse({
        warehouseId,
        productId,
        itemsPerPage: 1,
      });
      return stocks.length > 0 ? stocks[0] : null;
    } catch (error) {
      console.error("Error getting stock by warehouse and product:", error);
      return null;
    }
  },

  getStockByWarehouseByWarehouseId: async (
    warehouseId: number
  ): Promise<StockByWarehouse[]> => {
    return stockByWarehouseService.getStockByWarehouse({
      warehouseId,
      itemsPerPage: 10,
    });
  },

  getStockByProduct: async (productId: number): Promise<StockByWarehouse[]> => {
    return stockByWarehouseService.getStockByWarehouse({
      productId,
      itemsPerPage: 10,
    });
  },

  updateStockQuantity: async (
    id: string,
    newStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      stock: newStock,
    });
  },

  adjustStockQuantity: async (
    id: string,
    adjustment: number
  ): Promise<StockByWarehouse | null> => {
    try {
      const currentStock =
        await stockByWarehouseService.getStockByWarehouseById(id);
      const newStock = Math.max(0, currentStock.stock + adjustment);
      return stockByWarehouseService.updateStockQuantity(id, newStock);
    } catch (error) {
      console.error("Error adjusting stock quantity:", error);
      return null;
    }
  },

  updateReserveStock: async (
    id: string,
    newReserveStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      reserve_stock: newReserveStock,
    });
  },

  updateIncomingStock: async (
    id: string,
    newIncomingStock: number
  ): Promise<StockByWarehouse> => {
    return stockByWarehouseService.updateStockByWarehouse(id, {
      incoming_stock: newIncomingStock,
    });
  },

  calculateAvailableStock: (stockRecord: StockByWarehouse): number => {
    return Math.max(0, stockRecord.stock - stockRecord.reserve_stock);
  },

  analyzeStockLevel: (stockRecord: StockByWarehouse): StockAnalysis => {
    const availableStock =
      stockByWarehouseService.calculateAvailableStock(stockRecord);
    const totalPhysicalStock = stockRecord.stock;

    let stockLevel: "LOW" | "NORMAL" | "HIGH" | "OUT_OF_STOCK";
    let needsReplenishment = false;
    let reorderQuantity: number | undefined;

    if (availableStock === 0) {
      stockLevel = "OUT_OF_STOCK";
      needsReplenishment = true;
      reorderQuantity =
        stockRecord.max_stock > 0 ? stockRecord.max_stock : undefined;
    } else if (
      stockRecord.min_stock > 0 &&
      availableStock <= stockRecord.min_stock
    ) {
      stockLevel = "LOW";
      needsReplenishment = true;
      reorderQuantity =
        stockRecord.max_stock > 0
          ? stockRecord.max_stock - availableStock
          : undefined;
    } else if (
      stockRecord.max_stock > 0 &&
      availableStock >= stockRecord.max_stock
    ) {
      stockLevel = "HIGH";
      needsReplenishment = false;
    } else {
      stockLevel = "NORMAL";
      needsReplenishment = false;
    }

    return {
      available_stock: availableStock,
      reserved_stock: stockRecord.reserve_stock,
      incoming_stock: stockRecord.incoming_stock,
      total_physical_stock: totalPhysicalStock,
      stock_level: stockLevel,
      needs_replenishment: needsReplenishment,
      reorder_quantity: reorderQuantity,
    };
  },

  hasSufficientStock: (
    stockRecord: StockByWarehouse,
    requiredQuantity: number
  ): boolean => {
    const availableStock =
      stockByWarehouseService.calculateAvailableStock(stockRecord);
    return availableStock >= requiredQuantity;
  },

  getLowStockItems: async (
    warehouseId?: number
  ): Promise<StockByWarehouse[]> => {
    try {
      const stocks = warehouseId
        ? await stockByWarehouseService.getStockByWarehouse({
            warehouseId,
            itemsPerPage: 10,
          })
        : await stockByWarehouseService.getStockByWarehouse({
            itemsPerPage: 10,
          });

      return stocks.filter((stock) => {
        const analysis = stockByWarehouseService.analyzeStockLevel(stock);
        return analysis.needs_replenishment;
      });
    } catch (error) {
      console.error("Error getting low stock items:", error);
      return [];
    }
  },

  getOutOfStockItems: async (
    warehouseId?: number
  ): Promise<StockByWarehouse[]> => {
    try {
      const stocks = warehouseId
        ? await stockByWarehouseService.getStockByWarehouse({
            warehouseId,
            itemsPerPage: 10,
          })
        : await stockByWarehouseService.getStockByWarehouse({
            itemsPerPage: 10,
          });

      return stocks.filter((stock) => {
        const analysis = stockByWarehouseService.analyzeStockLevel(stock);
        return analysis.stock_level === "OUT_OF_STOCK";
      });
    } catch (error) {
      console.error("Error getting out of stock items:", error);
      return [];
    }
  },

  transferStock: async (
    fromStockId: string,
    toStockId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      const fromResult = await stockByWarehouseService.adjustStockQuantity(
        fromStockId,
        -quantity
      );
      if (!fromResult) {
        throw new Error("Error al restar del stock origen");
      }

      const toResult = await stockByWarehouseService.adjustStockQuantity(
        toStockId,
        quantity
      );
      if (!toResult) {
        await stockByWarehouseService.adjustStockQuantity(
          fromStockId,
          quantity
        );
        throw new Error("Error al sumar al stock destino");
      }

      return true;
    } catch (error) {
      console.error("Error transferring stock:", error);
      return false;
    }
  },

  getTotalStockByProduct: async (productId: number): Promise<number> => {
    try {
      const stocks = await stockByWarehouseService.getStockByProduct(productId);
      return stocks.reduce((total, stock) => total + stock.stock, 0);
    } catch (error) {
      console.error("Error getting total stock by product:", error);
      return 0;
    }
  },

  getTotalAvailableStockByProduct: async (
    productId: number
  ): Promise<number> => {
    try {
      const stocks = await stockByWarehouseService.getStockByProduct(productId);
      return stocks.reduce((total, stock) => {
        return total + stockByWarehouseService.calculateAvailableStock(stock);
      }, 0);
    } catch (error) {
      console.error("Error getting total available stock by product:", error);
      return 0;
    }
  },
};
