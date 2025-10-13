import { useState, useEffect } from "react";
import {
  orderService,
  Order,
  CreateOrderData,
  UpdateOrderData,
  GetOrdersParams,
  OrderStatus,
  OrderType,
  OrderItem,
  OrderSummary,
  ORDER_STATUSES,
  ORDER_TYPES,
} from "../../services/orders/orders.service";

// Definir el tipo para los filtros del hook
export interface UseOrdersFilters {
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
  company_id?: number;
}

export const useOrders = (filters: UseOrdersFilters = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (customFilters?: Partial<UseOrdersFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetOrdersParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      // 🔴 REMOVER LA VALIDACIÓN DE company_id YA QUE NO ES REQUERIDA PARA LA LLAMADA
      // if (!combinedFilters.company_id) {
      //   console.warn("⚠️ company_id no está definido, no se pueden cargar pedidos");
      //   setError("Selecciona una compañía para ver los pedidos");
      //   setOrders([]);
      //   return;
      // }

      console.log("🔵 Enviando parámetros para pedidos:", combinedFilters);

      const ordersData = await orderService.getOrders(combinedFilters);
      console.log("🟢 Datos de pedidos recibidos:", ordersData);

      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        console.warn("⚠️ Estructura inesperada:", ordersData);
        setOrders([]);
      }
    } catch (err) {
      console.error("🔴 Error al cargar pedidos:", err);
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear pedido
  const createOrder = async (
    orderData: CreateOrderData
  ): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos
      const validation = orderService.validateOrderData(orderData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      // Verificar si ya existe un pedido con el mismo número
      const exists = await orderService.checkOrderNumberExists(
        orderData.order_number
      );
      if (exists) {
        setError("Ya existe un pedido con este número");
        return null;
      }

      const newOrder = await orderService.createOrder(orderData);
      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear pedido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar pedido
  const updateOrder = async (
    id: string,
    updates: UpdateOrderData
  ): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);

      // Si se actualiza el número de pedido, verificar que no exista
      if (updates.order_number) {
        const existingOrders = await orderService.getOrders({
          itemsPerPage: 10,
        });
        const numberExists = existingOrders.some(
          (order) =>
            order.order_number === updates.order_number &&
            order.id.toString() !== id
        );
        if (numberExists) {
          setError("Ya existe un pedido con este número");
          return null;
        }
      }

      const updatedOrder = await orderService.updateOrder(id, updates);
      setOrders((prev) =>
        prev.map((order) => (order.id.toString() === id ? updatedOrder : order))
      );
      return updatedOrder;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar pedido"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pedido
  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await orderService.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.id.toString() !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar pedido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pedido por ID
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener pedido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de pedido
  const updateOrderStatus = async (
    id: string,
    status: OrderStatus
  ): Promise<Order | null> => {
    try {
      return await updateOrder(id, { status });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del pedido"
      );
      return null;
    }
  };

  // Marcar pedido como completado
  const markOrderAsCompleted = async (id: string): Promise<Order | null> => {
    return await updateOrderStatus(id, ORDER_STATUSES.COMPLETED);
  };

  // Marcar pedido como cancelado
  const markOrderAsCancelled = async (id: string): Promise<Order | null> => {
    return await updateOrderStatus(id, ORDER_STATUSES.CANCELLED);
  };

  // Marcar pedido como procesado
  const markOrderAsProcessed = async (id: string): Promise<Order | null> => {
    return await updateOrderStatus(id, ORDER_STATUSES.PROCESSED);
  };

  // Validar datos del pedido
  const validateOrderData = (
    orderData: CreateOrderData
  ): { isValid: boolean; errors: string[] } => {
    return orderService.validateOrderData(orderData);
  };

  // Calcular totales del pedido
  const calculateOrderTotals = (
    items: OrderItem[]
  ): {
    taxable_amount: number;
    exempt_amount: number;
    tax_amount: number;
    total_amount: number;
  } => {
    return orderService.calculateOrderTotals(items);
  };

  // Generar número de pedido automático
  const generateOrderNumber = (prefix?: string): string => {
    return orderService.generateOrderNumber(prefix);
  };

  // Verificar si existe un número de pedido
  const checkOrderNumberExists = async (
    orderNumber: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await orderService.checkOrderNumberExists(orderNumber);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar número de pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular comisión de vendedor
  const calculateSalespersonCommission = (
    order: Order,
    commissionRate?: number
  ): number => {
    return orderService.calculateSalespersonCommission(order, commissionRate);
  };

  // Crear múltiples pedidos
  const createMultipleOrders = async (
    ordersData: CreateOrderData[]
  ): Promise<Order[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todos los pedidos primero
      for (const orderData of ordersData) {
        const validation = orderService.validateOrderData(orderData);
        if (!validation.isValid) {
          setError(
            `Error en pedido ${
              orderData.order_number
            }: ${validation.errors.join(", ")}`
          );
          return null;
        }
      }

      const createdOrders = await orderService.createMultipleOrders(ordersData);
      setOrders((prev) => [...prev, ...createdOrders]);
      return createdOrders;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear múltiples pedidos"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadOrders();
  }, [
    filters.order_number,
    filters.client_id,
    filters.salesperson_id,
    filters.warehouse_id,
    filters.status,
    filters.order_type,
    filters.order_date_from,
    filters.order_date_to,
    filters.total_amount_from,
    filters.total_amount_to,
  ]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    updateOrderStatus,
    markOrderAsCompleted,
    markOrderAsCancelled,
    markOrderAsProcessed,
    validateOrderData,
    calculateOrderTotals,
    generateOrderNumber,
    checkOrderNumberExists,
    calculateSalespersonCommission,
    createMultipleOrders,
    refetch: loadOrders,
  };
};

// Hook especializado para pedidos por estado
export const useOrdersByStatus = (status?: OrderStatus) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrdersByStatus = async (orderStatus?: OrderStatus) => {
    const targetStatus = orderStatus || status;
    if (!targetStatus) {
      setError("Estado de pedido es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const statusOrders = await orderService.getOrdersByStatus(targetStatus);
      setOrders(statusOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar pedidos por estado"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      loadOrdersByStatus();
    }
  }, [status]);

  return {
    orders,
    loading,
    error,
    refetch: loadOrdersByStatus,
  };
};

// Hook especializado para pedidos por tipo
export const useOrdersByType = (orderType?: OrderType) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrdersByType = async (type?: OrderType) => {
    const targetType = type || orderType;
    if (!targetType) {
      setError("Tipo de pedido es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const typeOrders = await orderService.getOrdersByType(targetType);
      setOrders(typeOrders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar pedidos por tipo"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderType) {
      loadOrdersByType();
    }
  }, [orderType]);

  return {
    orders,
    loading,
    error,
    refetch: loadOrdersByType,
  };
};

// Hook especializado para pedidos por cliente
export const useOrdersByClient = (clientId?: number) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrdersByClient = async (id?: number) => {
    const targetClientId = id || clientId;
    if (!targetClientId) {
      setError("clientId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const clientOrders = await orderService.getOrdersByClient(targetClientId);
      setOrders(clientOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar pedidos del cliente"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadOrdersByClient();
    }
  }, [clientId]);

  return {
    orders,
    loading,
    error,
    refetch: loadOrdersByClient,
  };
};

// Hook especializado para pedidos por vendedor
export const useOrdersBySalesperson = (salespersonId?: number) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrdersBySalesperson = async (id?: number) => {
    const targetSalespersonId = id || salespersonId;
    if (!targetSalespersonId) {
      setError("salespersonId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const salespersonOrders = await orderService.getOrdersBySalesperson(
        targetSalespersonId
      );
      setOrders(salespersonOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar pedidos del vendedor"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salespersonId) {
      loadOrdersBySalesperson();
    }
  }, [salespersonId]);

  return {
    orders,
    loading,
    error,
    refetch: loadOrdersBySalesperson,
  };
};

// Hook para pedidos de hoy
export const useTodayOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const todayOrders = await orderService.getTodayOrders();
      setOrders(todayOrders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar pedidos de hoy"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: loadTodayOrders,
  };
};

// Hook para pedidos recientes
export const useRecentOrders = (limit: number = 10) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecentOrders = async (newLimit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const recentOrders = await orderService.getRecentOrders(
        newLimit || limit
      );
      setOrders(recentOrders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar pedidos recientes"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentOrders();
  }, [limit]);

  return {
    orders,
    loading,
    error,
    refetch: loadRecentOrders,
  };
};

// Hook para resumen de pedidos
export const useOrdersSummary = () => {
  const [summary, setSummary] = useState<OrderSummary>({
    total_orders: 0,
    total_amount: 0,
    average_order_value: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderSummary = await orderService.getOrdersSummary();
      setSummary(orderSummary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar resumen de pedidos"
      );
      setSummary({
        total_orders: 0,
        total_amount: 0,
        average_order_value: 0,
        pending_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: loadSummary,
  };
};

// Hook para estadísticas de pedidos por período
export const useOrdersStatisticsByPeriod = (
  startDate: string,
  endDate: string
) => {
  const [statistics, setStatistics] = useState<{
    period: string;
    total_orders: number;
    total_amount: number;
    average_order_value: number;
    orders_by_status: Record<OrderStatus, number>;
    orders_by_type: Record<OrderType, number>;
  }>({
    period: `${startDate} to ${endDate}`,
    total_orders: 0,
    total_amount: 0,
    average_order_value: 0,
    orders_by_status: {} as Record<OrderStatus, number>,
    orders_by_type: {} as Record<OrderType, number>,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async (newStartDate?: string, newEndDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const stats = await orderService.getOrdersStatisticsByPeriod(
        newStartDate || startDate,
        newEndDate || endDate
      );
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de pedidos"
      );
      setStatistics({
        period: `${startDate} to ${endDate}`,
        total_orders: 0,
        total_amount: 0,
        average_order_value: 0,
        orders_by_status: {} as Record<OrderStatus, number>,
        orders_by_type: {} as Record<OrderType, number>,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [startDate, endDate]);

  return {
    statistics,
    loading,
    error,
    refetch: loadStatistics,
  };
};

// Hook para búsqueda de pedidos
export const useOrderSearch = () => {
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOrdersByNumber = async (orderNumber: string) => {
    if (!orderNumber.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await orderService.searchOrdersByNumber(orderNumber);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar pedidos por número"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchOrdersByAmountRange = async (
    minAmount: number,
    maxAmount: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const results = await orderService.getOrdersByAmountRange(
        minAmount,
        maxAmount
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar pedidos por rango de monto"
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
    searchOrdersByNumber,
    searchOrdersByAmountRange,
    clearSearch,
  };
};

// Hook para gestión de estado de pedidos
export const useOrderStatusManagement = () => {
  const {
    orders,
    loading,
    error,
    refetch,
    markOrderAsCompleted,
    markOrderAsCancelled,
    markOrderAsProcessed,
  } = useOrders();

  // Completar múltiples pedidos
  const completeMultipleOrders = async (
    orderIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        orderIds.map((id) => markOrderAsCompleted(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error completing multiple orders:", err);
      return false;
    }
  };

  // Cancelar múltiples pedidos
  const cancelMultipleOrders = async (orderIds: string[]): Promise<boolean> => {
    try {
      const results = await Promise.all(
        orderIds.map((id) => markOrderAsCancelled(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error cancelling multiple orders:", err);
      return false;
    }
  };

  // Procesar múltiples pedidos
  const processMultipleOrders = async (
    orderIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        orderIds.map((id) => markOrderAsProcessed(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error processing multiple orders:", err);
      return false;
    }
  };

  // Obtener pedidos pendientes
  const getPendingOrders = (): Order[] => {
    return orders.filter((order) => order.status === ORDER_STATUSES.PENDING);
  };

  // Obtener pedidos completados
  const getCompletedOrders = (): Order[] => {
    return orders.filter((order) => order.status === ORDER_STATUSES.COMPLETED);
  };

  // Obtener pedidos cancelados
  const getCancelledOrders = (): Order[] => {
    return orders.filter((order) => order.status === ORDER_STATUSES.CANCELLED);
  };

  return {
    orders,
    loading,
    error,
    markOrderAsCompleted,
    markOrderAsCancelled,
    markOrderAsProcessed,
    completeMultipleOrders,
    cancelMultipleOrders,
    processMultipleOrders,
    getPendingOrders,
    getCompletedOrders,
    getCancelledOrders,
    refetch,
  };
};

// Hook para cálculos de comisiones
export const useOrderCommissions = (salespersonId?: number) => {
  const { orders, loading, error } = useOrdersBySalesperson(salespersonId);

  const commissions = orders.map((order) => ({
    order,
    commission: orderService.calculateSalespersonCommission(order),
  }));

  const totalCommission = commissions.reduce(
    (sum, item) => sum + item.commission,
    0
  );
  const averageCommission =
    orders.length > 0 ? totalCommission / orders.length : 0;

  return {
    commissions,
    totalCommission: parseFloat(totalCommission.toFixed(2)),
    averageCommission: parseFloat(averageCommission.toFixed(2)),
    orders,
    loading,
    error,
  };
};

// Hook para análisis de ventas
export const useSalesAnalysis = () => {
  const { orders, loading, error } = useOrders();

  const analysis = {
    // Totales generales
    totalSales: orders.filter((order) => order.order_type === ORDER_TYPES.SALES)
      .length,
    totalPurchases: orders.filter(
      (order) => order.order_type === ORDER_TYPES.PURCHASE
    ).length,

    // Montos totales
    totalSalesAmount: orders
      .filter((order) => order.order_type === ORDER_TYPES.SALES)
      .reduce((sum, order) => sum + order.total_amount, 0),

    totalPurchaseAmount: orders
      .filter((order) => order.order_type === ORDER_TYPES.PURCHASE)
      .reduce((sum, order) => sum + order.total_amount, 0),

    // Por estado
    ordersByStatus: orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>),

    // Por tipo
    ordersByType: orders.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + 1;
      return acc;
    }, {} as Record<OrderType, number>),

    // Pedidos del mes actual
    currentMonthOrders: orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }).length,

    // Pedidos de la semana actual
    currentWeekOrders: orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      return orderDate >= startOfWeek && orderDate <= endOfWeek;
    }).length,
  };

  return {
    analysis,
    orders,
    loading,
    error,
  };
};

// Hook para gestión de items de pedido
export const useOrderItems = (orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrderWithItems = async (id?: string) => {
    const targetOrderId = id || orderId;
    if (!targetOrderId) {
      setError("orderId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderData = await orderService.getOrderById(targetOrderId);
      setOrder(orderData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar items del pedido"
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = async (item: OrderItem): Promise<boolean> => {
    if (!order) return false;

    try {
      setLoading(true);
      setError(null);

      const updatedItems = [...(order.items || []), item];
      const totals = orderService.calculateOrderTotals(updatedItems);

      const updatedOrder = await orderService.updateOrder(order.id.toString(), {
        items: updatedItems,
        ...totals,
      });

      setOrder(updatedOrder);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al agregar item al pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromOrder = async (itemIndex: number): Promise<boolean> => {
    if (!order || !order.items) return false;

    try {
      setLoading(true);
      setError(null);

      const updatedItems = order.items.filter(
        (_, index) => index !== itemIndex
      );
      const totals = orderService.calculateOrderTotals(updatedItems);

      const updatedOrder = await orderService.updateOrder(order.id.toString(), {
        items: updatedItems,
        ...totals,
      });

      setOrder(updatedOrder);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar item del pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItemInOrder = async (
    itemIndex: number,
    updatedItem: OrderItem
  ): Promise<boolean> => {
    if (!order || !order.items) return false;

    try {
      setLoading(true);
      setError(null);

      const updatedItems = order.items.map((item, index) =>
        index === itemIndex ? updatedItem : item
      );
      const totals = orderService.calculateOrderTotals(updatedItems);

      const updatedOrder = await orderService.updateOrder(order.id.toString(), {
        items: updatedItems,
        ...totals,
      });

      setOrder(updatedOrder);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar item del pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderWithItems();
    }
  }, [orderId]);

  return {
    order,
    items: order?.items || [],
    loading,
    error,
    addItemToOrder,
    removeItemFromOrder,
    updateItemInOrder,
    refetch: loadOrderWithItems,
  };
};

// Hook para validación de pedidos en tiempo real
export const useOrderValidation = () => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    totals?: {
      taxable_amount: number;
      exempt_amount: number;
      tax_amount: number;
      total_amount: number;
    };
  }>({
    isValid: false,
    errors: [],
  });

  const validateOrder = (orderData: CreateOrderData) => {
    const validation = orderService.validateOrderData(orderData);
    const totals = orderService.calculateOrderTotals(orderData.items);

    setValidationResult({
      ...validation,
      totals,
    });

    return validation;
  };

  const validateItems = (items: OrderItem[]) => {
    const totals = orderService.calculateOrderTotals(items);
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push("El pedido debe contener al menos un item");
    }

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
      }
      if (item.unit_price < 0) {
        errors.push(
          `Item ${index + 1}: El precio unitario no puede ser negativo`
        );
      }
      if (item.total_amount < 0) {
        errors.push(`Item ${index + 1}: El monto total no puede ser negativo`);
      }
    });

    const isValid = errors.length === 0;

    setValidationResult({
      isValid,
      errors,
      totals,
    });

    return { isValid, errors, totals };
  };

  const clearValidation = () => {
    setValidationResult({
      isValid: false,
      errors: [],
    });
  };

  return {
    validationResult,
    validateOrder,
    validateItems,
    clearValidation,
  };
};
