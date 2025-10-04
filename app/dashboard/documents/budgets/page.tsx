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

export type Budget = {
  id: string;
  client: string;
  correlative: string;
  operation_type: string;
  location: string;
  issued_date: Date;
  total: number;
  seller?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  bill_reference?: string;
  validity_days: number;
  notes?: string;
};

const BudgetsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientBudgetsDialogOpen, setIsClientBudgetsDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Datos de ejemplo para presupuestos
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "PR053044",
      operation_type: "DÓLARES",
      location: "Sucursal Principal",
      issued_date: new Date("2025-09-02T12:24:00"),
      total: 2150.08,
      seller: "Juan Pérez",
      status: "approved",
      bill_reference: "NE053044",
      validity_days: 30,
      notes: "Presupuesto para productos de limpieza",
    },
    {
      id: "2",
      client: "DISTRIBUIDORA LA ECONOMÍA, C.A.",
      correlative: "PR053045",
      operation_type: "BOLÍVARES",
      location: "Sucursal Norte",
      issued_date: new Date("2025-09-01T10:15:00"),
      total: 4500.5,
      seller: "María González",
      status: "pending",
      validity_days: 15,
      notes: "Presupuesto para equipos de oficina",
    },
    {
      id: "3",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "PR053046",
      operation_type: "DÓLARES",
      location: "Sucursal Sur",
      issued_date: new Date("2025-08-30T15:45:00"),
      total: 12000.0,
      seller: "Carlos Rodríguez",
      status: "expired",
      validity_days: 7,
      notes: "Presupuesto para mobiliario",
    },
    {
      id: "4",
      client: "FARMACIAS SALUD Y VIDA, C.A.",
      correlative: "PR053047",
      operation_type: "TRANSFERENCIA",
      location: "Sucursal Este",
      issued_date: new Date("2025-08-28T09:30:00"),
      total: 1500.75,
      seller: "Ana Martínez",
      status: "approved",
      bill_reference: "NE053047",
      validity_days: 20,
      notes: "Presupuesto para productos farmacéuticos",
    },
    {
      id: "5",
      client: "AUTOMERCADO NIE CENTER, C.A.",
      correlative: "PR053048",
      operation_type: "DÓLARES",
      location: "Sucursal Oeste",
      issued_date: new Date("2025-08-25T14:20:00"),
      total: 8900.25,
      seller: "Luis Hernández",
      status: "pending",
      validity_days: 10,
      notes: "Presupuesto para equipos de refrigeración",
    },
  ]);

  const sellers = useMemo(() => {
    const uniqueSellers = Array.from(
      new Set(budgets.map((budget) => budget.seller || "").filter(Boolean))
    );
    return uniqueSellers.map((seller, index) => ({
      id: (index + 1).toString(),
      name: seller,
    }));
  }, [budgets]);

  const clients = useMemo(() => {
    const uniqueClients = Array.from(
      new Set(budgets.map((budget) => budget.client))
    );
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [budgets]);

  // Obtener presupuestos de un cliente específico
  const getClientBudgets = (clientName: string) => {
    return budgets.filter((budget) => budget.client === clientName);
  };

  // Filtrar presupuestos según los criterios
  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const matchesSearch =
        budget.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.correlative.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.operation_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (budget.bill_reference &&
          budget.bill_reference
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Filtrar por vendedor (si no es "todos")
      const matchesSeller =
        sellerFilter === "all" || budget.seller === sellerFilter;

      // Filtrar por cliente (si no es "todos")
      const matchesClient =
        clientFilter === "all" || budget.client === clientFilter;

      // Filtrar por estado (si no es "todos")
      const matchesStatus =
        statusFilter === "all" || budget.status === statusFilter;

      // Filtrar por rango de fechas
      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (budget.issued_date >= dateRange.from &&
          budget.issued_date <= dateRange.to);

      return (
        matchesSearch &&
        matchesSeller &&
        matchesClient &&
        matchesStatus &&
        matchesDateRange
      );
    });
  }, [
    budgets,
    searchTerm,
    sellerFilter,
    clientFilter,
    statusFilter,
    dateRange,
  ]);

  const handleViewBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsViewDialogOpen(true);
  };

  const handleResendBudget = (budget: Budget) => {
    toast.success(`Presupuesto ${budget.correlative} reenviado exitosamente`);
  };

  const handleViewClientBudgets = (client: string) => {
    setSelectedClient(client);
    setIsClientBudgetsDialogOpen(true);
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
      expired: "bg-gray-100 text-gray-800",
    };

    const statusText = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      expired: "Expirado",
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

  const columns: ColumnDef<Budget>[] = [
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
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const budget = row.original;
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
                  onClick={() => handleViewClientBudgets(budget.client)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver Presupuestos del Cliente</span>
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
              Presupuestos
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
                  <DropdownMenuContent align="end" className="w-[18rem]">
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
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
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
                          placeholderText="Seleccionar rango de fechas"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <DataTable<Budget, Budget>
            columns={columns}
            data={filteredBudgets}
            noResultsText="No se encontraron presupuestos"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredBudgets.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalle de Presupuesto {selectedBudget?.correlative}
            </DialogTitle>
            <DialogDescription>
              Información completa del presupuesto seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedBudget && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between border-b gap-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Información del Cliente
                  </h3>
                  <p className="text-sm">{selectedBudget.client}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información de Venta</h3>
                  <p className="text-sm">
                    <span className="font-medium">Vendedor:</span>{" "}
                    {selectedBudget.seller}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Ubicación:</span>{" "}
                    {selectedBudget.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Correlativo</h3>
                  <p className="text-sm">{selectedBudget.correlative}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Factura de Referencia</h3>
                  <p className="text-sm">
                    {selectedBudget.bill_reference || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo de Operación</h3>
                  <p className="text-sm">{selectedBudget.operation_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Emisión</h3>
                  <p className="text-sm">
                    {formatDate(selectedBudget.issued_date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado</h3>
                  <p className="text-sm">
                    {getStatusBadge(selectedBudget.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Validez (días)</h3>
                  <p className="text-sm">{selectedBudget.validity_days} días</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Vencimiento</h3>
                  <p className="text-sm">
                    {format(
                      new Date(
                        selectedBudget.issued_date.getTime() +
                          selectedBudget.validity_days * 24 * 60 * 60 * 1000
                      ),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Notas</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm">
                    {selectedBudget.notes || "Sin notas"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Productos/Servicios</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-center text-gray_m">
                    Aquí iría el detalle de los productos o servicios
                    presupuestados
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(selectedBudget.total * 0.85)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">IVA (15%):</span>
                    <span>{formatCurrency(selectedBudget.total * 0.15)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedBudget.total)}
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

      {/* Modal para ver presupuestos del cliente */}
      <Dialog
        open={isClientBudgetsDialogOpen}
        onOpenChange={setIsClientBudgetsDialogOpen}
      >
        <DialogContent className="w-full bg-white  sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Presupuestos de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista de presupuestos del cliente seleccionado
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
                    {getClientBudgets(selectedClient).map((budget) => (
                      <tr key={budget.id}>
                        <td className="border border-gray_l px-4 py-2">
                          {budget.correlative}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {budget.bill_reference || "N/A"}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatDate(budget.issued_date)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatCurrency(budget.total)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {getStatusBadge(budget.status)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBudget(budget)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Presupuesto</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendBudget(budget)}
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
              onClick={() => setIsClientBudgetsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetsPage;
