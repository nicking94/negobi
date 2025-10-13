import { useState, useEffect } from "react";
import {
  orderItemService,
  OrderItem,
  CreateOrderItemData,
  UpdateOrderItemData,
  GetOrderItemsParams,
  SyncOrderItemsData,
} from "../../services/orderItems/orderItems.service";

// Definir el tipo para los filtros del hook
export interface UseOrderItemsFilters {
  order_id?: number;
  product_id?: number;
  warehouse_id?: number;
  line_number?: number;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
}

export const useOrderItems = (filters: UseOrderItemsFilters = {}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los items de pedido con filtros
  const loadOrderItems = async (
    customFilters?: Partial<UseOrderItemsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetOrderItemsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log(
        "🔵 Enviando parámetros para items de pedido:",
        combinedFilters
      );

      const orderItemsData = await orderItemService.getOrderItems(
        combinedFilters
      );
      console.log("🟢 Datos de items de pedido recibidos:", orderItemsData);

      if (Array.isArray(orderItemsData)) {
        setOrderItems(orderItemsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", orderItemsData);
        setOrderItems([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar items de pedido"
      );
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear item de pedido
  const createOrderItem = async (
    orderItemData: CreateOrderItemData
  ): Promise<OrderItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const newOrderItem = await orderItemService.createOrderItem(
        orderItemData
      );
      setOrderItems((prev) => [...prev, newOrderItem]);
      return newOrderItem;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear item de pedido"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar item de pedido
  const updateOrderItem = async (
    id: string,
    updates: UpdateOrderItemData
  ): Promise<OrderItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrderItem = await orderItemService.updateOrderItem(
        id,
        updates
      );
      setOrderItems((prev) =>
        prev.map((orderItem) =>
          orderItem.id.toString() === id ? updatedOrderItem : orderItem
        )
      );
      return updatedOrderItem;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar item de pedido"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar item de pedido
  const deleteOrderItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await orderItemService.deleteOrderItem(id);
      setOrderItems((prev) =>
        prev.filter((orderItem) => orderItem.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar item de pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener item de pedido por ID
  const getOrderItemById = async (id: string): Promise<OrderItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const orderItem = await orderItemService.getOrderItemById(id);
      return orderItem;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener item de pedido"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar items desde ERP
  const syncOrderItems = async (
    syncData: SyncOrderItemsData
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await orderItemService.syncOrderItems(syncData);
      // Recargar los items después de la sincronización
      await loadOrderItems();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al sincronizar items de pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales de un pedido
  const calculateOrderTotals = async (orderId: number) => {
    try {
      setLoading(true);
      setError(null);
      return await orderItemService.calculateOrderTotals(orderId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al calcular totales"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un producto ya existe en un pedido
  const checkProductInOrder = async (
    orderId: number,
    productId: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await orderItemService.checkProductInOrder(orderId, productId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar producto en pedido"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar items de pedido al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadOrderItems();
  }, [
    filters.order_id,
    filters.product_id,
    filters.warehouse_id,
    filters.line_number,
    filters.quantity,
    filters.unit_price,
    filters.total_amount,
  ]);

  return {
    orderItems,
    loading,
    error,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getOrderItemById,
    syncOrderItems,
    calculateOrderTotals,
    checkProductInOrder,
    refetch: loadOrderItems,
  };
};

// Hook especializado para items de un pedido específico
export const useOrderItemsByOrder = (orderId?: number) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrderItemsByOrder = async (targetOrderId?: number) => {
    const targetIdToUse = targetOrderId || orderId;
    if (!targetIdToUse) {
      setError("ID de pedido es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await orderItemService.getOrderItemsByOrder(targetIdToUse);
      setOrderItems(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar items del pedido"
      );
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderItemsByOrder();
    }
  }, [orderId]);

  return {
    orderItems,
    loading,
    error,
    refetch: loadOrderItemsByOrder,
  };
};

// Hook especializado para items de un producto específico
export const useOrderItemsByProduct = (productId?: number) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrderItemsByProduct = async (targetProductId?: number) => {
    const targetIdToUse = targetProductId || productId;
    if (!targetIdToUse) {
      setError("ID de producto es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await orderItemService.getOrderItemsByProduct(
        targetIdToUse
      );
      setOrderItems(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items del producto"
      );
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadOrderItemsByProduct();
    }
  }, [productId]);

  return {
    orderItems,
    loading,
    error,
    refetch: loadOrderItemsByProduct,
  };
};

// Hook para items de alto valor
export const useHighValueOrderItems = (minAmount: number = 1000) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHighValueItems = async (amount?: number) => {
    try {
      setLoading(true);
      setError(null);
      const targetAmount = amount || minAmount;
      const items = await orderItemService.getHighValueItems(targetAmount);
      setOrderItems(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items de alto valor"
      );
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHighValueItems();
  }, [minAmount]);

  return {
    orderItems,
    loading,
    error,
    refetch: loadHighValueItems,
  };
};

// Hook para cálculo de totales de pedido
export const useOrderTotals = (orderId?: number) => {
  const [totals, setTotals] = useState<{
    subtotal: number;
    tax_total: number;
    total: number;
    items_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotals = async (targetOrderId?: number) => {
    const targetIdToUse = targetOrderId || orderId;
    if (!targetIdToUse) {
      setError("ID de pedido es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const calculatedTotals = await orderItemService.calculateOrderTotals(
        targetIdToUse
      );
      setTotals(calculatedTotals);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al calcular totales"
      );
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      calculateTotals();
    }
  }, [orderId]);

  return {
    totals,
    loading,
    error,
    refetch: calculateTotals,
  };
};
