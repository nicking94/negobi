import api from "../../utils/api";
import {
  PostDocument,
  GetDocuments,
  PatchDocument,
  DeleteDocument,
} from "../documents/documents.route";

export interface GetDocumentsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
  document_type?: DocumentType;
  document_number?: string;
  document_date?: string;
  clientId?: number;
  supplierId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  status?: DocumentStatus;
}

// Tipos para los valores enumerados
export type DocumentType =
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

export interface Document {
  // Campos del response (GET)
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
  company?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    legal_name: string;
  };
  currency?: {
    id: number;
    currency_name: string;
  };
  supplierId?: number;
  operationTypeId?: number;
  paymentTermId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  responsibleUserId?: number;
  sourceDocumentId?: number;
  salespersonId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateDocumentData {
  // Campos requeridos para crear un documento
  document_type: DocumentType;
  document_number: string;
  document_date: string;
  companyId: number;

  // Campos opcionales para creación
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
}

export interface UpdateDocumentData {
  // Todos los campos son opcionales para actualización
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
}

// Response interfaces
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

export const documentService = {
  // Crear un nuevo documento
  createDocument: async (
    documentData: CreateDocumentData
  ): Promise<Document> => {
    const response = await api.post(PostDocument, documentData);
    return response.data.data;
  },

  // Obtener todos los documentos
  getDocuments: async (params?: GetDocumentsParams): Promise<Document[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    // Parámetros opcionales
    if (params?.document_type) {
      queryParams.append("document_type", params.document_type);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.document_number) {
      queryParams.append("document_number", params.document_number);
    }
    if (params?.document_date) {
      queryParams.append("document_date", params.document_date);
    }
    if (params?.clientId) {
      queryParams.append("clientId", params.clientId.toString());
    }
    if (params?.supplierId) {
      queryParams.append("supplierId", params.supplierId.toString());
    }
    if (params?.sourceWarehouseId) {
      queryParams.append(
        "sourceWarehouseId",
        params.sourceWarehouseId.toString()
      );
    }
    if (params?.destinationWarehouseId) {
      queryParams.append(
        "destinationWarehouseId",
        params.destinationWarehouseId.toString()
      );
    }
    if (params?.responsibleUserId) {
      queryParams.append(
        "responsibleUserId",
        params.responsibleUserId.toString()
      );
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }

    const response = await api.get(`/documents?${queryParams}`);

    // La respuesta tiene estructura { success: boolean, data: { data: Document[], ... } }
    console.log("🔵 Estructura completa de respuesta:", response.data);

    // Asegúrate de acceder a data.data
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.data)
    ) {
      return response.data.data.data; // Estructura anidada
    } else if (Array.isArray(response.data.data)) {
      return response.data.data; // Estructura plana
    } else if (Array.isArray(response.data)) {
      return response.data; // Otra posible estructura
    } else {
      console.warn("⚠️ Estructura de respuesta inesperada:", response.data);
      return [];
    }
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

  // Obtener un documento por ID
  getDocumentById: async (id: string): Promise<Document> => {
    const response = await api.get(`${GetDocuments}/${id}`);
    return response.data.data;
  },
};
