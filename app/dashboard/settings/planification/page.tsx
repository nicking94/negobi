"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Calendar,
  MapPin,
  Search,
  Filter,
  Edit,
  Trash2,
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
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export type Seller = {
  id: string;
  name: string;
  email: string;
  work_days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  routes: {
    [day: string]: string[]; // Array de client IDs para cada día
  };
};

export type Client = {
  id: string;
  name: string;
  address: string;
};

const PlanningPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isPlanningDialogOpen, setIsPlanningDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);

  // Datos de ejemplo para vendedores
  const [sellers, setSellers] = useState<Seller[]>([
    {
      id: "1",
      name: "Juan Pérez",
      email: "juan@empresa.com",
      work_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      routes: {
        monday: ["1", "2"],
        tuesday: ["3"],
        wednesday: [],
        thursday: ["4", "5"],
        friday: [],
        saturday: [],
        sunday: [],
      },
    },
    {
      id: "2",
      name: "María González",
      email: "maria@empresa.com",
      work_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      routes: {
        monday: ["6"],
        tuesday: ["7", "8"],
        wednesday: ["9"],
        thursday: [],
        friday: ["10"],
        saturday: [],
        sunday: [],
      },
    },
    {
      id: "3",
      name: "Carlos Rodríguez",
      email: "carlos@empresa.com",
      work_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      routes: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    },
  ]);

  // Datos de ejemplo para clientes
  useEffect(() => {
    // Simular carga de clientes
    const mockClients: Client[] = [
      {
        id: "1",
        name: "AUTOMERCADO NIE CENTER, C.A.",
        address: "Av. Principal #123",
      },
      {
        id: "2",
        name: "DISTRIBUIDORA LA ECONOMÍA, C.A.",
        address: "Calle Comercio #456",
      },
      {
        id: "3",
        name: "FARMACIAS SALUD Y VIDA, C.A.",
        address: "Plaza Central #789",
      },
      {
        id: "4",
        name: "SUPERMERCADOS DEL ESTE, C.A.",
        address: "Sector Este #101",
      },
      { id: "5", name: "ALMACENES DON PEDRO", address: "Zona Industrial #202" },
      {
        id: "6",
        name: "DISTRIBUIDORA SAN MARTÍN",
        address: "Urbanización San Martín #303",
      },
      {
        id: "7",
        name: "COMERCIALIZADORA ANDINA",
        address: "Centro Ciudad #404",
      },
      {
        id: "8",
        name: "IMPORTADORA EL PUERTO",
        address: "Zona Portuaria #505",
      },
      {
        id: "9",
        name: "EXPORTADORA LA FRONTERA",
        address: "Periférico Norte #606",
      },
      { id: "10", name: "INVERSIONES CARIBE", address: "Avenida Costera #707" },
    ];
    setClients(mockClients);
    setAvailableClients(mockClients);
  }, []);

  // Filtrar vendedores según el término de búsqueda
  const filteredSellers = useMemo(() => {
    return sellers.filter(
      (seller) =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sellers, searchTerm]);

  const handlePlanRoute = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsPlanningDialogOpen(true);
  };

  const handleAddClientToDay = (day: string, clientId: string) => {
    if (!selectedSeller) return;

    const updatedSellers = sellers.map((seller) => {
      if (seller.id === selectedSeller.id) {
        const updatedRoutes = { ...seller.routes };
        if (!updatedRoutes[day]) {
          updatedRoutes[day] = [];
        }

        // Evitar duplicados
        if (!updatedRoutes[day].includes(clientId)) {
          updatedRoutes[day] = [...updatedRoutes[day], clientId];
        }

        return {
          ...seller,
          routes: updatedRoutes,
        };
      }
      return seller;
    });

    setSellers(updatedSellers);
    setSelectedSeller(
      updatedSellers.find((s) => s.id === selectedSeller.id) || null
    );
    toast.success("Cliente añadido a la ruta");
  };

  const handleRemoveClientFromDay = (day: string, clientId: string) => {
    if (!selectedSeller) return;

    const updatedSellers = sellers.map((seller) => {
      if (seller.id === selectedSeller.id) {
        const updatedRoutes = { ...seller.routes };
        if (updatedRoutes[day]) {
          updatedRoutes[day] = updatedRoutes[day].filter(
            (id) => id !== clientId
          );
        }

        return {
          ...seller,
          routes: updatedRoutes,
        };
      }
      return seller;
    });

    setSellers(updatedSellers);
    setSelectedSeller(
      updatedSellers.find((s) => s.id === selectedSeller.id) || null
    );
    toast.success("Cliente removido de la ruta");
  };

  const handleSavePlanning = () => {
    // Aquí implementarías la llamada a la API según el swagger proporcionado
    toast.success("Planificación guardada exitosamente");
    setIsPlanningDialogOpen(false);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Cliente no encontrado";
  };

  const getClientAddress = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.address : "Dirección no disponible";
  };

  const daysOfWeek = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const columns: ColumnDef<Seller>[] = [
    {
      accessorKey: "name",
      header: "Vendedor",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("name")}</div>
          <div className="text-xs text-gray_m">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: "work_days",
      header: "Días Laborales",
      cell: ({ row }) => {
        const seller = row.original;
        const activeDays = daysOfWeek.filter(
          (day) => seller.work_days[day.key as keyof typeof seller.work_days]
        );

        return (
          <div className="flex flex-wrap gap-1">
            {activeDays.map((day) => (
              <Badge
                key={day.key}
                variant="outline"
                className="bg-green_xxl/20 text-green_b"
              >
                {day.label}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "routes",
      header: "Clientes Asignados",
      cell: ({ row }) => {
        const seller = row.original;
        const totalClients = Object.values(seller.routes).flat().length;

        return (
          <div className="font-medium">
            {totalClients} {totalClients === 1 ? "cliente" : "clientes"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const seller = row.original;

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
                  onClick={() => handlePlanRoute(seller)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Planificar Ruta</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-red_b">
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
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
              Planificación de Rutas
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar vendedor..."
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
                      <Label htmlFor="day-filter">Día de la semana</Label>
                      <Select>
                        <SelectTrigger id="day-filter" className="mt-1">
                          <SelectValue placeholder="Todos los días" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los días</SelectItem>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.key} value={day.key}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <DataTable<Seller, Seller>
            columns={columns}
            data={filteredSellers}
            noResultsText="No se encontraron vendedores"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredSellers.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      {/* Modal para planificar rutas */}
      <Dialog
        open={isPlanningDialogOpen}
        onOpenChange={setIsPlanningDialogOpen}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Planificar Ruta para {selectedSeller?.name}
            </DialogTitle>
            <DialogDescription>
              Asigna clientes a cada día de la semana para este vendedor
            </DialogDescription>
          </DialogHeader>

          {selectedSeller && (
            <div className="grid gap-6 py-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {day.label}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray_m">
                        {selectedSeller.work_days[
                          day.key as keyof typeof selectedSeller.work_days
                        ]
                          ? "Día laboral"
                          : "No laboral"}
                      </span>
                      <Checkbox
                        checked={
                          selectedSeller.work_days[
                            day.key as keyof typeof selectedSeller.work_days
                          ]
                        }
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <Label>Clientes asignados:</Label>
                    {selectedSeller.routes[day.key] &&
                    selectedSeller.routes[day.key].length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedSeller.routes[day.key].map((clientId) => (
                          <div
                            key={clientId}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div>
                              <p className="font-medium">
                                {getClientName(clientId)}
                              </p>
                              <p className="text-xs text-gray_m">
                                {getClientAddress(clientId)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveClientFromDay(day.key, clientId)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red_b" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray_m mt-1">
                        No hay clientes asignados para este día
                      </p>
                    )}
                  </div>

                  {selectedSeller.work_days[
                    day.key as keyof typeof selectedSeller.work_days
                  ] && (
                    <div>
                      <Label>Añadir cliente:</Label>
                      <Select
                        onValueChange={(clientId) =>
                          handleAddClientToDay(day.key, clientId)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPlanningDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSavePlanning}>
              Guardar Planificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningPage;
