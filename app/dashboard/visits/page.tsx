"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useVisits } from "@/hooks/visits/useVisits";
import { Visit, VisitStatus } from "@/services/visits/visits.service";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Definir la interfaz para la estructura de ubicación
interface Location {
  coordinates: [number, number]; // [longitud, latitud]
  address?: string;
}

const VisitsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  const { visits, loading, error } = useVisits({
    search: searchTerm,
    status: statusFilter !== "all" ? (statusFilter as VisitStatus) : undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
  });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getStatusIcon = (status: VisitStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: VisitStatus) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredVisits = visits.filter(() => {
    // Los filtros ya se aplican en el hook useVisits a través de los parámetros
    return true;
  });

  const columns: ColumnDef<Visit>[] = [
    {
      accessorKey: "date",
      header: "Fecha y Hora",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return (
          <div className="font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatDate(date)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[300px]">
            <div className="font-medium line-clamp-2">{description}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as VisitStatus;
        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              status
            )}`}
          >
            {getStatusIcon(status)}
            <span>{getStatusText(status)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => {
        const location = row.getValue("location") as Location;
        const coordinates = location?.coordinates;

        return (
          <div className="text-sm">
            {coordinates && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {coordinates[1]?.toFixed(4)}, {coordinates[0]?.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "clientId",
      header: "Cliente",
      cell: ({ row }) => {
        const clientId = row.getValue("clientId") as number;
        return (
          <div className="text-sm">
            {clientId && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Cliente #{clientId}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="text-sm text-gray-500">{formatDateShort(date)}</div>
        );
      },
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100/20 to-blue-100/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-white to-gray-50/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Visitas
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar por descripción..."
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
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="completed">Completadas</SelectItem>
                          <SelectItem value="cancelled">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-from">Desde</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-to">Hasta</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                      />
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <DataTable<Visit, Visit>
              columns={columns}
              data={filteredVisits}
              noResultsText="No hay visitas registradas"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={filteredVisits.length}
              itemsPerPage={50}
              setItemsPerPage={() => {}}
            />
          )}

          {!loading && filteredVisits.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron visitas que coincidan con {searchTerm}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VisitsPage;
