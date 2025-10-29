// hooks/documents/useDocumentDetails.ts
import { useState } from "react";
import {
  documentService,
  Document,
} from "@/services/documents/documents.service";
import {
  documentItemService,
  DocumentItem,
} from "@/services/documentItems/documentItems.service";

export const useDocumentDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocumentDetails = async (
    documentId: string
  ): Promise<{
    document: Document;
    items: DocumentItem[];
  } | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Obteniendo detalles del documento:", documentId);

      // Obtener el documento
      const document = await documentService.getDocumentById(documentId);
      console.log("📄 Documento obtenido:", document);

      // Obtener los items del documento
      let items: DocumentItem[] = [];
      try {
        const itemsResponse =
          await documentItemService.getDocumentItemsByDocument(
            parseInt(documentId)
          );
        console.log("📦 Items obtenidos:", itemsResponse);

        // Asegurarnos de que items sea un array - VERSIÓN CON TIPOS SEGUROS
        if (Array.isArray(itemsResponse)) {
          items = itemsResponse;
        } else if (itemsResponse && typeof itemsResponse === "object") {
          // Usar type assertion para evitar errores de TypeScript
          const response = itemsResponse as any;

          // Verificar diferentes estructuras posibles
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (Array.isArray(response.items)) {
            items = response.items;
          } else if (response.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          } else {
            console.warn("⚠️ Estructura de respuesta no reconocida:", response);
            items = [];
          }
        }

        console.log("✅ Items procesados:", items);
      } catch (itemsError) {
        console.warn(
          "⚠️ Error al obtener items, continuando sin items:",
          itemsError
        );
        items = [];
      }

      return {
        document,
        items,
      };
    } catch (err) {
      console.error("❌ Error al cargar detalles del documento:", err);
      setError(err instanceof Error ? err.message : "Error al cargar detalles");
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
