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

// Definir el tipo para los filtros del hook - companyId es obligatorio
export interface UseDocumentsFilters {
  document_type?: DocumentType;
  companyId: number;
  search?: string;
  status?: DocumentStatus;
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

      // MODIFICACIÓN: No lanzar error, simplemente no hacer la petición
      const currentCompanyId = customFilters?.companyId || filters.companyId;
      if (!currentCompanyId) {
        console.log("🟡 companyId no proporcionado, omitiendo carga");
        setDocuments([]);
        return;
      }

      const combinedFilters: GetDocumentsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
        companyId: currentCompanyId, // Usar el valor validado
      };

      console.log("🔵 Enviando parámetros:", combinedFilters);

      const documentsData = await documentService.getDocuments(combinedFilters);
      console.log("🟢 Response completo:", documentsData);
      console.log(
        "📝 Número de documentos recibidos:",
        documentsData?.length || 0
      );
      console.log("🏢 Documentos por companyId:", combinedFilters.companyId);

      if (Array.isArray(documentsData)) {
        console.log("👤 Primer documento (ejemplo):", documentsData[0]);
        console.log(
          "👤 Cliente del primer documento:",
          documentsData[0]?.client
        );
        setDocuments(documentsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", documentsData);
        setDocuments([]);
      }
    } catch (err) {
      console.error("🔴 Error al cargar documentos:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar documentos"
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };
  // Crear documento
  const createDocument = async (
    documentData: CreateDocumentData
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);
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

  // Actualizar documento
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

  // Eliminar documento
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

  useEffect(() => {
    if (filters.companyId) {
      loadDocuments();
    } else {
      // Si no hay companyId, limpiar los documentos
      setDocuments([]);
    }
  }, [filters.companyId, filters.document_type]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: loadDocuments,
  };
};
