"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  Truck,
  Building,
  Package,
  Calendar,
  Hash,
  Receipt,
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
import useGetClients from "@/hooks/clients/useGetClients";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/hooks/currencies/useCurrencyFormatter"; // Importar el hook
import { PriceDisplay } from "@/components/PriceDisplay"; // Importar el componente

export type DeliveryNote = {
  id: string;
  client: string;
  correlative: string;
  operation_type: string;
  location: string;
  issued_date: Date;
  total: number;
  seller?: string;
  status: "pending" | "delivered" | "cancelled" | "in_transit";
  bill_reference?: string;
  delivery_address: string;
  contact_person: string;
  contact_phone: string;
  notes?: string;
};

const DeliveryNotesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedDeliveryNote, setSelectedDeliveryNote] =
    useState<DeliveryNote | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Usar el hook de formateo de moneda
  const { formatPrice, formatForTable, getNumericValue } =
    useCurrencyFormatter();

  const { clientsResponse, loading: clientsLoading } = useGetClients({
    search: searchTerm,
  });

  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);

  // Componentes auxiliares (deberían estar en un archivo separado o en el mismo)
  const InfoRow = ({
    label,
    value,
    valueClass = "",
  }: {
    label: string;
    value: React.ReactNode;
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

  useEffect(() => {
    if (clientsResponse && clientsResponse.length > 0) {
      const mockNotes: DeliveryNote[] = clientsResponse.flatMap(
        (client, index) => {
          const notesForClient = [];

          // Cada cliente tendrá entre 1-3 notas de entrega
          const noteCount = Math.floor(Math.random() * 3) + 1;

          for (let i = 0; i < noteCount; i++) {
            const statuses: Array<
              "pending" | "delivered" | "cancelled" | "in_transit"
            > = ["pending", "delivered", "in_transit", "cancelled"];
            const randomStatus =
              statuses[Math.floor(Math.random() * statuses.length)];

            notesForClient.push({
              id: `${client.id}-${i + 1}`,
              client: client.legal_name, // Usar el nombre legal del cliente real
              correlative: `NE${String(clientsResponse.length + index).padStart(
                5,
                "0"
              )}${i + 1}`,
              operation_type: Math.random() > 0.5 ? "DÓLARES" : "BOLÍVARES",
              location: [
                "Sucursal Principal",
                "Sucursal Norte",
                "Sucursal Sur",
              ][i % 3],
              issued_date: new Date(
                new Date().setDate(
                  new Date().getDate() - Math.floor(Math.random() * 30)
                )
              ),
              total: Math.random() * 5000 + 1000,
              seller: client.contact_person || "Vendedor Principal",
              status: randomStatus,
              bill_reference: `FV${String(
                clientsResponse.length + index
              ).padStart(5, "0")}${i + 1}`,
              delivery_address:
                client.delivery_address || "Dirección no especificada",
              contact_person: client.contact_person || "Contacto Principal",
              contact_phone:
                client.contact_phone || client.main_phone || "Sin teléfono",
              notes: `Nota de entrega para ${client.legal_name}`,
            });
          }

          return notesForClient;
        }
      );

      setDeliveryNotes(mockNotes);
    }
  }, [clientsResponse]);

  // Obtener lista de clientes únicos desde los clientes reales
  const clients = useMemo(() => {
    if (!clientsResponse || clientsResponse.length === 0) {
      return [];
    }

    return clientsResponse.map((client) => ({
      id: client.id || `temp-${client.client_code}`,
      name: client.legal_name,
      originalClient: client,
    }));
  }, [clientsResponse]);

  // Filtrar notas de entrega según los criterios
  const filteredDeliveryNotes = useMemo(() => {
    let filteredNotes = deliveryNotes;

    // Filtrar por cliente seleccionado
    if (clientFilter !== "all") {
      const selectedClientName = clients.find(
        (c) => c.id === clientFilter
      )?.name;
      filteredNotes = filteredNotes.filter(
        (note) => note.client === selectedClientName
      );
    }

    // Filtrar por estado (si no es "todos")
    if (statusFilter !== "all") {
      filteredNotes = filteredNotes.filter(
        (note) => note.status === statusFilter
      );
    }

    // Filtrar por rango de fechas
    if (dateRange?.from && dateRange?.to) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.issued_date >= dateRange.from! &&
          note.issued_date <= dateRange.to!
      );
    }

    return filteredNotes;
  }, [deliveryNotes, clientFilter, statusFilter, dateRange, clients]);

  const handleViewDeliveryNote = (note: DeliveryNote) => {
    setSelectedDeliveryNote(note);
    setIsViewDialogOpen(true);
  };

  const handleResendDeliveryNote = (note: DeliveryNote) => {
    toast.success(`Nota de entrega ${note.correlative} reenviada exitosamente`);
  };

  const handleProcessDeliveryNote = (note: DeliveryNote) => {
    toast.success(`Nota de entrega ${note.correlative} procesada exitosamente`);
  };

  // REMOVER la función formatCurrency anterior
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green_xxl text-green_b",
      cancelled: "bg-red_xxl text-red_b",
      in_transit: "bg-blue-100 text-blue-800",
    };

    const statusText = {
      pending: "Pendiente",
      delivered: "Entregado",
      cancelled: "Cancelado",
      in_transit: "En tránsito",
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

  const columns: ColumnDef<DeliveryNote>[] = [
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
        // Usar PriceDisplay en lugar de formatCurrency
        return <PriceDisplay value={total} variant="table" />;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <div className="font-medium">{getStatusBadge(status)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const note = row.original;
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
                  onClick={() => handleViewDeliveryNote(note)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleResendDeliveryNote(note)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Reenviar</span>
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
              Notas de Entrega
            </h1>
          </div>

          {/* Búsqueda y Filtros - REORGANIZADO como en sucursales */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar notas de entrega..."
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
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_transit">
                            En tránsito
                          </SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
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

            {/* Selector de Cliente a la DERECHA como en sucursales */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="client-selector"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Filtrar por Cliente:
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={clientFilter}
                    onValueChange={setClientFilter}
                    disabled={clientsLoading}
                  >
                    <SelectTrigger
                      id="client-selector"
                      className="w-full md:w-64"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      <SelectValue
                        placeholder={
                          clientsLoading
                            ? "Cargando clientes..."
                            : "Todos los clientes"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {clientsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green_m mx-auto"></div>
              <p className="text-gray-600 mt-2">
                Cargando clientes y notas de entrega...
              </p>
            </div>
          )}

          {/* Tabla de notas de entrega */}
          {!clientsLoading && (
            <DataTable<DeliveryNote, DeliveryNote>
              columns={columns}
              data={filteredDeliveryNotes}
              noResultsText="No se encontraron notas de entrega"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={filteredDeliveryNotes.length}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          )}
        </main>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-gray_xxl border border-gray-200 sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-2">
          <DialogHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    Detalle de Nota de Entrega
                    {selectedDeliveryNote && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedDeliveryNote.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedDeliveryNote.status === "delivered"
                            ? "bg-green_xxl text-green_b"
                            : selectedDeliveryNote.status === "cancelled"
                            ? "bg-red_xxl text-red_b"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedDeliveryNote.status === "pending"
                          ? "Pendiente"
                          : selectedDeliveryNote.status === "delivered"
                          ? "Entregado"
                          : selectedDeliveryNote.status === "cancelled"
                          ? "Cancelado"
                          : "En tránsito"}
                      </span>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Información completa de la nota de entrega
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedDeliveryNote && (
            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Hash className="h-5 w-5 text-green_m" />
                    <div>
                      <p className="text-sm text-gray-600">Correlativo</p>
                      <p className="font-bold text-green_b">
                        {selectedDeliveryNote.correlative}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green_m" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Emisión</p>
                      <p className="font-medium text-green_b">
                        {formatDate(selectedDeliveryNote.issued_date)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-green_m" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Factura Referencia
                      </p>
                      <p className="font-medium text-green_b">
                        {selectedDeliveryNote.bill_reference || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cliente y Vendedor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard title="Información del Cliente">
                  <div className="space-y-2">
                    <InfoRow
                      label="Nombre"
                      value={selectedDeliveryNote.client}
                    />
                    <InfoRow
                      label="Dirección"
                      value={selectedDeliveryNote.delivery_address}
                    />
                  </div>
                </InfoCard>

                <InfoCard title="Información de Venta">
                  <div className="space-y-2">
                    <InfoRow
                      label="Vendedor"
                      value={selectedDeliveryNote.seller || "No especificado"}
                    />
                    <InfoRow
                      label="Ubicación"
                      value={selectedDeliveryNote.location}
                    />
                    <InfoRow
                      label="Tipo de Operación"
                      value={selectedDeliveryNote.operation_type}
                    />
                  </div>
                </InfoCard>
              </div>

              {/* Información de Contacto */}
              <InfoCard title="Información de Contacto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InfoRow
                      label="Persona de Contacto"
                      value={selectedDeliveryNote.contact_person}
                    />
                  </div>
                  <div className="space-y-2">
                    <InfoRow
                      label="Teléfono"
                      value={selectedDeliveryNote.contact_phone}
                      valueClass="text-blue-600"
                    />
                  </div>
                </div>
              </InfoCard>

              {/* Notas */}
              {selectedDeliveryNote.notes && (
                <InfoCard title="Notas">
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    {selectedDeliveryNote.notes}
                  </p>
                </InfoCard>
              )}

              {/* Productos */}
              <InfoCard title="Productos a Entregar">
                <div className="bg-gray-50 rounded-md p-6 text-center border border-gray-200">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    Detalle de productos por implementar
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Aquí se mostrará la lista de productos asociados a esta
                    entrega
                  </p>
                </div>
              </InfoCard>

              {/* Resumen Financiero */}
              <InfoCard title="Resumen Financiero">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <InfoRow
                        label="Subtotal"
                        // Usar PriceDisplay para subtotal
                        value={
                          <PriceDisplay
                            value={selectedDeliveryNote.total * 0.85}
                            variant="default"
                          />
                        }
                      />
                      <InfoRow
                        label="IVA (15%)"
                        // Usar PriceDisplay para IVA
                        value={
                          <PriceDisplay
                            value={selectedDeliveryNote.total * 0.15}
                            variant="default"
                          />
                        }
                        valueClass="text-blue-600"
                      />
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-900">Total</span>
                        {/* Usar PriceDisplay para el total */}
                        <PriceDisplay
                          value={selectedDeliveryNote.total}
                          variant="summary"
                          className="font-bold text-lg text-green-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>

            {selectedDeliveryNote?.status === "pending" && (
              <Button
                type="button"
                onClick={() =>
                  selectedDeliveryNote &&
                  handleProcessDeliveryNote(selectedDeliveryNote)
                }
              >
                <Truck className="h-4 w-4 mr-2" />
                Marcar como Enviado
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryNotesPage;
