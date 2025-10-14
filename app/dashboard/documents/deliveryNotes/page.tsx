"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  FileText,
  Truck,
  Building,
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
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientDeliveryNotesDialogOpen, setIsClientDeliveryNotesDialogOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Obtener clientes reales desde la API
  const {
    clientsResponse,
    loading: clientsLoading,
    setModified,
  } = useGetClients({
    search: searchTerm,
  });

  // Datos de ejemplo para notas de entrega - ahora conectados con clientes reales
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);

  // Actualizar las notas de entrega cuando cambian los clientes
  useEffect(() => {
    if (clientsResponse && clientsResponse.length > 0) {
      // Crear notas de entrega mock basadas en los clientes reales
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

  // Obtener notas de entrega de un cliente específico
  const getClientDeliveryNotes = (clientName: string) => {
    return deliveryNotes.filter((note) => note.client === clientName);
  };

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

  const handleViewClientDeliveryNotes = (client: string) => {
    setSelectedClient(client);
    setIsClientDeliveryNotesDialogOpen(true);
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

  // Obtener el nombre del cliente seleccionado
  const selectedClientName = useMemo(() => {
    if (clientFilter === "all") return null;
    return clients.find((c) => c.id === clientFilter)?.name || null;
  }, [clientFilter, clients]);

  // Configuración de columnas para la tabla
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
        return <div className="font-medium">{formatCurrency(total)}</div>;
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

      {/* Modal para ver detalle de nota de entrega */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalle de Nota de Entrega {selectedDeliveryNote?.correlative}
            </DialogTitle>
            <DialogDescription>
              Información completa de la nota de entrega seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedDeliveryNote && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between border-b gap-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Información del Cliente
                  </h3>
                  <p className="text-sm">{selectedDeliveryNote.client}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información de Venta</h3>
                  <p className="text-sm">
                    <span className="font-medium">Vendedor:</span>{" "}
                    {selectedDeliveryNote.seller}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Ubicación:</span>{" "}
                    {selectedDeliveryNote.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Correlativo</h3>
                  <p className="text-sm">{selectedDeliveryNote.correlative}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Factura de Referencia</h3>
                  <p className="text-sm">
                    {selectedDeliveryNote.bill_reference || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo de Operación</h3>
                  <p className="text-sm">
                    {selectedDeliveryNote.operation_type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Emisión</h3>
                  <p className="text-sm">
                    {formatDate(selectedDeliveryNote.issued_date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado</h3>
                  <p className="text-sm">
                    {getStatusBadge(selectedDeliveryNote.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Dirección de Entrega</h3>
                  <p className="text-sm">
                    {selectedDeliveryNote.delivery_address}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Persona de Contacto</h3>
                  <p className="text-sm">
                    {selectedDeliveryNote.contact_person} -{" "}
                    {selectedDeliveryNote.contact_phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Notas</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm">
                    {selectedDeliveryNote.notes || "Sin notas"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Productos a Entregar</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-center text-gray_m">
                    Aquí iría el detalle de los productos a entregar
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>
                      {formatCurrency(selectedDeliveryNote.total * 0.85)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">IVA (15%):</span>
                    <span>
                      {formatCurrency(selectedDeliveryNote.total * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedDeliveryNote.total)}
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

      {/* Modal para ver todas las notas de entrega del cliente */}
      <Dialog
        open={isClientDeliveryNotesDialogOpen}
        onOpenChange={setIsClientDeliveryNotesDialogOpen}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Notas de Entrega de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista completa de notas de entrega del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-green_m">
                  <thead>
                    <tr className="bg-green_m text-white">
                      <th className="px-4 py-2 text-left">Correlativo</th>
                      <th className="px-4 py-2 text-left">
                        Factura Referencia
                      </th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientDeliveryNotes(selectedClient).map((note) => (
                      <tr key={note.id}>
                        <td className="border border-gray_l px-4 py-2">
                          {note.correlative}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {note.bill_reference || "N/A"}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatDate(note.issued_date)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatCurrency(note.total)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {getStatusBadge(note.status)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDeliveryNote(note)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Nota</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendDeliveryNote(note)}
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
              onClick={() => setIsClientDeliveryNotesDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryNotesPage;
