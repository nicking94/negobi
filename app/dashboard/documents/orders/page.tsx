// pages/orders/OrdersPage.tsx
"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  Package,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
import { Badge } from "@/components/ui/badge";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DOCUMENT_STATUSES,
  DocumentStatus,
} from "@/services/documents/documents.service";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useUserCompany } from "@/hooks/auth/useUserCompany";
import { DocumentDetailsModal } from "@/components/dashboard/documentDetailsModal";
import { PriceDisplay } from "@/components/PriceDisplay";

export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Order = {
  id: string;
  order_number: string;
  client: string;
  client_id?: number;
  order_date: Date;
  delivery_date: Date | null;
  operation_type: string;
  operation_type_id?: number;
  items: OrderItem[];
  total: number;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  seller?: string;
  salesperson_id?: number;
  location: string;
  warehouse_id?: number;
  notes?: string;
  company_id?: number;
};

const OrdersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleClientChange = (value: string) => {
    setClientFilter(value);
  };

  const handleOperationTypeChange = (value: string) => {
    setOperationTypeFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClientFilter("all");
    setOperationTypeFilter("all");
    setDateRange({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    });
  };

  const { companyId, isLoading: userLoading } = useUserCompany();

  const mapApiStatusToLocalStatus = (apiStatus: string): Order["status"] => {
    switch (apiStatus) {
      case DOCUMENT_STATUSES.DRAFT:
      case DOCUMENT_STATUSES.PENDING:
        return "pending";
      case DOCUMENT_STATUSES.APPROVED:
        return "processing";
      case DOCUMENT_STATUSES.COMPLETED:
        return "completed";
      case DOCUMENT_STATUSES.CANCELLED:
        return "cancelled";
      default:
        return "pending";
    }
  };

  const mapLocalStatusToApiStatus = (
    localStatus: Order["status"]
  ): DocumentStatus => {
    switch (localStatus) {
      case "pending":
        return DOCUMENT_STATUSES.PENDING;
      case "processing":
        return DOCUMENT_STATUSES.APPROVED;
      case "completed":
        return DOCUMENT_STATUSES.COMPLETED;
      case "cancelled":
        return DOCUMENT_STATUSES.CANCELLED;
      default:
        return DOCUMENT_STATUSES.PENDING;
    }
  };

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusClassName = (status: Order["status"]) => {
    const baseClasses = "flex items-center gap-1 w-fit";
    switch (status) {
      case "pending":
        return baseClasses;
      case "processing":
        return baseClasses;
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-100`;
      case "cancelled":
        return baseClasses;
      default:
        return baseClasses;
    }
  };

  const {
    documents: documentsData,
    loading: documentsLoading,
    error: documentsError,
    updateDocumentStatus,
  } = useDocuments({
    companyId: companyId || 0,
    document_type: "order",
  });

  const orders: Order[] = useMemo(() => {
    if (!documentsData || !Array.isArray(documentsData)) {
      return [];
    }

    return documentsData.map((doc) => ({
      id: doc.id.toString(),
      order_number: doc.document_number,
      client: doc.client?.legal_name || `Cliente ${doc.clientId}`,
      client_id: doc.clientId,
      order_date: new Date(doc.document_date),
      delivery_date: doc.due_date ? new Date(doc.due_date) : null,
      operation_type: doc.operationTypeId
        ? `Operación ${doc.operationTypeId}`
        : "Venta",
      operation_type_id: doc.operationTypeId,
      items: [],
      total: doc.total_amount,
      total_amount: doc.total_amount,
      status: mapApiStatusToLocalStatus(doc.status),
      seller: doc.salesperson_external_code || "No especificado",
      salesperson_id: doc.salespersonId,
      location: doc.sourceWarehouseId
        ? `Almacén ${doc.sourceWarehouseId}`
        : "Ubicación no especificada",
      warehouse_id: doc.sourceWarehouseId,
      notes: doc.notes || "Sin notas",
      company_id: doc.companyId,
    }));
  }, [documentsData]);

  const clients = useMemo(() => {
    const uniqueClients = Array.from(
      new Set(orders.map((order) => order.client))
    );
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [orders]);

  const operationTypes = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(orders.map((order) => order.operation_type))
    );
    return uniqueTypes.map((type, index) => ({
      id: (index + 1).toString(),
      name: type,
    }));
  }, [orders]);

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "En proceso" },
    { value: "completed", label: "Completado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.operation_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient =
        clientFilter === "all" || order.client === clientFilter;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const matchesOperationType =
        operationTypeFilter === "all" ||
        order.operation_type === operationTypeFilter;

      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (order.order_date >= dateRange.from &&
          order.order_date <= dateRange.to);

      return (
        matchesSearch &&
        matchesClient &&
        matchesStatus &&
        matchesOperationType &&
        matchesDateRange
      );
    });
  }, [
    orders,
    searchTerm,
    clientFilter,
    statusFilter,
    operationTypeFilter,
    dateRange,
  ]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDocumentId(order.id);
    setIsDocumentModalOpen(true);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const apiStatus = mapLocalStatusToApiStatus(newStatus);
      const result = await updateDocumentStatus(orderId, apiStatus);

      if (result) {
        toast.success(
          `Estado del pedido actualizado a ${getStatusLabel(newStatus)}`
        );
      } else {
        toast.error("Error al actualizar el estado del pedido");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error al actualizar el estado del pedido");
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "En proceso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendiente";
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("client")}</div>
          <div className="text-xs text-gray-500">{row.original.seller}</div>
        </div>
      ),
    },
    {
      accessorKey: "order_number",
      header: "Número de Pedido",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("order_number")}</div>
          <div className="text-xs text-gray-500">
            {formatDate(row.original.order_date)}
          </div>
        </div>
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
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as Order["status"];
        return (
          <Badge
            variant={getStatusVariant(status)}
            className={getStatusClassName(status)}
          >
            {getStatusIcon(status)}
            {getStatusLabel(status)}
          </Badge>
        );
      },
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
        const order = row.original;
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
                  onClick={() => handleViewOrder(order)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Detalles del pedido</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <Label>Cambiar Estado</Label>
                  <div className="flex flex-col gap-1 mt-1">
                    {statusOptions
                      .filter(
                        (opt) =>
                          opt.value !== "all" && opt.value !== order.status
                      )
                      .map((option) => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() =>
                            handleUpdateOrderStatus(
                              order.id,
                              option.value as Order["status"]
                            )
                          }
                        >
                          {option.label}
                        </Button>
                      ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray-50 to-gray-100 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Pedidos
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, número de pedido o tipo de operación..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {statusOptions
                            .filter((opt) => opt.value !== "all")
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-filter">Cliente</Label>
                      <Select
                        value={clientFilter}
                        onValueChange={handleClientChange}
                      >
                        <SelectTrigger id="client-filter">
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

                    <div className="space-y-2">
                      <Label htmlFor="operation-type-filter">
                        Tipo de Operación
                      </Label>
                      <Select
                        value={operationTypeFilter}
                        onValueChange={handleOperationTypeChange}
                      >
                        <SelectTrigger id="operation-type-filter">
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          {operationTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
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

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.dispatchEvent(
                            new KeyboardEvent("keydown", { key: "Escape" })
                          );
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {userLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">
                Cargando información de la empresa...
              </p>
            </div>
          ) : documentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando pedidos...</p>
            </div>
          ) : documentsError ? (
            <div className="text-center py-8">
              <div className="text-red_m mb-4">Error: {documentsError}</div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          ) : !companyId ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 mb-4">
                No se pudo determinar la empresa del usuario
              </div>
            </div>
          ) : (
            <div>
              <DataTable<Order, Order>
                columns={columns}
                data={filteredOrders}
                noResultsText="No se encontraron pedidos"
                page={1}
                setPage={() => {}}
                totalPage={1}
                total={filteredOrders.length}
                itemsPerPage={10}
                setItemsPerPage={() => {}}
              />
            </div>
          )}
        </main>
      </div>

      <DocumentDetailsModal
        documentId={selectedDocumentId}
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocumentId(null);
        }}
        title="Detalles del Pedido"
        description="Información completa del pedido seleccionado"
        itemsTitle="Productos del Pedido"
        emptyItemsMessage="No hay productos en este pedido"
        resendButtonText="Reenviar Pedido"
      />
    </div>
  );
};

export default OrdersPage;
