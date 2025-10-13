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

  // Cargar todos los documentos con filtros
  const loadDocuments = async (
    customFilters?: Partial<UseDocumentsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetDocumentsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
      };

      console.log("🔵 Enviando parámetros:", combinedFilters);

      // documentService.getDocuments ya devuelve Document[] directamente
      const documentsData = await documentService.getDocuments(combinedFilters);
      console.log("🟢 Datos de documentos recibidos:", documentsData);

      // documentsData ya debería ser Document[]
      if (Array.isArray(documentsData)) {
        setDocuments(documentsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", documentsData);
        setDocuments([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar documentos"
      );
      setDocuments([]); // Asegurar que documents sea un array vacío en caso de error
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

  // Cargar documentos al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadDocuments();
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
