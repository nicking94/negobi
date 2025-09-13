"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  FileText,
  Package,
  Truck,
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

export type Order = {
  id: string;
  order_number: string;
  client: string;
  order_date: Date;
  delivery_date: Date | null;
  operation_type: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  seller?: string;
  location: string;
  notes?: string;
};

export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

const OrdersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientOrdersDialogOpen, setIsClientOrdersDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Datos de ejemplo para pedidos
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      order_number: "ORD-001",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      order_date: new Date("2025-09-02T12:24:00"),
      delivery_date: new Date("2025-09-05T10:00:00"),
      operation_type: "DÓLARES",
      items: [
        {
          id: "1",
          product_name: "Arroz Premium 5kg",
          quantity: 10,
          unit_price: 5.5,
          total: 55,
        },
        {
          id: "2",
          product_name: "Aceite de Oliva 1L",
          quantity: 5,
          unit_price: 12.8,
          total: 64,
        },
      ],
      total: 119,
      seller: "Juan Pérez",
      location: "Sucursal Principal",
      status: "processing",
      notes: "Entregar antes del mediodía",
    },
    {
      id: "2",
      order_number: "ORD-002",
      client: "DISTRIBUIDORA LA ECONOMÍA, C.A.",
      order_date: new Date("2025-09-01T10:15:00"),
      delivery_date: new Date("2025-09-03T14:30:00"),
      operation_type: "BOLÍVARES",
      items: [
        {
          id: "3",
          product_name: "Azúcar Refinada 2kg",
          quantity: 20,
          unit_price: 3.2,
          total: 64,
        },
        {
          id: "4",
          product_name: "Harina de Trigo 1kg",
          quantity: 15,
          unit_price: 2.5,
          total: 37.5,
        },
        {
          id: "5",
          product_name: "Leche en Polvo 400g",
          quantity: 8,
          unit_price: 7.8,
          total: 62.4,
        },
      ],
      total: 163.9,
      seller: "María González",
      location: "Sucursal Norte",
      status: "shipped",
    },
    {
      id: "3",
      order_number: "ORD-003",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      order_date: new Date("2025-08-30T15:45:00"),
      delivery_date: new Date("2025-09-02T09:00:00"),
      operation_type: "TRANSFERENCIA",
      items: [
        {
          id: "6",
          product_name: "Café Molido 500g",
          quantity: 12,
          unit_price: 8.5,
          total: 102,
        },
      ],
      total: 102,
      seller: "Carlos Rodríguez",
      location: "Sucursal Sur",
      status: "delivered",
    },
    {
      id: "4",
      order_number: "ORD-004",
      client: "FARMACIAS SALUD Y VIDA, C.A.",
      order_date: new Date("2025-08-28T09:30:00"),
      delivery_date: null,
      operation_type: "DÓLARES",
      items: [
        {
          id: "7",
          product_name: "Agua Mineral 500ml",
          quantity: 50,
          unit_price: 0.9,
          total: 45,
        },
        {
          id: "8",
          product_name: "Jugo de Naranja 1L",
          quantity: 25,
          unit_price: 2.3,
          total: 57.5,
        },
      ],
      total: 102.5,
      seller: "Ana Martínez",
      location: "Sucursal Este",
      status: "pending",
    },
    {
      id: "5",
      order_number: "ORD-005",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      order_date: new Date("2025-08-25T14:20:00"),
      delivery_date: null,
      operation_type: "BOLÍVARES",
      items: [
        {
          id: "9",
          product_name: "Pasta Spaghetti 500g",
          quantity: 30,
          unit_price: 1.8,
          total: 54,
        },
        {
          id: "10",
          product_name: "Salsa de Tomate 400g",
          quantity: 20,
          unit_price: 2.1,
          total: 42,
        },
        {
          id: "11",
          product_name: "Atún en Lata 200g",
          quantity: 15,
          unit_price: 3.5,
          total: 52.5,
        },
      ],
      total: 148.5,
      seller: "Luis Hernández",
      location: "Sucursal Oeste",
      status: "cancelled",
    },
  ]);

  const sellers = useMemo(() => {
    const uniqueSellers = Array.from(
      new Set(orders.map((order) => order.seller || "").filter(Boolean))
    );
    return uniqueSellers.map((seller, index) => ({
      id: (index + 1).toString(),
      name: seller,
    }));
  }, [orders]);

  const clients = useMemo(() => {
    const uniqueClients = Array.from(
      new Set(orders.map((order) => order.client))
    );
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [orders]);

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "En proceso" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregado" },
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

      // Filtrar por vendedor (si no es "todos")
      const matchesSeller =
        sellerFilter === "all" || order.seller === sellerFilter;

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
        matchesSeller &&
        matchesClient &&
        matchesStatus &&
        matchesOperationType &&
        matchesDateRange
      );
    });
  }, [
    orders,
    searchTerm,
    sellerFilter,
    clientFilter,
    statusFilter,
    operationTypeFilter,
    dateRange,
  ]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success(
      `Estado del pedido actualizado a ${getStatusLabel(newStatus)}`
    );
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
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
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
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendiente";
    }
  };

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const columns: ColumnDef<Order>[] = [
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
      accessorKey: "order_number",
      header: "Correlativo",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("order_number")}</div>
          <div className="text-xs text-gray_m">
            {formatDate(row.original.order_date)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "operation_type",
      header: "Tipo Operación",
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
      accessorKey: "order_date",
      header: "Emitido",
      cell: ({ row }) => {
        const date = row.getValue("order_date") as Date;
        return <div className="font-medium">{formatDate(date)}</div>;
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
              Pedidos
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, correlativo o tipo de operación..."
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
                      <Label htmlFor="seller-filter">Vendedor</Label>
                      <Select
                        value={sellerFilter}
                        onValueChange={setSellerFilter}
                      >
                        <SelectTrigger id="seller-filter" className="mt-1">
                          <SelectValue placeholder="Todos los vendedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los vendedores
                          </SelectItem>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.id} value={seller.name}>
                              {seller.name}
                            </SelectItem>
                          ))}
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
        </main>
      </div>

      {/* Modal para ver detalle de pedido */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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
              <div className="flex items-center justify-between border-b gap-4">
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
                  <h3 className="font-semibold mb-2">Información de Entrega</h3>
                  <p className="text-sm">
                    <span className="font-medium">Ubicación:</span>{" "}
                    {selectedOrder.location}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Fecha de entrega:</span>{" "}
                    {formatDate(selectedOrder.delivery_date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado del Pedido</h3>
                  <Badge
                    variant={getStatusVariant(selectedOrder.status)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <div className="border border-green_m rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-green_m text-white">
                      <tr>
                        <th className="text-left p-3">Producto</th>
                        <th className="text-center p-3">Cantidad</th>
                        <th className="text-right p-3">Precio Unitario</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="border-t">
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

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-sm bg-gray_xxl p-3 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

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
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver pedidos del cliente */}
      <Dialog
        open={isClientOrdersDialogOpen}
        onOpenChange={setIsClientOrdersDialogOpen}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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
                <table className="w-full border-collapse border border-green_m">
                  <thead>
                    <tr className="bg-green_m text-white">
                      <th className=" px-4 py-2 text-left">Correlativo</th>
                      <th className=" px-4 py-2 text-left">Tipo Operación</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className=" px-4 py-2 text-left">Estado</th>
                      <th className=" px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientOrders(selectedClient).map((order) => (
                      <tr key={order.id}>
                        <td className="border border-gray_xl px-4 py-2">
                          {order.order_number}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          {order.operation_type}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          {formatDate(order.order_date)}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="border border-gray_xl px-4 py-2">
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver</span>
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
    </div>
  );
};

export default OrdersPage;
