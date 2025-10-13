import api from "../../utils/api";
import {
  PostOrder,
  GetOrders,
  GetOrderById,
  PatchOrder,
  DeleteOrder,
} from "../orders/orders.route";

// Parámetros para obtener pedidos
export interface GetOrdersParams {
  company_id?: number;
  order_number?: string;
  client_id?: number;
  salesperson_id?: number;
  warehouse_id?: number;
  status?: OrderStatus;
  order_type?: OrderType;
  order_date_from?: string;
  order_date_to?: string;
  total_amount_from?: number;
  total_amount_to?: number;
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
}

// Tipos y constantes
export const ORDER_TYPES = {
  SALES: "sales",
  PURCHASE: "purchase",
} as const;

export const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSED: "processed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];
export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

// Interfaz para items del pedido
export interface OrderItem {
  id?: string;
  order_id?: number;
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
  external_item_code?: string;
}

// Interfaz principal del pedido
export interface Order {
  // Campos principales
  id: number;
  order_type: OrderType;
  order_number: string;
  external_order_code?: string;
  order_date: string;
  transaction_date: string;
  status: OrderStatus;
  station_device?: string;
  is_correlative: boolean;
  sign: boolean;
  reference_amount: number;
  address_1?: string;
  address_2?: string;
  phone?: string;
  taxable_amount: number;
  exempt_amount: number;
  discount: number;
  is_delivery_note: boolean;
  coordinates?: string;
  tax: number;
  amount: number;
  total_amount: number;
  notes?: string;

  // Campos de relación
  company_id?: number;
  client_id?: number;
  salesperson_id?: number;
  warehouse_id?: number;
  operation_type_id?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Items del pedido (opcional en response básico)
  items?: OrderItem[];
}

// Datos para crear un pedido
export interface CreateOrderData {
  order_type: OrderType;
  company_id: number;
  client_id: number;
  salesperson_id: number;
  warehouse_id: number;
  order_number: string;
  external_order_code?: string;
  order_date: string;
  transaction_date: string;
  status: OrderStatus;
  station_device?: string;
  is_correlative: boolean;
  operation_type_id?: number;
  sign: boolean;
  reference_amount: number;
  address_1?: string;
  address_2?: string;
  phone?: string;
  taxable_amount: number;
  exempt_amount: number;
  discount: number;
  is_delivery_note: boolean;
  coordinates?: string;
  tax: number;
  amount: number;
  total_amount: number;
  notes?: string;
  items: OrderItem[];
}

// Datos para actualizar un pedido
export interface UpdateOrderData {
  order_type?: OrderType;
  company_id?: number;
  client_id?: number;
  salesperson_id?: number;
  warehouse_id?: number;
  order_number?: string;
  external_order_code?: string;
  order_date?: string;
  transaction_date?: string;
  status?: OrderStatus;
  station_device?: string;
  is_correlative?: boolean;
  operation_type_id?: number;
  sign?: boolean;
  reference_amount?: number;
  address_1?: string;
  address_2?: string;
  phone?: string;
  taxable_amount?: number;
  exempt_amount?: number;
  discount?: number;
  is_delivery_note?: boolean;
  coordinates?: string;
  tax?: number;
  amount?: number;
  total_amount?: number;
  notes?: string;
  items?: OrderItem[];
}

// Interfaces de respuesta
export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrdersListResponse {
  success: boolean;
  data: Order[];
}

export interface PaginatedOrdersResponse {
  success: boolean;
  data: {
    data: Order[];
    totalPages: number;
    total: number;
  };
}

// Interfaz para pedido con información extendida
export interface OrderWithDetails extends Order {
  client_name?: string;
  salesperson_name?: string;
  warehouse_name?: string;
  company_name?: string;
  operation_type_name?: string;
}

// Interfaz para resumen de pedido
export interface OrderSummary {
  total_orders: number;
  total_amount: number;
  average_order_value: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
}

export const orderService = {
  // Crear un nuevo pedido
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await api.post(PostOrder, orderData);
    return response.data.data;
  },

  getOrders: async (params?: GetOrdersParams): Promise<Order[]> => {
    try {
      const queryParams = new URLSearchParams();

      console.log("🟡 Parámetros recibidos en orderService.getOrders:", params);

      if (params?.order_number) {
        queryParams.append("order_number", params.order_number);
      }
      if (params?.client_id) {
        queryParams.append("client_id", params.client_id.toString());
      }
      if (params?.salesperson_id) {
        queryParams.append("salesperson_id", params.salesperson_id.toString());
      }
      if (params?.warehouse_id) {
        queryParams.append("warehouse_id", params.warehouse_id.toString());
      }
      if (params?.status) {
        queryParams.append("status", params.status);
      }
      if (params?.order_type) {
        queryParams.append("order_type", params.order_type);
      }
      if (params?.order_date_from) {
        queryParams.append("order_date_from", params.order_date_from);
      }
      if (params?.order_date_to) {
        queryParams.append("order_date_to", params.order_date_to);
      }
      if (params?.total_amount_from) {
        queryParams.append(
          "total_amount_from",
          params.total_amount_from.toString()
        );
      }
      if (params?.total_amount_to) {
        queryParams.append(
          "total_amount_to",
          params.total_amount_to.toString()
        );
      }

      // Parámetros de paginación
      queryParams.append("page", params?.page?.toString() || "1");
      queryParams.append(
        "itemsPerPage",
        params?.itemsPerPage?.toString() || "10"
      );
      queryParams.append("order", params?.order || "DESC");

      const url = `${GetOrders}?${queryParams}`;
      console.log("🟡 Realizando request a:", url);

      const response = await api.get(url);
      console.log("🟢 Respuesta recibida:", response.data);

      // Validar respuesta
      if (!response.data) {
        throw new Error("Respuesta vacía del servidor");
      }

      return response.data.data;
    } catch (error) {
      console.error("🔴 Error en orderService.getOrders:", error);
      throw error;
    }
  },

  // Obtener un pedido por ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`${GetOrderById}/${id}`);
    return response.data.data;
  },

  // Actualizar un pedido
  updateOrder: async (id: string, updates: UpdateOrderData): Promise<Order> => {
    const response = await api.patch(`${PatchOrder}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un pedido
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`${DeleteOrder}/${id}`);
  },

  // Métodos adicionales útiles
  getOrdersByStatus: async (status: OrderStatus): Promise<Order[]> => {
    return orderService.getOrders({
      status,
      itemsPerPage: 10,
    });
  },

  getOrdersByType: async (orderType: OrderType): Promise<Order[]> => {
    return orderService.getOrders({
      order_type: orderType,
      itemsPerPage: 10,
    });
  },

  getOrdersByClient: async (clientId: number): Promise<Order[]> => {
    return orderService.getOrders({
      client_id: clientId,
      itemsPerPage: 10,
    });
  },

  getOrdersBySalesperson: async (salespersonId: number): Promise<Order[]> => {
    return orderService.getOrders({
      salesperson_id: salespersonId,
      itemsPerPage: 10,
    });
  },

  getOrdersByWarehouse: async (warehouseId: number): Promise<Order[]> => {
    return orderService.getOrders({
      warehouse_id: warehouseId,
      itemsPerPage: 10,
    });
  },

  getOrdersByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<Order[]> => {
    return orderService.getOrders({
      order_date_from: startDate,
      order_date_to: endDate,
      itemsPerPage: 10,
    });
  },

  getTodayOrders: async (): Promise<Order[]> => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    return orderService.getOrders({
      order_date_from: startOfDay,
      order_date_to: endOfDay,
      itemsPerPage: 10,
    });
  },

  // Cambiar estado de pedido
  updateOrderStatus: async (
    id: string,
    status: OrderStatus
  ): Promise<Order> => {
    return orderService.updateOrder(id, { status });
  },

  // Marcar pedido como completado
  markOrderAsCompleted: async (id: string): Promise<Order> => {
    return orderService.updateOrderStatus(id, ORDER_STATUSES.COMPLETED);
  },

  // Marcar pedido como cancelado
  markOrderAsCancelled: async (id: string): Promise<Order> => {
    return orderService.updateOrderStatus(id, ORDER_STATUSES.CANCELLED);
  },

  // Marcar pedido como procesado
  markOrderAsProcessed: async (id: string): Promise<Order> => {
    return orderService.updateOrderStatus(id, ORDER_STATUSES.PROCESSED);
  },

  // Validar datos del pedido
  validateOrderData: (
    orderData: CreateOrderData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!orderData.order_type) {
      errors.push("El tipo de pedido es requerido");
    }

    if (!orderData.order_number || orderData.order_number.trim().length === 0) {
      errors.push("El número de pedido es requerido");
    }

    if (!orderData.order_date) {
      errors.push("La fecha del pedido es requerida");
    }

    if (!orderData.transaction_date) {
      errors.push("La fecha de transacción es requerida");
    }

    if (!orderData.status) {
      errors.push("El estado del pedido es requerido");
    }

    if (orderData.total_amount < 0) {
      errors.push("El monto total no puede ser negativo");
    }

    if (orderData.taxable_amount < 0) {
      errors.push("El monto gravable no puede ser negativo");
    }

    if (orderData.exempt_amount < 0) {
      errors.push("El monto exento no puede ser negativo");
    }

    if (orderData.discount < 0) {
      errors.push("El descuento no puede ser negativo");
    }

    if (orderData.tax < 0) {
      errors.push("El impuesto no puede ser negativo");
    }

    // Validar items
    if (!orderData.items || orderData.items.length === 0) {
      errors.push("El pedido debe contener al menos un item");
    } else {
      orderData.items.forEach((item, index) => {
        if (item.quantity <= 0) {
          errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (item.unit_price < 0) {
          errors.push(
            `Item ${index + 1}: El precio unitario no puede ser negativo`
          );
        }
        if (item.total_amount < 0) {
          errors.push(
            `Item ${index + 1}: El monto total no puede ser negativo`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Calcular totales del pedido basado en los items
  calculateOrderTotals: (
    items: OrderItem[]
  ): {
    taxable_amount: number;
    exempt_amount: number;
    tax_amount: number;
    total_amount: number;
  } => {
    let taxable_amount = 0;
    let exempt_amount = 0;
    let tax_amount = 0;
    let total_amount = 0;

    items.forEach((item) => {
      if (item.is_exempt) {
        exempt_amount += item.total_amount;
      } else {
        taxable_amount += item.total_amount;
        tax_amount += item.tax_amount;
      }
      total_amount += item.total_amount;
    });

    return {
      taxable_amount: parseFloat(taxable_amount.toFixed(2)),
      exempt_amount: parseFloat(exempt_amount.toFixed(2)),
      tax_amount: parseFloat(tax_amount.toFixed(2)),
      total_amount: parseFloat(total_amount.toFixed(2)),
    };
  },

  // Generar número de pedido automático
  generateOrderNumber: (prefix: string = "ORD"): string => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  },

  // Obtener resumen de pedidos
  getOrdersSummary: async (): Promise<OrderSummary> => {
    try {
      const allOrders = await orderService.getOrders({ itemsPerPage: 10 });

      const total_amount = allOrders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );
      const pending_orders = allOrders.filter(
        (order) => order.status === ORDER_STATUSES.PENDING
      ).length;
      const completed_orders = allOrders.filter(
        (order) => order.status === ORDER_STATUSES.COMPLETED
      ).length;
      const cancelled_orders = allOrders.filter(
        (order) => order.status === ORDER_STATUSES.CANCELLED
      ).length;

      return {
        total_orders: allOrders.length,
        total_amount: parseFloat(total_amount.toFixed(2)),
        average_order_value:
          allOrders.length > 0
            ? parseFloat((total_amount / allOrders.length).toFixed(2))
            : 0,
        pending_orders,
        completed_orders,
        cancelled_orders,
      };
    } catch (error) {
      console.error("Error getting orders summary:", error);
      return {
        total_orders: 0,
        total_amount: 0,
        average_order_value: 0,
        pending_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
      };
    }
  },

  // Obtener pedidos por rango de monto
  getOrdersByAmountRange: async (
    minAmount: number,
    maxAmount: number
  ): Promise<Order[]> => {
    return orderService.getOrders({
      total_amount_from: minAmount,
      total_amount_to: maxAmount,
      itemsPerPage: 10,
    });
  },

  // Buscar pedidos por número de pedido
  searchOrdersByNumber: async (orderNumber: string): Promise<Order[]> => {
    return orderService.getOrders({
      order_number: orderNumber,
      itemsPerPage: 10,
    });
  },

  // Obtener pedidos recientes
  getRecentOrders: async (limit: number = 10): Promise<Order[]> => {
    const orders = await orderService.getOrders({
      itemsPerPage: limit,
      order: "DESC",
    });
    return orders;
  },

  // Verificar si existe un número de pedido
  checkOrderNumberExists: async (orderNumber: string): Promise<boolean> => {
    try {
      const orders = await orderService.getOrders({
        order_number: orderNumber,
        itemsPerPage: 1,
      });
      return orders.length > 0;
    } catch (error) {
      console.error("Error checking order number existence:", error);
      return false;
    }
  },

  // Obtener estadísticas de pedidos por período
  getOrdersStatisticsByPeriod: async (
    startDate: string,
    endDate: string
  ): Promise<{
    period: string;
    total_orders: number;
    total_amount: number;
    average_order_value: number;
    orders_by_status: Record<OrderStatus, number>;
    orders_by_type: Record<OrderType, number>;
  }> => {
    try {
      const orders = await orderService.getOrdersByDateRange(
        startDate,
        endDate
      );

      const total_amount = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );

      const orders_by_status = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<OrderStatus, number>);

      const orders_by_type = orders.reduce((acc, order) => {
        acc[order.order_type] = (acc[order.order_type] || 0) + 1;
        return acc;
      }, {} as Record<OrderType, number>);

      return {
        period: `${startDate} to ${endDate}`,
        total_orders: orders.length,
        total_amount: parseFloat(total_amount.toFixed(2)),
        average_order_value:
          orders.length > 0
            ? parseFloat((total_amount / orders.length).toFixed(2))
            : 0,
        orders_by_status,
        orders_by_type,
      };
    } catch (error) {
      console.error("Error getting orders statistics by period:", error);
      return {
        period: `${startDate} to ${endDate}`,
        total_orders: 0,
        total_amount: 0,
        average_order_value: 0,
        orders_by_status: {} as Record<OrderStatus, number>,
        orders_by_type: {} as Record<OrderType, number>,
      };
    }
  },

  // Crear múltiples pedidos
  createMultipleOrders: async (
    ordersData: CreateOrderData[]
  ): Promise<Order[]> => {
    const createdOrders: Order[] = [];

    for (const orderData of ordersData) {
      try {
        const createdOrder = await orderService.createOrder(orderData);
        createdOrders.push(createdOrder);
      } catch (error) {
        console.error(`Error creating order ${orderData.order_number}:`, error);
        throw error;
      }
    }

    return createdOrders;
  },

  // Calcular comisión de vendedor (método simulado)
  calculateSalespersonCommission: (
    order: Order,
    commissionRate: number = 0.1
  ): number => {
    return parseFloat((order.total_amount * commissionRate).toFixed(2));
  },
};
