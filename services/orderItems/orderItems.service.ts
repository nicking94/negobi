import api from "../../utils/api";
import {
  PostOrderItem,
  GetOrderItems,
  GetOrderItemById,
  PatchOrderItem,
  DeleteOrderItem,
  PostSyncOrderItems,
} from "./orderItems.route";

// Parámetros para obtener items de pedido
export interface GetOrderItemsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  order_id?: number;
  product_id?: number;
  warehouse_id?: number;
  line_number?: number;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
}

// Interfaz principal del item de pedido
export interface OrderItem {
  // Campos principales
  id: number;
  order_id: number;
  product_id: number;
  warehouse_id: number;
  line_number: number;
  price_type: string;
  is_unit: boolean;
  emission_date: string;
  outline: number;
  sign: number;
  is_exempt: boolean;
  unit_cost: number;
  tare: number;
  conversion_factor: number;
  price_before_discount: number;
  unit_price: number;
  quantity: number;
  major_quantity: number;
  tax_amount: number;
  tax_before_discount: number;
  total_amount: number;
  description: string;
  external_item_code: string;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Datos para crear un item de pedido
export interface CreateOrderItemData {
  order_id: number;
  product_id: number;
  warehouse_id: number;
  price_type: string;
  is_unit: boolean;
  outline: number;
  sign: number;
  is_exempt: boolean;
  unit_cost: number;
  tare: number;
  conversion_factor: number;
  price_before_discount: number;
  unit_price: number;
  quantity: number;
  major_quantity: number;
  tax_amount: number;
  tax_before_discount: number;
  total_amount: number;
  description: string;
  external_item_code: string;
}

// Datos para actualizar un item de pedido
export interface UpdateOrderItemData {
  order_id?: number;
  product_id?: number;
  warehouse_id?: number;
  price_type?: string;
  is_unit?: boolean;
  outline?: number;
  sign?: number;
  is_exempt?: boolean;
  unit_cost?: number;
  tare?: number;
  conversion_factor?: number;
  price_before_discount?: number;
  unit_price?: number;
  quantity?: number;
  major_quantity?: number;
  tax_amount?: number;
  tax_before_discount?: number;
  total_amount?: number;
  description?: string;
  external_item_code?: string;
}

// Datos para sincronización desde ERP
export interface SyncOrderItemsData {
  companyId: number;
  data: Array<{
    order_id: number;
    product_id: number;
    warehouse_id: number;
    price_type: string;
    is_unit: boolean;
    outline: number;
    sign: number;
    is_exempt: boolean;
    unit_cost: number;
    tare: number;
    conversion_factor: number;
    price_before_discount: number;
    unit_price: number;
    quantity: number;
    major_quantity: number;
    tax_amount: number;
    tax_before_discount: number;
    total_amount: number;
    description: string;
    external_item_code: string;
  }>;
}

// Interfaces de respuesta
export interface OrderItemResponse {
  success: boolean;
  data: OrderItem;
}

export interface OrderItemsListResponse {
  success: boolean;
  data: OrderItem[];
}

export interface SyncOrderItemsResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// Constantes para valores predefinidos
export const PRICE_TYPES = {
  STANDARD: "standard",
  PROMOTIONAL: "promotional",
  WHOLESALE: "wholesale",
  SPECIAL: "special",
} as const;

export const SIGN_TYPES = {
  POSITIVE: 1,
  NEGATIVE: -1,
} as const;

export type PriceType = (typeof PRICE_TYPES)[keyof typeof PRICE_TYPES];
export type SignType = (typeof SIGN_TYPES)[keyof typeof SIGN_TYPES];

export const orderItemService = {
  // Crear un nuevo item de pedido
  createOrderItem: async (
    orderItemData: CreateOrderItemData
  ): Promise<OrderItem> => {
    const response = await api.post<OrderItemResponse>(
      PostOrderItem,
      orderItemData
    );
    return response.data.data;
  },

  // Obtener todos los items de pedido
  getOrderItems: async (params?: GetOrderItemsParams): Promise<OrderItem[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("order", params?.order || "DESC");

    // Parámetros opcionales de filtro
    if (params?.order_id) {
      queryParams.append("order_id", params.order_id.toString());
    }
    if (params?.product_id) {
      queryParams.append("product_id", params.product_id.toString());
    }
    if (params?.warehouse_id) {
      queryParams.append("warehouse_id", params.warehouse_id.toString());
    }
    if (params?.line_number) {
      queryParams.append("line_number", params.line_number.toString());
    }
    if (params?.quantity) {
      queryParams.append("quantity", params.quantity.toString());
    }
    if (params?.unit_price) {
      queryParams.append("unit_price", params.unit_price.toString());
    }
    if (params?.total_amount) {
      queryParams.append("total_amount", params.total_amount.toString());
    }

    const response = await api.get<OrderItemsListResponse>(
      `${GetOrderItems}?${queryParams}`
    );
    return response.data.data;
  },

  // Obtener un item de pedido por ID
  getOrderItemById: async (id: string): Promise<OrderItem> => {
    const response = await api.get<OrderItemResponse>(
      `${GetOrderItemById}/${id}`
    );
    return response.data.data;
  },

  // Actualizar un item de pedido
  updateOrderItem: async (
    id: string,
    updates: UpdateOrderItemData
  ): Promise<OrderItem> => {
    const response = await api.patch<OrderItemResponse>(
      `${PatchOrderItem}/${id}`,
      updates
    );
    return response.data.data;
  },

  // Eliminar un item de pedido
  deleteOrderItem: async (id: string): Promise<void> => {
    await api.delete(`${DeleteOrderItem}/${id}`);
  },

  // Sincronizar items de pedido desde ERP
  syncOrderItems: async (syncData: SyncOrderItemsData): Promise<void> => {
    await api.post<SyncOrderItemsResponse>(PostSyncOrderItems, syncData);
  },

  // Métodos adicionales útiles
  getOrderItemsByOrder: async (orderId: number): Promise<OrderItem[]> => {
    return orderItemService.getOrderItems({
      order_id: orderId,
      itemsPerPage: 1000,
    });
  },

  getOrderItemsByProduct: async (productId: number): Promise<OrderItem[]> => {
    return orderItemService.getOrderItems({
      product_id: productId,
      itemsPerPage: 1000,
    });
  },

  getOrderItemsByWarehouse: async (
    warehouseId: number
  ): Promise<OrderItem[]> => {
    return orderItemService.getOrderItems({
      warehouse_id: warehouseId,
      itemsPerPage: 1000,
    });
  },

  // Calcular totales de un pedido
  calculateOrderTotals: async (
    orderId: number
  ): Promise<{
    subtotal: number;
    tax_total: number;
    total: number;
    items_count: number;
  }> => {
    const orderItems = await orderItemService.getOrderItemsByOrder(orderId);

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price_before_discount,
      0
    );
    const tax_total = orderItems.reduce(
      (sum, item) => sum + item.tax_amount,
      0
    );
    const total = orderItems.reduce((sum, item) => sum + item.total_amount, 0);
    const items_count = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      subtotal,
      tax_total,
      total,
      items_count,
    };
  },

  // Obtener items con alto valor
  getHighValueItems: async (minAmount: number = 1000): Promise<OrderItem[]> => {
    const allItems = await orderItemService.getOrderItems({
      itemsPerPage: 1000,
    });
    return allItems.filter((item) => item.total_amount >= minAmount);
  },

  // Verificar si un producto ya existe en un pedido
  checkProductInOrder: async (
    orderId: number,
    productId: number
  ): Promise<boolean> => {
    try {
      const orderItems = await orderItemService.getOrderItems({
        order_id: orderId,
        product_id: productId,
        itemsPerPage: 1,
      });
      return orderItems.length > 0;
    } catch (error) {
      console.error("Error checking product in order:", error);
      return false;
    }
  },
};
