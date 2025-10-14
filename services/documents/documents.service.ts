// services/documents/documents.service.ts
import api from "../../utils/api";
import {
  PostDocument,
  GetDocuments,
  GetDocumentById,
  PatchDocument,
  DeleteDocument,
  GetAllDocuments,
} from "../documents/documents.route";

export interface GetDocumentsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId: number; // Ahora es requerido
  document_type?: DocumentType;
  document_number?: string;
  startDate?: string;
  endDate?: string;
  clientId?: number;
  supplierId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  status?: DocumentStatus;
}

// Tipos para documentos (reemplazan orders)
export type DocumentType =
  | "order"
  | "quote"
  | "invoice"
  | "delivery_note"
  | "purchase_requisition"
  | "purchase_order"
  | "purchase_receipt"
  | "purchase_invoice"
  | "inventory_movement_outcome"
  | "inventory_movement_income"
  | "inventory_movement_transfer"
  | "sales_return"
  | "return_delivery_note";

export type DocumentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "completed"
  | "cancelled"
  | "closed";

// services/documents/documents.service.ts

export interface Document {
  // Campos principales
  id: number;
  document_type: DocumentType;
  document_number: string;
  document_date: string;
  external_reference?: string;
  notes?: string;
  status: DocumentStatus;
  control_number?: string;
  salesperson_external_code?: string;
  amount: number;
  taxable_base: number;
  tax: number;
  exempt_amount: number;
  discount_1: number;
  discount_2: number;
  total_amount: number;
  freight: number;
  tip: number;
  station_device?: string;
  transaction_date: string;
  affected_document_number?: string;
  retention_number?: string;
  exchange_rate: number;
  partial_discount: number;
  product_cost: number;
  service_cost: number;
  total_services: number;
  total_products: number;
  credit_amount: number;
  cash_amount: number;
  affected_document_type?: string;
  transport_code?: string;
  driver_code?: string;
  merchandise_weight: number;
  due_date: string;
  purchase_invoice_date: string;
  dispatch_status?: string;

  // Campos de relación (IDs)
  companyId?: number;
  clientId?: number;
  supplierId?: number;
  operationTypeId?: number;
  currencyId?: number;
  paymentTermId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  sourceDocumentId?: number;
  salespersonId?: number;

  // Campos extendidos (actualizados según la documentación de la API)
  company?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    legal_name: string;
    tax_id?: string; // ✅ Añadir esta propiedad
    contact?: string;
    email?: string;
    address?: string;
    phone?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  supplier?: {
    id: number;
    name: string;
  };
  currency?: {
    id: number;
    currency_name: string;
  };

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Observaciones
  observations?: Array<{
    campo: string;
    valor: string;
  }>;

  // Campos adicionales de la API
  is_correlative?: boolean;
  sign?: boolean;
  reference_amount?: number;
  address_1?: string;
  address_2?: string;
  phone?: string;
  is_delivery_note?: boolean;
  coordinates?: string;
  erp_code_order_number?: string;
  erp_code_order_type?: string;
  server_code?: string;
  delivery_date?: string;
}

// Datos para crear un documento
export interface CreateDocumentData {
  document_type: DocumentType;
  document_number: string;
  document_date: string;
  companyId: number;

  // Campos opcionales
  clientId?: number;
  supplierId?: number;
  operationTypeId?: number;
  currencyId?: number;
  paymentTermId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  sourceDocumentId?: number;
  external_code?: string;
  notes?: string;
  status?: DocumentStatus;
  control_number?: string;
  salespersonId?: number;
  salesperson_external_code?: string;
  amount?: number;
  taxable_base?: number;
  tax?: number;
  exempt_amount?: number;
  discount_1?: number;
  discount_2?: number;
  total_amount?: number;
  freight?: number;
  tip?: number;
  station_device?: string;
  transaction_date?: string;
  affected_document_number?: string;
  retention_number?: string;
  exchange_rate?: number;
  partial_discount?: number;
  product_cost?: number;
  service_cost?: number;
  total_services?: number;
  total_products?: number;
  credit_amount?: number;
  cash_amount?: number;
  affected_document_type?: string;
  transport_code?: string;
  driver_code?: string;
  merchandise_weight?: number;
  due_date?: string;
  purchase_invoice_date?: string;
  dispatch_status?: string;
  observations?: Array<{
    campo: string;
    valor: string;
  }>;
}

// Datos para actualizar un documento
export interface UpdateDocumentData {
  document_type?: DocumentType;
  document_number?: string;
  document_date?: string;
  companyId?: number;
  clientId?: number;
  supplierId?: number;
  operationTypeId?: number;
  currencyId?: number;
  paymentTermId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  sourceDocumentId?: number;
  external_code?: string;
  notes?: string;
  status?: DocumentStatus;
  control_number?: string;
  salespersonId?: number;
  salesperson_external_code?: string;
  amount?: number;
  taxable_base?: number;
  tax?: number;
  exempt_amount?: number;
  discount_1?: number;
  discount_2?: number;
  total_amount?: number;
  freight?: number;
  tip?: number;
  station_device?: string;
  transaction_date?: string;
  affected_document_number?: string;
  retention_number?: string;
  exchange_rate?: number;
  partial_discount?: number;
  product_cost?: number;
  service_cost?: number;
  total_services?: number;
  total_products?: number;
  credit_amount?: number;
  cash_amount?: number;
  affected_document_type?: string;
  transport_code?: string;
  driver_code?: string;
  merchandise_weight?: number;
  due_date?: string;
  purchase_invoice_date?: string;
  dispatch_status?: string;
  observations?: Array<{
    campo: string;
    valor: string;
  }>;
}

// Interfaces de respuesta
export interface DocumentResponse {
  success: boolean;
  data: Document;
}

export interface DocumentsListResponse {
  success: boolean;
  data: Document[];
}

export interface PaginatedDocumentsResponse {
  success: boolean;
  data: {
    data: Document[];
    totalPages: number;
    total: number;
  };
}

// Constantes para órdenes (para mantener compatibilidad)
export const DOCUMENT_TYPES = {
  ORDER: "order",
  QUOTE: "quote",
  INVOICE: "invoice",
} as const;

export const DOCUMENT_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  CLOSED: "closed",
} as const;

// Alias para mantener compatibilidad con código existente
export type OrderType = DocumentType;
export type OrderStatus = DocumentStatus;
export const ORDER_TYPES = DOCUMENT_TYPES;
export const ORDER_STATUSES = DOCUMENT_STATUSES;

export const documentService = {
  // Crear un nuevo documento
  createDocument: async (
    documentData: CreateDocumentData
  ): Promise<Document> => {
    const response = await api.post(PostDocument, documentData);
    return response.data.data;
  },

  // Obtener documentos paginados
  getDocuments: async (params: GetDocumentsParams): Promise<Document[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params.page?.toString() || "1");
    queryParams.append("itemsPerPage", params.itemsPerPage?.toString() || "10");
    queryParams.append("companyId", params.companyId.toString());

    // Parámetros opcionales
    if (params.document_type) {
      queryParams.append("document_type", params.document_type);
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.order) {
      queryParams.append("order", params.order);
    }
    if (params.document_number) {
      queryParams.append("document_number", params.document_number);
    }
    if (params.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    if (params.clientId) {
      queryParams.append("clientId", params.clientId.toString());
    }
    if (params.supplierId) {
      queryParams.append("supplierId", params.supplierId.toString());
    }
    if (params.sourceWarehouseId) {
      queryParams.append(
        "sourceWarehouseId",
        params.sourceWarehouseId.toString()
      );
    }
    if (params.destinationWarehouseId) {
      queryParams.append(
        "destinationWarehouseId",
        params.destinationWarehouseId.toString()
      );
    }
    if (params.responsibleUserId) {
      queryParams.append(
        "responsibleUserId",
        params.responsibleUserId.toString()
      );
    }
    if (params.status) {
      queryParams.append("status", params.status);
    }

    const response = await api.get(`${GetDocuments}?${queryParams}`);

    // Manejar diferentes estructuras de respuesta
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Estructura de respuesta inesperada:", response.data);
      return [];
    }
  },

  // Obtener todos los documentos sin paginación (para reportes)
  getAllDocuments: async (
    companyId: number,
    startDate?: string,
    endDate?: string,
    document_type?: DocumentType
  ): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("companyId", companyId.toString());

    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (document_type) queryParams.append("document_type", document_type);

    const response = await api.get(`${GetAllDocuments}?${queryParams}`);
    return response.data.data || [];
  },

  // Obtener un documento por ID
  getDocumentById: async (id: string): Promise<Document> => {
    const response = await api.get(`${GetDocumentById}/${id}`);
    return response.data.data;
  },

  // Actualizar un documento
  updateDocument: async (
    id: string,
    updates: UpdateDocumentData
  ): Promise<Document> => {
    const response = await api.patch(`${PatchDocument}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un documento
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`${DeleteDocument}/${id}`);
  },

  // Métodos específicos para órdenes (para mantener compatibilidad)
  getOrders: async (
    params: GetDocumentsParams & { document_type?: "order" }
  ): Promise<Document[]> => {
    return documentService.getDocuments({
      ...params,
      document_type: "order",
    });
  },

  createOrder: async (orderData: CreateDocumentData): Promise<Document> => {
    return documentService.createDocument({
      ...orderData,
      document_type: "order",
    });
  },

  updateOrder: async (
    id: string,
    updates: UpdateDocumentData
  ): Promise<Document> => {
    return documentService.updateDocument(id, updates);
  },

  // Métodos utilitarios
  generateDocumentNumber: (prefix: string = "DOC"): string => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  },

  // Validar datos del documento
  validateDocumentData: (
    documentData: CreateDocumentData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!documentData.document_type) {
      errors.push("El tipo de documento es requerido");
    }

    if (
      !documentData.document_number ||
      documentData.document_number.trim().length === 0
    ) {
      errors.push("El número de documento es requerido");
    }

    if (!documentData.document_date) {
      errors.push("La fecha del documento es requerida");
    }

    if (!documentData.companyId) {
      errors.push("La compañía es requerida");
    }

    if (documentData.total_amount && documentData.total_amount < 0) {
      errors.push("El monto total no puede ser negativo");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
