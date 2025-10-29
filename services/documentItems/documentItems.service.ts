import api from "../../utils/api";
import {
  PostDocumentItem,
  GetDocumentItems,
  PatchDocumentItem,
  DeleteDocumentItem,
} from "../documentItems/documentItems.route";

// Importar tipos de documentos si es necesario
import { Document } from "../documents/documents.service";

export interface GetDocumentItemsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  documentId?: number;
  line_number?: number;
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
}

export interface DocumentItem {
  // Campos del response (GET)
  id: number;
  line_number: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  source_document_number: string;
  warehouse_code: string;
  server_code: string;
  description: string;
  price_before_discount: number;
  is_exempt: boolean;
  is_weighted: boolean;
  source_document_line_number: number;
  tax_before_discount: number;
  price_type: string;
  delivered_quantity: number;
  is_delivery_complete: boolean;
  total_weight: number;
  price_second_currency: number;
  cost_second_currency: number;
  manages_serial: boolean;
  is_composite: boolean;
  manages_lots: boolean;
  is_package_quantity: boolean;
  product_external_code: string;
  warehouse_external_code: string;
  server_external_code: string;

  // Campos de relación
  documentId?: number;
  document?: Document; // Documento relacionado según el swagger

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateDocumentItemData {
  // Campos requeridos para crear un item
  documentId: number;
  line_number: number;
  product_id: number;
  quantity: number;
  unit_price: number;

  // Campos opcionales para creación
  unit_cost?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  source_document_number?: string;
  warehouse_code?: string;
  server_code?: string;
  description?: string;
  external_code?: string;
  price_before_discount?: number;
  is_exempt?: boolean;
  is_weighted?: boolean;
  source_document_line_number?: number;
  tax_before_discount?: number;
  price_type?: string;
  delivered_quantity?: number;
  is_delivery_complete?: boolean;
  total_weight?: number;
  price_second_currency?: number;
  cost_second_currency?: number;
  manages_serial?: boolean;
  is_composite?: boolean;
  manages_lots?: boolean;
  is_package_quantity?: boolean;
  product_external_code?: string;
  warehouse_external_code?: string;
  server_external_code?: string;
}

export interface UpdateDocumentItemData {
  // Todos los campos son opcionales para actualización
  documentId?: number;
  line_number?: number;
  product_id?: number;
  quantity?: number;
  unit_price?: number;
  unit_cost?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  source_document_number?: string;
  warehouse_code?: string;
  server_code?: string;
  description?: string;
  external_code?: string;
  price_before_discount?: number;
  is_exempt?: boolean;
  is_weighted?: boolean;
  source_document_line_number?: number;
  tax_before_discount?: number;
  price_type?: string;
  delivered_quantity?: number;
  is_delivery_complete?: boolean;
  total_weight?: number;
  price_second_currency?: number;
  cost_second_currency?: number;
  manages_serial?: boolean;
  is_composite?: boolean;
  manages_lots?: boolean;
  is_package_quantity?: boolean;
  product_external_code?: string;
  warehouse_external_code?: string;
  server_external_code?: string;
}

// Response interfaces
export interface DocumentItemResponse {
  success: boolean;
  data: DocumentItem;
}

export interface DocumentItemsListResponse {
  success: boolean;
  data: DocumentItem[];
}

export interface PaginatedDocumentItemsResponse {
  success: boolean;
  data: {
    data: DocumentItem[];
    totalPages: number;
    total: number;
    page: number;
    itemsPerPage: number;
    order: "ASC" | "DESC";
  };
}

export const documentItemService = {
  // Crear un nuevo item de documento
  createDocumentItem: async (
    itemData: CreateDocumentItemData
  ): Promise<DocumentItem> => {
    const response = await api.post(PostDocumentItem, itemData);
    return response.data.data;
  },

  // Obtener todos los items de documentos
  getDocumentItems: async (
    params?: GetDocumentItemsParams
  ): Promise<DocumentItem[]> => {
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
    if (params?.documentId) {
      queryParams.append("documentId", params.documentId.toString());
    }
    if (params?.line_number) {
      queryParams.append("line_number", params.line_number.toString());
    }
    if (params?.product_id) {
      queryParams.append("product_id", params.product_id.toString());
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

    const response = await api.get(`${GetDocumentItems}?${queryParams}`);
    return response.data.data;
  },

  // Actualizar un item de documento
  updateDocumentItem: async (
    id: string,
    updates: UpdateDocumentItemData
  ): Promise<DocumentItem> => {
    const response = await api.patch(`${PatchDocumentItem}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un item de documento
  deleteDocumentItem: async (id: string): Promise<void> => {
    await api.delete(`${DeleteDocumentItem}/${id}`);
  },

  // Obtener un item por ID
  getDocumentItemById: async (id: string): Promise<DocumentItem> => {
    const response = await api.get(`${GetDocumentItems}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
  getDocumentItemsByDocument: async (
    documentId: number
  ): Promise<DocumentItem[]> => {
    try {
      const response = await documentItemService.getDocumentItems({
        documentId,
        itemsPerPage: 100,
      });

      console.log("🔍 Respuesta completa de items:", response);

      // Manejar diferentes estructuras de respuesta con tipos seguros
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === "object") {
        // Si es la estructura paginada que vemos en los logs
        if ("data" in response && Array.isArray((response as any).data)) {
          return (response as any).data;
        }
        // Si tiene propiedad data con sub-propiedad data (respuesta paginada estructurada)
        if (
          "data" in response &&
          (response as any).data &&
          "data" in (response as any).data &&
          Array.isArray((response as any).data.data)
        ) {
          return (response as any).data.data;
        }
        // Si es un objeto con propiedades de array
        if ("items" in response && Array.isArray((response as any).items)) {
          return (response as any).items;
        }
      }

      console.warn(
        "⚠️ Estructura de respuesta inesperada, retornando array vacío"
      );
      return [];
    } catch (error) {
      console.error("❌ Error al obtener items del documento:", error);
      return [];
    }
  },

  getDocumentItemsByProduct: async (
    productId: number
  ): Promise<DocumentItem[]> => {
    return documentItemService.getDocumentItems({
      product_id: productId,
      itemsPerPage: 10,
    });
  },

  // Calcular totales de un documento
  calculateDocumentTotals: async (
    documentId: number
  ): Promise<{
    subtotal: number;
    totalTax: number;
    totalDiscount: number;
    grandTotal: number;
    totalItems: number;
  }> => {
    const items = await documentItemService.getDocumentItemsByDocument(
      documentId
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0);
    const totalDiscount = items.reduce(
      (sum, item) => sum + item.discount_amount,
      0
    );
    const grandTotal = items.reduce((sum, item) => sum + item.total_amount, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      totalTax,
      totalDiscount,
      grandTotal,
      totalItems,
    };
  },

  // Crear múltiples items a la vez
  createMultipleDocumentItems: async (
    itemsData: CreateDocumentItemData[]
  ): Promise<DocumentItem[]> => {
    const createdItems: DocumentItem[] = [];

    for (const itemData of itemsData) {
      try {
        const createdItem = await documentItemService.createDocumentItem(
          itemData
        );
        createdItems.push(createdItem);
      } catch (error) {
        console.error(`Error creating document item:`, error);
        throw error;
      }
    }

    return createdItems;
  },
};
