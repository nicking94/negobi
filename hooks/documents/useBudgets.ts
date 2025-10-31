// hooks/documents/useBudgets.ts
import { useState } from "react";
import {
  documentService,
  Document,
  CreateDocumentData,
} from "@/services/documents/documents.service";
import { useDocuments, UseDocumentsFilters } from "./useDocuments";
import useUserCompany from "../auth/useUserCompany";

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
    budgetData: CreateDocumentData
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      setError(null);

      const targetCompanyId = selectedCompanyId || companyId;

      if (!targetCompanyId) {
        const errorMsg =
          "No se puede crear el presupuesto: Empresa no configurada";
        throw new Error(errorMsg);
      }

      const documentData: CreateDocumentData = {
        ...budgetData,
        companyId: targetCompanyId,
      };

      const validation = documentService.validateDocumentData(documentData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const newBudget = await documentService.createDocument(documentData);
      return newBudget;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear presupuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createBudget };
};
