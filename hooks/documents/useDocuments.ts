// hooks/documents/useDocuments.ts
import { useState, useEffect } from "react";
import {
  documentService,
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentType,
  GetDocumentsParams,
  DocumentStatus,
} from "../../services/documents/documents.service";

export interface UseDocumentsFilters {
  document_type?: DocumentType;
  companyId: number;
  search?: string;
  status?: DocumentStatus;
  startDate?: string;
  endDate?: string;
}

export const useDocuments = (filters: UseDocumentsFilters) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async (
    customFilters?: Partial<UseDocumentsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const currentCompanyId = customFilters?.companyId || filters?.companyId;

      if (!currentCompanyId || currentCompanyId === -1) {
        setDocuments([]);
        return;
      }

      const combinedFilters: GetDocumentsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
        companyId: currentCompanyId,
      };

      const documentsData = await documentService.getDocuments(combinedFilters);

      if (Array.isArray(documentsData)) {
        setDocuments(documentsData);
      } else {
        console.warn("⚠️ documentsData no es array:", documentsData);
        setDocuments([]);
      }
    } catch (err) {
      console.error("❌ Error al cargar documentos:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar documentos"
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (
    documentData: CreateDocumentData
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);

      const validation = documentService.validateDocumentData(documentData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      const newDocument = await documentService.createDocument(documentData);
      setDocuments((prev) => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear documento");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (
    id: string,
    updates: UpdateDocumentData
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedDocument = await documentService.updateDocument(id, updates);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id.toString() === id ? updatedDocument : doc))
      );
      return updatedDocument;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar documento"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id.toString() !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar documento"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (
    id: string,
    status: DocumentStatus
  ): Promise<Document | null> => {
    return updateDocument(id, { status });
  };

  useEffect(() => {
    if (filters?.companyId) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [filters?.companyId, filters?.document_type, filters?.status]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    updateDocumentStatus,
    refetch: loadDocuments,
  };
};

export const useOrders = (
  filters: Omit<UseDocumentsFilters, "document_type">
) => {
  const documentsHook = useDocuments({
    ...filters,
    document_type: "order",
  });

  const orders = documentsHook.documents.map((doc) => ({
    ...doc,

    order_number: doc.document_number,
    order_date: doc.document_date,
    order_type: doc.document_type,
  }));

  return {
    ...documentsHook,
    orders,
    documents: documentsHook.documents,
  };
};
