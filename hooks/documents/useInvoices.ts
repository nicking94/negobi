// hooks/documents/useInvoices.ts
import { useDocuments, UseDocumentsFilters } from "./useDocuments";
import { DocumentStatus } from "@/services/documents/documents.service";

export type InvoiceStatus = DocumentStatus | "all";

export interface UseInvoicesFilters
  extends Omit<UseDocumentsFilters, "document_type" | "status"> {
  clientId?: number;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

export const useInvoices = (filters: UseInvoicesFilters) => {
  const getMappedStatus = (
    status?: InvoiceStatus
  ): DocumentStatus | undefined => {
    if (!status || status === "all") {
      return undefined;
    }
    return status as DocumentStatus;
  };

  const documentsHook = useDocuments({
    ...filters,
    document_type: "invoice",
    status: getMappedStatus(filters.status),
  });

  const markAsPaid = async (invoiceId: string) => {
    return documentsHook.updateDocumentStatus(invoiceId, "completed");
  };

  const cancelInvoice = async (invoiceId: string) => {
    return documentsHook.updateDocumentStatus(invoiceId, "cancelled");
  };

  return {
    ...documentsHook,
    invoices: documentsHook.documents,
    markAsPaid,
    cancelInvoice,
  };
};
