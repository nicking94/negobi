"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  RotateCcw,
  FileText,
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
import { useReturns } from "@/hooks/documents/useReturns";
import { Document } from "@/services/documents/documents.service";
import { useUserCompany } from "@/hooks/auth/useUserCompany";
import { useCurrencyFormatter } from "@/hooks/currencies/useCurrencyFormatter";
import { PriceDisplay } from "@/components/PriceDisplay";
import { DocumentDetailsModal } from "@/components/dashboard/documentDetailsModal";

export type Devolution = {
  id: string;
  client: string;
  correlative: string;
  operation_type: string;
  location: string;
  issued_date: Date;
  total: number;
  seller?: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "cancelled"
    | "draft";
  bill_reference: string;
  reason: string;
  original_invoice?: {
    id: string;
    document_number: string;
  };
};

const DevolutionsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedDevolution, setSelectedDevolution] =
    useState<Devolution | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientDevolutionsDialogOpen, setIsClientDevolutionsDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Usar el hook de usuario para obtener la empresa actual
  const { companyId, isLoading: userLoading, userCompany } = useUserCompany();

  // Usar el hook de formateo de moneda
  const { formatPrice, formatForTable, getNumericValue } =
    useCurrencyFormatter();

  // Usar el hook de devoluciones con la empresa del usuario logeado
  const {
    returns,
    error: returnsError,
    loading: returnsLoading,
  } = useReturns(companyId ? { companyId } : { companyId: -1 });

  // DEBUG: Mostrar información completa de las devoluciones
  useEffect(() => {
    console.log("🔍 ===== DEBUG DEVOLUCIONES - INICIO =====");
    console.log("📋 Parámetros actuales:", {
      companyId,
      userLoading,
      returnsLoading,
    });

    if (returns) {
      console.log("📦 RETURNS DATA - ESTRUCTURA COMPLETA:", {
        returns,
        type: typeof returns,
        isArray: Array.isArray(returns),
        length: returns.length,
        "returns[0]": returns[0]
          ? {
              id: returns[0].id,
              document_type: returns[0].document_type,
              document_number: returns[0].document_number,
              status: returns[0].status,
              client: returns[0].client,
              company: returns[0].company,
              items: returns[0].items, // Verificar si los items vienen en la respuesta principal
              total_amount: returns[0].total_amount,
              observations: returns[0].observations,
            }
          : "No hay devoluciones",
      });

      // Mostrar cada devolución con su estructura completa
      returns.forEach((returnDoc: Document, index: number) => {
        console.log(`📄 DEVOLUCIÓN ${index + 1}/${returns.length}:`, {
          id: returnDoc.id,
          document_type: returnDoc.document_type,
          document_number: returnDoc.document_number,
          document_date: returnDoc.document_date,
          status: returnDoc.status,
          total_amount: returnDoc.total_amount,
          taxable_base: returnDoc.taxable_base,
          tax: returnDoc.tax,
          client: returnDoc.client
            ? {
                id: returnDoc.client.id,
                legal_name: returnDoc.client.legal_name,
                tax_id: returnDoc.client.tax_id,
              }
            : "Sin cliente",
          company: returnDoc.company
            ? {
                id: returnDoc.company.id,
                name: returnDoc.company.name,
              }
            : "Sin empresa",
          affected_document_number: returnDoc.affected_document_number,
          sourceDocumentId: returnDoc.sourceDocumentId,
          observations: returnDoc.observations,
          notes: returnDoc.notes,
          // Verificar si los items vienen incluidos
          items: returnDoc.items
            ? {
                exists: true,
                count: Array.isArray(returnDoc.items)
                  ? returnDoc.items.length
                  : "no es array",
                sample:
                  Array.isArray(returnDoc.items) && returnDoc.items.length > 0
                    ? returnDoc.items[0]
                    : "sin items",
              }
            : "items no incluidos en respuesta principal",
          // Información adicional
          credit_amount: returnDoc.credit_amount,
          cash_amount: returnDoc.cash_amount,
          exchange_rate: returnDoc.exchange_rate,
          currency: returnDoc.currency,
        });
      });

      // Análisis de estructura
      console.log("🔬 ANÁLISIS DE ESTRUCTURA:", {
        "Tipo de returns": typeof returns,
        "Es array": Array.isArray(returns),
        "Número de documentos": returns.length,
        "Tipos de documento encontrados": [
          ...new Set(returns.map((doc) => doc.document_type)),
        ],
        "Estados encontrados": [...new Set(returns.map((doc) => doc.status))],
        "Documentos con items incluidos": returns.filter(
          (doc) => doc.items && Array.isArray(doc.items) && doc.items.length > 0
        ).length,
        "Documentos con observaciones": returns.filter(
          (doc) => doc.observations && doc.observations.length > 0
        ).length,
        "Documentos con cliente": returns.filter((doc) => doc.client).length,
      });
    } else {
      console.log("❌ No hay datos de returns:", {
        returns,
        returnsError,
        returnsLoading,
      });
    }
    console.log("🔍 ===== DEBUG DEVOLUCIONES - FIN =====");
  }, [returns, returnsError, returnsLoading, companyId]);

  const getOperationType = (documentType: string): string => {
    const typeMap: { [key: string]: string } = {
      sales_return: "Devolución de Venta",
      return_delivery_note: "Nota de Entrega Devolución",
      invoice: "Factura",
      order: "Pedido",
    };
    return typeMap[documentType] || documentType;
  };

  const mapReturnStatus = (status: string): Devolution["status"] => {
    const statusMap: { [key: string]: Devolution["status"] } = {
      draft: "draft",
      pending: "pending",
      approved: "approved",
      completed: "completed",
      cancelled: "cancelled",
      rejected: "rejected",
    };
    return statusMap[status] || "pending";
  };

  const devolutions: Devolution[] = useMemo(() => {
    console.log("🔄 Procesando devoluciones desde returns...");

    if (!returns || !Array.isArray(returns)) {
      console.log("❌ returns no es array o está vacío:", returns);
      return [];
    }

    const processedDevolutions = returns.map((returnDoc: Document) => {
      console.log(`📝 Procesando documento ${returnDoc.id}:`, {
        document_number: returnDoc.document_number,
        document_type: returnDoc.document_type,
        observations: returnDoc.observations,
      });

      const reason =
        returnDoc.observations?.find(
          (obs) =>
            obs.campo.toLowerCase().includes("motivo") ||
            obs.campo.toLowerCase().includes("reason")
        )?.valor || "No especificado";

      const billReference =
        returnDoc.affected_document_number ||
        returnDoc.sourceDocumentId?.toString() ||
        "N/A";

      const devolution: Devolution = {
        id: returnDoc.id.toString(),
        client: returnDoc.client?.legal_name || "Cliente no especificado",
        correlative: returnDoc.document_number,
        operation_type: getOperationType(returnDoc.document_type),
        location: returnDoc.company?.name || "Empresa no especificada",
        issued_date: new Date(returnDoc.document_date),
        total: parseFloat(returnDoc.total_amount?.toString()) || 0,
        seller:
          returnDoc.responsibleUserId?.toString() ||
          returnDoc.salesperson_external_code ||
          "No especificado",
        status: mapReturnStatus(returnDoc.status),
        bill_reference: billReference,
        reason: reason,
        original_invoice: returnDoc.sourceDocumentId
          ? {
              id: returnDoc.sourceDocumentId.toString(),
              document_number: returnDoc.affected_document_number || "N/A",
            }
          : undefined,
      };

      console.log(`✅ Devolución procesada ${returnDoc.id}:`, devolution);
      return devolution;
    });

    console.log(
      `🎯 Total de devoluciones procesadas: ${processedDevolutions.length}`
    );
    return processedDevolutions;
  }, [returns]);

  const clients = useMemo(() => {
    const uniqueClients = Array.from(
      new Set(devolutions.map((devolution) => devolution.client))
    );
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [devolutions]);

  // Obtener devoluciones de un cliente específico
  const getClientDevolutions = (clientName: string) => {
    return devolutions.filter((devolution) => devolution.client === clientName);
  };

  // Filtrar devoluciones según los criterios
  const filteredDevolutions = useMemo(() => {
    return devolutions.filter((devolution) => {
      const matchesSearch =
        devolution.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devolution.correlative
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        devolution.operation_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        devolution.bill_reference
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        devolution.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient =
        clientFilter === "all" || devolution.client === clientFilter;

      const matchesStatus =
        statusFilter === "all" || devolution.status === statusFilter;

      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (devolution.issued_date >= dateRange.from &&
          devolution.issued_date <= dateRange.to);

      return (
        matchesSearch && matchesClient && matchesStatus && matchesDateRange
      );
    });
  }, [devolutions, searchTerm, clientFilter, statusFilter, dateRange]);

  const handleViewDevolution = (devolution: Devolution) => {
    console.log("👁️ Ver detalles de devolución:", devolution);
    setSelectedDevolution(devolution);
    setIsViewDialogOpen(true);
  };

  const handleResendDevolution = (devolution: Devolution) => {
    toast.success(
      `Devolución ${devolution.correlative} reenviada exitosamente`
    );
  };

  const handleProcessDevolution = (devolution: Devolution) => {
    toast.success(
      `Devolución ${devolution.correlative} procesada exitosamente`
    );
  };

  const handleViewClientDevolutions = (client: string) => {
    setSelectedClient(client);
    setIsClientDevolutionsDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green_xxl text-green_b",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red_xxl text-red_b",
      rejected: "bg-red-100 text-red-800",
    };

    const statusText = {
      draft: "Borrador",
      pending: "Pendiente",
      approved: "Aprobada",
      completed: "Completada",
      cancelled: "Cancelada",
      rejected: "Rechazada",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  const columns: ColumnDef<Devolution>[] = [
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
      accessorKey: "bill_reference",
      header: "Factura Original",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("bill_reference")}</div>
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
      accessorKey: "issued_date",
      header: "Fecha Devolución",
      cell: ({ row }) => {
        const date = row.getValue("issued_date") as Date;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: "total",
      header: "Total Devuelto",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return <PriceDisplay value={total} variant="table" />;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status"));
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const devolution = row.original;
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
                  onClick={() => handleViewDevolution(devolution)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
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

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Devoluciones de facturas
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, correlativo, factura o motivo..."
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
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger id="status-filter" className="mt-1">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                          <SelectItem value="rejected">Rechazada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

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

          {userLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando información de la empresa...
            </div>
          ) : companyId ? (
            <DataTable<Devolution, Devolution>
              columns={columns}
              data={filteredDevolutions}
              noResultsText="No se encontraron devoluciones"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={filteredDevolutions.length}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No se pudo determinar la empresa del usuario
            </div>
          )}

          {returnsError && (
            <div className="text-center py-4 text-red_m">
              Error: {returnsError}
            </div>
          )}
        </main>
      </div>
      {/* Diálogo de detalles de devolución */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedDevolution && (
          <DocumentDetailsModal
            documentId={selectedDevolution.id}
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
          />
        )}
      </Dialog>

      <Dialog
        open={isClientDevolutionsDialogOpen}
        onOpenChange={setIsClientDevolutionsDialogOpen}
      >
        <DialogContent className="w-full bg-white  sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Devoluciones de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista de devoluciones del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-green_m">
                  <thead>
                    <tr className="bg-green_m text-white">
                      <th className=" px-4 py-2 text-left">Correlativo</th>
                      <th className=" px-4 py-2 text-left">
                        Factura Referencia
                      </th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className=" px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientDevolutions(selectedClient).map((devolution) => (
                      <tr key={devolution.id}>
                        <td className="border border-gray_l px-4 py-2">
                          {devolution.correlative}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {devolution.bill_reference}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatDate(devolution.issued_date)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          <PriceDisplay
                            value={devolution.total}
                            variant="table"
                          />
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {getStatusBadge(devolution.status)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDevolution(devolution)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Pedido</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendDevolution(devolution)}
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
              onClick={() => setIsClientDevolutionsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevolutionsPage;
