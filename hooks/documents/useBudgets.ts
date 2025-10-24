// hooks/documents/useBudgets.ts
import { useState } from "react";
import {
  documentService,
  Document,
  CreateDocumentData,
} from "@/services/documents/documents.service";
import { useDocuments, UseDocumentsFilters } from "./useDocuments";
import useUserCompany from "../auth/useUserCompany";

// Hook especializado para presupuestos (quotes)
export const useBudgets = (
  filters: Omit<UseDocumentsFilters, "document_type">
) => {
  const documentsHook = useDocuments({
    ...filters,
    document_type: "quote",

    companyId: filters.companyId || 0,
  });

  return {
    ...documentsHook,
    budgets: documentsHook.documents,
  };
};

export const useCreateBudget = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companyId, selectedCompanyId } = useUserCompany();

  const createBudget = async (
    budgetData: Omit<CreateDocumentData, "document_type">
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Usar la empresa seleccionada o la del usuario por defecto
      const targetCompanyId = selectedCompanyId || companyId;

      if (!targetCompanyId) {
        const errorMsg =
          "No se puede crear el presupuesto: Empresa no configurada. Por favor, seleccione una empresa.";
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      const documentData: CreateDocumentData = {
        ...budgetData,
        document_type: "quote",
        status: "draft",
        companyId: targetCompanyId, // ✅ Siempre usar la empresa correcta
      };

      const validation = documentService.validateDocumentData(documentData);
      if (!validation.isValid) {
        const errorMsg = validation.errors.join(", ");
        console.error("❌ Validación falló:", errorMsg);
        throw new Error(errorMsg);
      }

      const newBudget = await documentService.createDocument(documentData);

      return newBudget;
    } catch (err) {
      console.error("🚨 useCreateBudget: Error:", err);
      setError(
        err instanceof Error ? err.message : "Error al crear presupuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBudget,
  };
};
