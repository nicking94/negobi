// hooks/documents/useDocumentDetails.ts
import { useState } from "react";
import {
  documentService,
  Document,
} from "@/services/documents/documents.service";

export const useDocumentDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocumentDetails = async (id: string): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);
      const document = await documentService.getDocumentById(id);
      return document;
    } catch (err) {
      console.error("Error al cargar detalles del documento:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar detalles del documento"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDocumentDetails,
  };
};
