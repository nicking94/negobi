"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  FileText,
  Building,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Document } from "@/services/documents/documents.service";
import { documentTypeTranslations } from "@/utils/documentTypeTranslations";
import { DocumentDetailsModal } from "@/components/dashboard/documentDetailsModal";
import { PriceDisplay } from "@/components/PriceDisplay";
import useUserCompany from "@/hooks/auth/useUserCompany"; // Importar el hook
import { useInvoices } from "@/hooks/documents/useInvoices";

// Tipo Bill basado en Document
export type Bill = {
  id: string;
  client: string;
  correlative: string;
  operation_type: string;
  location: string;
  issued_date: Date;
  total: number;
  seller?: string;
  status: "pending" | "paid" | "cancelled";
};

const translateDocumentType = (documentType: string): string => {
  return documentTypeTranslations[documentType] ?? documentType;
};

const BillsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientBillsDialogOpen, setIsClientBillsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Obtener la empresa del usuario logueado
  const {
    companyId,
    isLoading: companyLoading,
    userCompany,
  } = useUserCompany();

  const {
    invoices: documents,
    loading: documentsLoading,
    error: documentsError,
    markAsPaid,
    cancelInvoice,
  } = useInvoices(
    companyId
      ? {
          companyId: companyId,
          status: "all",
        }
      : {
          companyId: -1,
        }
  );

  const mapDocumentStatusToBillStatus = (
    docStatus: string
  ): "pending" | "paid" | "cancelled" => {
    switch (docStatus?.toLowerCase()) {
      case "completed":
      case "approved":
      case "paid":
        return "paid";
      case "cancelled":
      case "voided":
        return "cancelled";
      case "draft":
      case "pending":
      case "sent":
      default:
        return "pending";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      paid: { label: "Pagada", className: "bg-green_xxl text-green_b" },
      pending: {
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-800",
      },
      cancelled: { label: "Cancelada", className: "bg-red_xxl text-red_b" },
    };

    const billStatus = mapDocumentStatusToBillStatus(status);
    return statusMap[billStatus];
  };

  const bills: Bill[] = useMemo(() => {
    return documents.map((doc: Document) => ({
      id: doc.id.toString(),
      client: doc.client?.legal_name || "Cliente no especificado",
      correlative: doc.document_number,
      operation_type: translateDocumentType(doc.document_type),
      location: doc.company?.name || "Empresa no especificada",
      issued_date: new Date(doc.document_date),
      total: parseFloat(doc.total_amount.toString()) || 0,
      seller:
        doc.responsibleUserId?.toString() ||
        doc.salesperson_external_code ||
        "Cod. no especificado",
      status: mapDocumentStatusToBillStatus(doc.status),
    }));
  }, [documents]);

  const clients = useMemo(() => {
    const uniqueClients = Array.from(new Set(bills.map((bill) => bill.client)));
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [bills]);

  // Obtener facturas de un cliente específico
  const getClientBills = (clientName: string) => {
    return bills.filter((bill) => bill.client === clientName);
  };

  // Filtrar facturas según los criterios
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.correlative.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.operation_type.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por vendedor (si no es "todos")
      const matchesSeller =
        sellerFilter === "all" || bill.seller === sellerFilter;

      // Filtrar por cliente (si no es "todos")
      const matchesClient =
        clientFilter === "all" || bill.client === clientFilter;

      // Filtrar por rango de fechas
      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (bill.issued_date >= dateRange.from &&
          bill.issued_date <= dateRange.to);

      return (
        matchesSearch && matchesSeller && matchesClient && matchesDateRange
      );
    });
  }, [bills, searchTerm, sellerFilter, clientFilter, dateRange]);

  const handleViewOrder = (bill: Bill) => {
    setSelectedDocumentId(bill.id);
    setIsDetailsModalOpen(true);
  };

  const handleViewClientBills = (client: string) => {
    setSelectedClient(client);
    setIsClientBillsDialogOpen(true);
  };

  const handleResendOrder = (bill: Bill) => {
    // Aquí implementarías la lógica para reenviar el pedido
    toast.success(`Pedido de la factura ${bill.correlative} reenviado`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const columns: ColumnDef<Bill>[] = [
    {
      accessorKey: "document_number",
      header: "N° Factura",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.original.correlative}</div>
          <div className="text-xs text-gray_m">
            {formatDate(row.original.issued_date)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("client")}</div>
          <div className="text-xs text-gray_m">{row.original.seller}</div>
        </div>
      ),
    },
    {
      accessorKey: "correlative",
      header: "Correlativo",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("correlative")}</div>
      ),
    },
    {
      accessorKey: "operation_type",
      header: "Tipo de Operación",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("operation_type")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("location")}</div>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return <PriceDisplay value={total} variant="table" />;
      },
    },

    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const bill = row.original;
        const isPending = bill.status === "pending";
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleViewOrder(bill)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>

                {isPending && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await markAsPaid(bill.id);
                          toast.success(
                            `Factura ${bill.correlative} marcada como pagada`
                          );
                        } catch (error) {
                          toast.error("Error al marcar como pagada");
                        }
                      }}
                      className="cursor-pointer flex items-center gap-2 text-green_m hover:text-green_b"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Marcar como Pagada</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await cancelInvoice(bill.id);
                          toast.success(
                            `Factura ${bill.correlative} cancelada`
                          );
                        } catch (error) {
                          toast.error("Error al cancelar factura");
                        }
                      }}
                      className="cursor-pointer flex items-center gap-2 text-red_m hover:text-red_b "
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancelar Factura</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      {/* Contenedor principal sin margen lateral */}
      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Facturas
            </h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtrar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[18rem]">
                    <div className="px-2 py-1.5">
                      <Label htmlFor="client-filter">Cliente</Label>
                      <Select
                        value={clientFilter}
                        onValueChange={setClientFilter}
                      >
                        <SelectTrigger id="client-filter" className="mt-1">
                          <SelectValue placeholder="Todos los clientes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los clientes
                          </SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="date-range">Período</Label>
                      <div className="mt-1">
                        <DatePicker
                          selected={dateRange?.from}
                          onChange={(dates: [Date | null, Date | null]) => {
                            const [start, end] = dates;
                            setDateRange({
                              from: start || undefined,
                              to: end || undefined,
                            });
                          }}
                          startDate={dateRange?.from}
                          endDate={dateRange?.to}
                          selectsRange
                          isClearable
                          placeholderText="Seleccionar rango"
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {companyLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando información de la empresa...
            </div>
          ) : companyId ? (
            <DataTable<Bill, Bill>
              columns={columns}
              data={filteredBills}
              noResultsText="No se encontraron facturas"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={filteredBills.length}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudo cargar la información de la empresa
            </div>
          )}
        </main>
      </div>

      <DocumentDetailsModal
        documentId={selectedDocumentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDocumentId(null);
        }}
      />

      {/* Modal para ver facturas del cliente */}
      <Dialog
        open={isClientBillsDialogOpen}
        onOpenChange={setIsClientBillsDialogOpen}
      >
        <DialogContent className="w-full bg-white  sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Facturas de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista de facturas del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-green_m">
                  <thead>
                    <tr className="bg-green_l text-white">
                      <th className=" px-4 py-2 text-left">Correlativo</th>
                      <th className=" px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientBills(selectedClient).map((bill) => (
                      <tr key={bill.id}>
                        <td className="border border-gray_xl px-4 py-2">
                          {bill.correlative}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          {formatDate(bill.issued_date)}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          <PriceDisplay value={bill.total} variant="default" />
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bill.status === "paid"
                                ? "bg-green_xxl text-green_b"
                                : bill.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red_xxl text-red_b"
                            }`}
                          >
                            {bill.status === "paid"
                              ? "Pagada"
                              : bill.status === "pending"
                              ? "Pendiente"
                              : "Cancelada"}
                          </span>
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(bill)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Pedido</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendOrder(bill)}
                              className="flex items-center gap-1"
                            >
                              <Send className="h-4 w-4" />
                              <span>Reenviar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClientBillsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsPage;
