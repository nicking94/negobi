import { useState, useEffect } from "react";
import {
  documentItemService,
  DocumentItem,
  CreateDocumentItemData,
  UpdateDocumentItemData,
  GetDocumentItemsParams,
} from "../../services/documentItems/documentItems.service";

// Definir el tipo para los filtros del hook
export interface UseDocumentItemsFilters {
  documentId?: number;
  line_number?: number;
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
  search?: string;
}

export const useDocumentItems = (filters: UseDocumentItemsFilters = {}) => {
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los items con filtros
  const loadDocumentItems = async (
    customFilters?: Partial<UseDocumentItemsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetDocumentItemsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log(
        "🔵 Enviando parámetros para items de documento:",
        combinedFilters
      );

      const itemsData = await documentItemService.getDocumentItems(
        combinedFilters
      );
      console.log("🟢 Datos de items recibidos:", itemsData);

      if (Array.isArray(itemsData)) {
        setDocumentItems(itemsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", itemsData);
        setDocumentItems([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items de documento"
      );
      setDocumentItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear item
  const createDocumentItem = async (
    itemData: CreateDocumentItemData
  ): Promise<DocumentItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await documentItemService.createDocumentItem(itemData);
      setDocumentItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar item
  const updateDocumentItem = async (
    id: string,
    updates: UpdateDocumentItemData
  ): Promise<DocumentItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedItem = await documentItemService.updateDocumentItem(
        id,
        updates
      );
      setDocumentItems((prev) =>
        prev.map((item) => (item.id.toString() === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar item
  const deleteDocumentItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await documentItemService.deleteDocumentItem(id);
      setDocumentItems((prev) =>
        prev.filter((item) => item.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar item");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener item por ID
  const getDocumentItemById = async (
    id: string
  ): Promise<DocumentItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const item = await documentItemService.getDocumentItemById(id);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear múltiples items
  const createMultipleDocumentItems = async (
    itemsData: CreateDocumentItemData[]
  ): Promise<DocumentItem[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdItems =
        await documentItemService.createMultipleDocumentItems(itemsData);
      setDocumentItems((prev) => [...prev, ...createdItems]);
      return createdItems;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear múltiples items"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar items al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadDocumentItems();
  }, [
    filters.documentId,
    filters.line_number,
    filters.product_id,
    filters.quantity,
    filters.unit_price,
    filters.total_amount,
    filters.search,
  ]);

  return {
    documentItems,
    loading,
    error,
    createDocumentItem,
    updateDocumentItem,
    deleteDocumentItem,
    getDocumentItemById,
    createMultipleDocumentItems,
    refetch: loadDocumentItems,
  };
};

// Hook especializado para items de un documento específico
export const useDocumentItemsByDocument = (documentId?: number) => {
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentItemsByDocument = async (id?: number) => {
    const targetDocumentId = id || documentId;
    if (!targetDocumentId) {
      setError("documentId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await documentItemService.getDocumentItemsByDocument(
        targetDocumentId
      );
      setDocumentItems(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items del documento"
      );
      setDocumentItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadDocumentItemsByDocument();
    }
  }, [documentId]);

  return {
    documentItems,
    loading,
    error,
    refetch: loadDocumentItemsByDocument,
  };
};

// Hook especializado para items de un producto específico
export const useDocumentItemsByProduct = (productId?: number) => {
  const [productItems, setProductItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentItemsByProduct = async (id?: number) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await documentItemService.getDocumentItemsByProduct(
        targetProductId
      );
      setProductItems(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar items del producto"
      );
      setProductItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadDocumentItemsByProduct();
    }
  }, [productId]);

  return {
    productItems,
    loading,
    error,
    refetch: loadDocumentItemsByProduct,
  };
};

// Hook para cálculos de totales de documento
export const useDocumentTotals = (documentId?: number) => {
  const [totals, setTotals] = useState<{
    subtotal: number;
    totalTax: number;
    totalDiscount: number;
    grandTotal: number;
    totalItems: number;
  }>({
    subtotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    grandTotal: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    documentItems,
    loading: itemsLoading,
    error: itemsError,
  } = useDocumentItemsByDocument(documentId);

  const calculateTotals = () => {
    if (!documentItems.length) return;

    const subtotal = documentItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const totalTax = documentItems.reduce(
      (sum, item) => sum + item.tax_amount,
      0
    );
    const totalDiscount = documentItems.reduce(
      (sum, item) => sum + item.discount_amount,
      0
    );
    const grandTotal = documentItems.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );
    const totalItems = documentItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    setTotals({
      subtotal,
      totalTax,
      totalDiscount,
      grandTotal,
      totalItems,
    });
  };

  useEffect(() => {
    if (!itemsLoading && !itemsError) {
      calculateTotals();
    }
  }, [documentItems, itemsLoading, itemsError]);

  return {
    totals,
    loading: itemsLoading,
    error: itemsError,
  };
};

// Hook para gestión de líneas de documento (para formularios)
// Hook para gestión de líneas de documento (para formularios)
export const useDocumentLinesManager = (documentId?: number) => {
  // Usar el hook principal que sí incluye las funciones CRUD
  const {
    documentItems,
    loading,
    error,
    refetch,
    createDocumentItem,
    updateDocumentItem,
    deleteDocumentItem,
  } = useDocumentItems({ documentId });

  // Agregar nueva línea
  const addLine = async (
    lineData: Omit<CreateDocumentItemData, "documentId">
  ) => {
    if (!documentId) {
      throw new Error("documentId es requerido");
    }

    const newLineData: CreateDocumentItemData = {
      ...lineData,
      documentId,
    };

    return await createDocumentItem(newLineData);
  };

  // Actualizar línea
  const updateLine = async (
    lineId: string,
    updates: UpdateDocumentItemData
  ) => {
    return await updateDocumentItem(lineId, updates);
  };

  // Eliminar línea
  const removeLine = async (lineId: string) => {
    return await deleteDocumentItem(lineId);
  };

  // Reordenar líneas (actualizar números de línea)
  const reorderLines = async (
    newOrder: { id: string; line_number: number }[]
  ) => {
    const updatePromises = newOrder.map((item) =>
      updateDocumentItem(item.id, { line_number: item.line_number })
    );

    try {
      await Promise.all(updatePromises);
      await refetch();
      return true;
    } catch (error) {
      console.error("Error reordenando líneas:", error);
      return false;
    }
  };

  return {
    lines: documentItems,
    loading,
    error,
    addLine,
    updateLine,
    removeLine,
    reorderLines,
    refetch,
  };
};
