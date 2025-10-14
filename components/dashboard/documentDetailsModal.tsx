// components/documents/DocumentDetailsModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentDetails } from "@/hooks/documents/useDocumentDetails";
import { Document } from "@/services/documents/documents.service";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { FileText, Calendar, Hash, Send } from "lucide-react";

interface DocumentDetailsModalProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  documentId,
  isOpen,
  onClose,
}) => {
  const { loading, error, getDocumentDetails } = useDocumentDetails();
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocumentDetails();
    } else {
      setDocument(null);
    }
  }, [isOpen, documentId]);

  const loadDocumentDetails = async () => {
    if (!documentId) return;
    const doc = await getDocumentDetails(documentId);
    setDocument(doc);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: "Borrador",
      pending: "Pendiente",
      approved: "Aprobado",
      completed: "Completado",
      cancelled: "Cancelado",
      closed: "Cerrado",
    };
    return statusMap[status] || status;
  };

  // Función para calcular el subtotal antes de impuestos
  const calculateSubtotal = (doc: Document) => {
    const taxableBase = parseFloat(doc.taxable_base?.toString() || "0");
    const exemptAmount = parseFloat(doc.exempt_amount?.toString() || "0");
    const discount1 = parseFloat(doc.discount_1?.toString() || "0");
    const discount2 = parseFloat(doc.discount_2?.toString() || "0");

    return taxableBase + exemptAmount - discount1 - discount2;
  };

  const InfoRow = ({
    label,
    value,
    valueClass = "",
  }: {
    label: string;
    value: string | number;

    valueClass?: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{label}</span>
      </div>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );

  const InfoCard = ({
    title,

    children,
    className = "",
  }: {
    title: string;

    children: React.ReactNode;
    className?: string;
  }) => (
    <Card className={`border border-gray-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full bg-white border border-gray-200 sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-2">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Detalle de Factura
                  {document && (
                    <Badge
                      variant="outline"
                      className={`border font-medium ${getStatusColor(
                        document.status
                      )}`}
                    >
                      {getStatusText(document.status)}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Información resumida del documento
                </DialogDescription>
              </div>
            </div>
            {document && (
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    parseFloat(document.total_amount?.toString() || "0")
                  )}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Error State */}
        {error && !loading && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">
                  Error al cargar el documento
                </p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDocumentDetails}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Document Content */}
        {document && !loading && (
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <Hash className="h-5 w-5 text-green_m" />
                  <div>
                    <p className="text-sm text-gray-600">Número</p>
                    <p className="font-bold text-green_b">
                      {document.document_number}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green_m" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium text-green_b">
                      {formatDate(document.document_date)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <Hash className="h-5 w-5 text-green_m" />
                  <div>
                    <p className="text-sm text-gray-600">Control</p>
                    <p className="font-medium text-green_b">
                      {document.control_number || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cliente y Empresa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoCard title="Información del Cliente">
                {document.client ? (
                  <div className="space-y-2">
                    <InfoRow
                      label="Nombre"
                      value={document.client.legal_name}
                    />
                    <InfoRow
                      label="ID"
                      value={document.client.id}
                      valueClass="text-gray-500"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No especificado
                  </p>
                )}
              </InfoCard>

              <InfoCard title="Información de la Empresa">
                {document.company ? (
                  <div className="space-y-2">
                    <InfoRow label="Nombre" value={document.company.name} />
                    <InfoRow
                      label="ID"
                      value={document.company.id}
                      valueClass="text-gray-500"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No especificado
                  </p>
                )}
              </InfoCard>
            </div>

            {/* Notas */}
            {document.notes && (
              <InfoCard title="Notas">
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  {document.notes}
                </p>
              </InfoCard>
            )}

            {/* Resumen Financiero - Simplificado */}
            <InfoCard title="Resumen Financiero" className="bg-gray-50">
              <div className="space-y-3">
                {/* Subtotal y Descuentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InfoRow
                      label="Subtotal"
                      value={formatCurrency(calculateSubtotal(document))}
                    />
                    {parseFloat(document.discount_1?.toString() || "0") > 0 && (
                      <InfoRow
                        label="Descuento"
                        value={formatCurrency(
                          parseFloat(document.discount_1?.toString() || "0")
                        )}
                        valueClass="text-red-600"
                      />
                    )}
                    <InfoRow
                      label="Monto Exento"
                      value={formatCurrency(
                        parseFloat(document.exempt_amount?.toString() || "0")
                      )}
                    />
                  </div>

                  <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200">
                    <InfoRow
                      label="Base Imponible"
                      value={formatCurrency(
                        parseFloat(document.taxable_base?.toString() || "0")
                      )}
                    />
                    <InfoRow
                      label="IVA"
                      value={formatCurrency(
                        parseFloat(document.tax?.toString() || "0")
                      )}
                      valueClass="text-blue-600"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatCurrency(
                          parseFloat(document.total_amount?.toString() || "0")
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información adicional relevante */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <InfoRow
                    label="Moneda"
                    value={document.currency?.currency_name || "Bolivar"}
                    valueClass="text-gray-600"
                  />
                  <InfoRow
                    label="Tasa Cambio"
                    value={document.exchange_rate || "1.00"}
                    valueClass="text-gray-600"
                  />
                  <InfoRow
                    label="Transacción"
                    value={
                      document.transaction_date
                        ? formatDate(document.transaction_date)
                        : "N/A"
                    }
                    valueClass="text-gray-600"
                  />
                </div>
              </div>
            </InfoCard>

            {/* Métodos de Pago - Solo si hay valores */}
            {(parseFloat(document.credit_amount?.toString() || "0") > 0 ||
              parseFloat(document.cash_amount?.toString() || "0") > 0) && (
              <InfoCard title="Métodos de Pago">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parseFloat(document.credit_amount?.toString() || "0") >
                    0 && (
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm font-medium text-blue-700">
                        Crédito
                      </span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(
                          parseFloat(document.credit_amount?.toString() || "0")
                        )}
                      </span>
                    </div>
                  )}
                  {parseFloat(document.cash_amount?.toString() || "0") > 0 && (
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                      <span className="text-sm font-medium text-green-700">
                        Efectivo
                      </span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(
                          parseFloat(document.cash_amount?.toString() || "0")
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cerrar
          </Button>
          {document && (
            <Button
              type="button"
              onClick={() => {
                console.log("Reenviar documento:", document.id);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Reenviar Factura
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
