// hooks/documents/useInvoices.ts
import { useDocuments, UseDocumentsFilters } from "./useDocuments";
import { DocumentStatus } from "@/services/documents/documents.service";

// Tipo extendido que incluye "all" para mostrar todas las facturas
export type InvoiceStatus = DocumentStatus | "all";

export interface UseInvoicesFilters
  extends Omit<UseDocumentsFilters, "document_type" | "status"> {
  clientId?: number;
  status?: InvoiceStatus; // Usar el tipo extendido
  startDate?: string;
  endDate?: string;
}

export const useInvoices = (filters: UseInvoicesFilters) => {
  // Mapear "all" a undefined para no filtrar por estado
  const getMappedStatus = (
    status?: InvoiceStatus
  ): DocumentStatus | undefined => {
    if (!status || status === "all") {
      return undefined; // No filtrar por estado
    }
    return status as DocumentStatus;
  };

  const documentsHook = useDocuments({
    ...filters,
    document_type: "invoice",
    status: getMappedStatus(filters.status), // Mapear el estado
  });

  // Métodos específicos para facturas
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
