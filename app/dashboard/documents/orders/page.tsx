// pages/orders/OrdersPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  FileText,
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
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/orders/useOrders";
import {
  Order as ApiOrder,
  ORDER_STATUSES,
} from "@/services/orders/orders.service";
import useGetAllCompanies from "@/hooks/companies/useGetAllCompanies";
import { SelectSearchable } from "@/components/ui/select-searchable";
import { DocumentDetailsModal } from "@/components/dashboard/documentDetailsModal";

// Fixed OrderItem type with id property
export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

// Tipo Order basado en la API
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
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientOrdersDialogOpen, setIsClientOrdersDialogOpen] =
    useState(false);
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  // Obtener las empresas
  const { companies: companiesResponse } = useGetAllCompanies();

  // 🔴 USAR EL HOOK SIN FILTRO company_id
  const {
    orders: apiOrders,
    loading: ordersLoading,
    error: ordersError,
    updateOrderStatus,
  } = useOrders(); // Sin filtros

  // Mapear los pedidos de la API al formato local CON FILTRADO POR COMPAÑÍA
  const orders: Order[] = useMemo(() => {
    if (!apiOrders || !Array.isArray(apiOrders)) {
      console.warn("⚠️ apiOrders no es un array o está vacío:", apiOrders);
      return [];
    }

    console.log("🟡 Pedidos recibidos de la API:", apiOrders.length);
    console.log("🟡 Company ID seleccionado:", selectedCompanyId);

    // 🔴 FILTRAR POR COMPAÑÍA EN EL FRONTEND
    const filteredByCompany = selectedCompanyId
      ? apiOrders.filter(
          (order: ApiOrder) => order.company_id === selectedCompanyId
        )
      : apiOrders;

    console.log("🟢 Pedidos después del filtro:", filteredByCompany.length);

    return filteredByCompany.map((order: ApiOrder) => {
      // Para datos de ejemplo mientras se resuelve la estructura real de la API
      const isSampleData = !order.client_id && !order.salesperson_id;

      return {
        id: order.id.toString(),
        order_number: order.order_number || `ORD-${order.id}`,
        client: isSampleData
          ? `Cliente ${order.id}`
          : `Cliente ${order.client_id}` || "Cliente no especificado",
        client_id: order.client_id,
        order_date: new Date(order.order_date || new Date()),
        delivery_date: order.transaction_date
          ? new Date(order.transaction_date)
          : null,
        operation_type: order.order_type || "Venta",
        operation_type_id: order.operation_type_id,
        items: order.items?.map((item, index) => ({
          id: item.id?.toString() || `item-${order.id}-${index}`,
          product_name: item.description || `Producto ${index + 1}`,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total: item.total_amount || 0,
        })) || [
          {
            id: `item-${order.id}-1`,
            product_name: "Producto de ejemplo",
            quantity: 1,
            unit_price: order.total_amount || 100,
            total: order.total_amount || 100,
          },
        ],
        total: order.total_amount || 0,
        total_amount: order.total_amount || 0,
        status: mapApiStatusToLocalStatus(order.status),
        seller: isSampleData
          ? `Vendedor ${order.id}`
          : `Vendedor ${order.salesperson_id}` || "No especificado",
        salesperson_id: order.salesperson_id,
        location:
          `Almacén ${order.warehouse_id || order.id}` ||
          "Ubicación no especificada",
        warehouse_id: order.warehouse_id,
        notes: order.notes || "Sin notas",
        company_id: order.company_id,
      };
    });
  }, [apiOrders, selectedCompanyId]); // 🔴 AGREGAR selectedCompanyId COMO DEPENDENCIA

  // Mapear estados de la API a estados locales
  const mapApiStatusToLocalStatus = (apiStatus: string): Order["status"] => {
    switch (apiStatus) {
      case ORDER_STATUSES.PENDING:
        return "pending";
      case ORDER_STATUSES.PROCESSED:
        return "processing";
      case ORDER_STATUSES.COMPLETED:
        return "completed";
      case ORDER_STATUSES.CANCELLED:
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Mapear estados locales a estados de la API
  const mapLocalStatusToApiStatus = (localStatus: Order["status"]): string => {
    switch (localStatus) {
      case "pending":
        return ORDER_STATUSES.PENDING;
      case "processing":
        return ORDER_STATUSES.PROCESSED;
      case "completed":
        return ORDER_STATUSES.COMPLETED;
      case "cancelled":
        return ORDER_STATUSES.CANCELLED;
      default:
        return ORDER_STATUSES.PENDING;
    }
  };

  // Fixed getStatusVariant function to use valid Badge variants
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

  // Alternative approach: Create a custom className for success state
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

  const companyOptions = useMemo(() => {
    return companiesResponse.map((company) => ({
      value: company.id.toString(),
      label: company.name,
    }));
  }, [companiesResponse]);

  // Efecto para seleccionar automáticamente la primera compañía
  useEffect(() => {
    if (companiesResponse.length > 0 && !selectedCompanyId) {
      const firstCompany = companiesResponse[0];
      console.log(
        "🟢 Seleccionando primera compañía automáticamente:",
        firstCompany
      );
      setSelectedCompanyId(firstCompany.id);
    }
  }, [companiesResponse, selectedCompanyId]);

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

  // Obtener pedidos de un cliente específico
  const getClientOrders = (clientName: string) => {
    return orders.filter((order) => order.client === clientName);
  };

  // Filtrar pedidos según los criterios
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.operation_type.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por cliente (si no es "todos")
      const matchesClient =
        clientFilter === "all" || order.client === clientFilter;

      // Filtrar por estado (si no es "todos")
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      // Filtrar por tipo de operación (si no es "todos")
      const matchesOperationType =
        operationTypeFilter === "all" ||
        order.operation_type === operationTypeFilter;

      // Filtrar por rango de fechas
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
    setIsViewDialogOpen(true);
  };

  const handleViewDocument = (order: Order) => {
    setSelectedDocumentId(order.id);
    setIsDocumentModalOpen(true);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const apiStatus = mapLocalStatusToApiStatus(newStatus);
      const result = await updateOrderStatus(orderId, apiStatus as any);

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

  const handleViewClientOrders = (client: string) => {
    setSelectedClient(client);
    setIsClientOrdersDialogOpen(true);
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
        return <div className="font-medium">{formatCurrency(total)}</div>;
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
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewDocument(order)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver Documento</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewClientOrders(order.client)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver Pedidos del Cliente</span>
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
            {/* 🔴 AGREGAR INFO DE DEBUG */}
            <div className="text-sm text-gray-500">
              {selectedCompanyId
                ? `Compañía: ${selectedCompanyId} | `
                : "Todas las compañías | "}
              Pedidos: {orders.length} | Cargando: {ordersLoading ? "Sí" : "No"}
              {ordersError && ` | Error: ${ordersError}`}
            </div>
          </div>

          {/* Filtros y selección de empresa */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
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

                    <div className="px-2 py-1.5">
                      <Label htmlFor="operation-type-filter">
                        Tipo de Operación
                      </Label>
                      <Select
                        value={operationTypeFilter}
                        onValueChange={setOperationTypeFilter}
                      >
                        <SelectTrigger
                          id="operation-type-filter"
                          className="mt-1"
                        >
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

            <div className="flex items-center gap-2">
              <Label htmlFor="company-selector" className="text-sm font-medium">
                Empresa:
              </Label>
              <div className="flex items-center gap-2">
                <SelectSearchable
                  value={selectedCompanyId?.toString() || ""}
                  onValueChange={(value) => {
                    const companyId = value ? Number(value) : null;
                    console.log("🟢 Usuario seleccionó compañía:", companyId);
                    setSelectedCompanyId(companyId);
                  }}
                  placeholder="Buscar empresa..."
                  options={companyOptions}
                  emptyMessage="No se encontraron empresas."
                  searchPlaceholder="Buscar empresa por nombre..."
                  className="w-full md:w-64"
                />
                {/* 🔴 BOTÓN PARA MOSTRAR TODAS LAS EMPRESAS */}
                {selectedCompanyId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("🟢 Mostrando todas las compañías");
                      setSelectedCompanyId(null);
                    }}
                  >
                    Todas
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 🔴 TABLA DE PEDIDOS ACTUALIZADA */}
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando pedidos...</p>
            </div>
          ) : ordersError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">Error: {ordersError}</div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                {selectedCompanyId
                  ? `Mostrando ${filteredOrders.length} pedidos de la compañía seleccionada`
                  : `Mostrando ${filteredOrders.length} pedidos de todas las compañías`}
              </div>
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

      {/* Modal para ver detalle de pedido */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalle de Pedido {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Información completa del pedido seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-4 py-4">
              {/* Información del cliente y estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold mb-2">
                    Información del Cliente
                  </h3>
                  <p className="text-sm">{selectedOrder.client}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Vendedor:</span>{" "}
                    {selectedOrder.seller}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado del Pedido</h3>
                  <Badge
                    variant={getStatusVariant(selectedOrder.status)}
                    className={getStatusClassName(selectedOrder.status)}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Número de Pedido</h3>
                  <p className="text-sm">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo de Operación</h3>
                  <p className="text-sm">{selectedOrder.operation_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Pedido</h3>
                  <p className="text-sm">
                    {formatDate(selectedOrder.order_date)}
                  </p>
                </div>
              </div>

              {/* Ubicación y entrega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Ubicación</h3>
                  <p className="text-sm">{selectedOrder.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Entrega</h3>
                  <p className="text-sm">
                    {formatDate(selectedOrder.delivery_date)}
                  </p>
                </div>
              </div>

              {/* Productos */}
              {selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Productos</h3>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-3">Producto</th>
                          <th className="text-center p-3">Cantidad</th>
                          <th className="text-right p-3">Precio Unitario</th>
                          <th className="text-right p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-200"
                          >
                            <td className="p-3">{item.product_name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-sm bg-yellow-50 p-3 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleViewDocument(selectedOrder!);
                setIsViewDialogOpen(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver pedidos del cliente */}
      <Dialog
        open={isClientOrdersDialogOpen}
        onOpenChange={setIsClientOrdersDialogOpen}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Pedidos de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista de pedidos del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Número</th>
                      <th className="px-4 py-2 text-left">Tipo Operación</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientOrders(selectedClient).map((order) => (
                      <tr key={order.id}>
                        <td className="border border-gray-200 px-4 py-2">
                          {order.order_number}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {order.operation_type}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {formatDate(order.order_date)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className={getStatusClassName(order.status)}
                          >
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(order)}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Documento</span>
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
              onClick={() => setIsClientOrdersDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Documento */}
      <DocumentDetailsModal
        documentId={selectedDocumentId}
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocumentId(null);
        }}
      />
    </div>
  );
};

export default OrdersPage;
