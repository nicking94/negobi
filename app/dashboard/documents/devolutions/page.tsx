"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  Building,
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
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export type Devolution = {
  id: string;
  client: string;
  correlative: string;
  operation_type: string;
  location: string;
  issued_date: Date;
  total: number;
  seller?: string;
  status: "pending" | "approved" | "rejected";
  bill_reference: string;
  reason: string;
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
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Datos de ejemplo para devoluciones
  const [devolutions, setDevolutions] = useState<Devolution[]>([
    {
      id: "1",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "DV053044",
      operation_type: "DÓLARES",
      location: "Sucursal Principal",
      issued_date: new Date("2025-09-02T12:24:00"),
      total: 215.08,
      seller: "Juan Pérez",
      status: "approved",
      bill_reference: "NE053044",
      reason: "Producto defectuoso",
    },
    {
      id: "2",
      client: "DISTRIBUIDORA LA ECONOMÍA, C.A.",
      correlative: "DV053045",
      operation_type: "BOLÍVARES",
      location: "Sucursal Norte",
      issued_date: new Date("2025-09-01T10:15:00"),
      total: 450.5,
      seller: "María González",
      status: "pending",
      bill_reference: "NE053045",
      reason: "Producto incorrecto",
    },
    {
      id: "3",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "DV053046",
      operation_type: "DÓLARES",
      location: "Sucursal Sur",
      issued_date: new Date("2025-08-30T15:45:00"),
      total: 1200.0,
      seller: "Carlos Rodríguez",
      status: "rejected",
      bill_reference: "NE053046",
      reason: "Solicitud fuera de plazo",
    },
    {
      id: "4",
      client: "FARMACIAS SALUD Y VIDA, C.A.",
      correlative: "DV053047",
      operation_type: "TRANSFERENCIA",
      location: "Sucursal Este",
      issued_date: new Date("2025-08-28T09:30:00"),
      total: 150.75,
      seller: "Ana Martínez",
      status: "approved",
      bill_reference: "NE053047",
      reason: "Producto vencido",
    },
    {
      id: "5",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "DV053048",
      operation_type: "DÓLARES",
      location: "Sucursal Oeste",
      issued_date: new Date("2025-08-25T14:20:00"),
      total: 890.25,
      seller: "Luis Hernández",
      status: "pending",
      bill_reference: "NE053048",
      reason: "Cambio de talla",
    },
  ]);

  const sellers = useMemo(() => {
    const uniqueSellers = Array.from(
      new Set(
        devolutions.map((devolution) => devolution.seller || "").filter(Boolean)
      )
    );
    return uniqueSellers.map((seller, index) => ({
      id: (index + 1).toString(),
      name: seller,
    }));
  }, [devolutions]);

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
          .includes(searchTerm.toLowerCase());

      // Filtrar por vendedor (si no es "todos")
      const matchesSeller =
        sellerFilter === "all" || devolution.seller === sellerFilter;

      // Filtrar por cliente (si no es "todos")
      const matchesClient =
        clientFilter === "all" || devolution.client === clientFilter;

      // Filtrar por estado (si no es "todos")
      const matchesStatus =
        statusFilter === "all" || devolution.status === statusFilter;

      // Filtrar por rango de fechas
      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (devolution.issued_date >= dateRange.from &&
          devolution.issued_date <= dateRange.to);

      return (
        matchesSearch &&
        matchesSeller &&
        matchesClient &&
        matchesStatus &&
        matchesDateRange
      );
    });
  }, [
    devolutions,
    searchTerm,
    sellerFilter,
    clientFilter,
    statusFilter,
    dateRange,
  ]);

  const handleViewDevolution = (devolution: Devolution) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green_xxl text-green_b",
      rejected: "bg-red_xxl text-red_b",
    };

    const statusText = {
      pending: "Pendiente",
      approved: "Aprobada",
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
      header: "Emitido",
      cell: ({ row }) => {
        const date = row.getValue("issued_date") as Date;
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
                  onClick={() => handleViewClientDevolutions(devolution.client)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver Devoluciones del Cliente</span>
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

      {/* Contenedor principal sin margen lateral */}
      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Devoluciones
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, correlativo, factura o tipo de operación..."
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
                  <DropdownMenuContent align="end" className="w-56">
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
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobada</SelectItem>
                          <SelectItem value="rejected">Rechazada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="date-range">Período</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                  {format(dateRange.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(dateRange.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span>Seleccionar rango de fechas</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

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
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalle de Devolución {selectedDevolution?.correlative}
            </DialogTitle>
            <DialogDescription>
              Información completa de la devolución seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedDevolution && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between border-b gap-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Información del Cliente
                  </h3>
                  <p className="text-sm">{selectedDevolution.client}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información de Venta</h3>
                  <p className="text-sm">
                    <span className="font-medium">Vendedor:</span>{" "}
                    {selectedDevolution.seller}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Ubicación:</span>{" "}
                    {selectedDevolution.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Correlativo</h3>
                  <p className="text-sm">{selectedDevolution.correlative}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Factura de Referencia</h3>
                  <p className="text-sm">{selectedDevolution.bill_reference}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo de Operación</h3>
                  <p className="text-sm">{selectedDevolution.operation_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Emisión</h3>
                  <p className="text-sm">
                    {formatDate(selectedDevolution.issued_date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado</h3>
                  <p className="text-sm">
                    {getStatusBadge(selectedDevolution.status)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Motivo de Devolución</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm">{selectedDevolution.reason}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Productos Devueltos</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-center text-gray_m">
                    Aquí iría el detalle de los productos devueltos
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>
                      {formatCurrency(selectedDevolution.total * 0.85)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">IVA (15%):</span>
                    <span>
                      {formatCurrency(selectedDevolution.total * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-medium">Total a Devolver:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedDevolution.total)}
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
              onClick={() =>
                selectedDevolution && handleResendDevolution(selectedDevolution)
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Reenviar Devolución
            </Button>
            {selectedDevolution?.status === "pending" && (
              <Button
                type="button"
                onClick={() =>
                  selectedDevolution &&
                  handleProcessDevolution(selectedDevolution)
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Procesar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver devoluciones del cliente */}
      <Dialog
        open={isClientDevolutionsDialogOpen}
        onOpenChange={setIsClientDevolutionsDialogOpen}
      >
        <DialogContent className="w-full bg-white  sm:max-w-[800px] md:max-w-[75vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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
                          {formatCurrency(devolution.total)}
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
