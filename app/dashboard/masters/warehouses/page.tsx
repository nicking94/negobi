"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Filter, Building, Phone, User, MapPin } from "lucide-react";
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
import { useWarehouses } from "@/hooks/warehouse/useWarehouses";
import { Warehouse as WarehouseType } from "@/services/warehouse/warehouse.service";
import { useCompanyBranches } from "@/hooks/companyBranches/useCompanyBranches";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Warehouse = WarehouseType;

const WarehousesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  const {
    companyBranches: branches,
    loading: branchesLoading,
    error: branchesError,
  } = useCompanyBranches({
    companyId: selectedCompanyId,
  });

  const {
    warehouses,

    error,
  } = useWarehouses({
    search: searchTerm,
    companyId: selectedCompanyId || undefined,
  });

  useEffect(() => {
    // Acá agregar el companyId del contexto

    if (!selectedCompanyId) {
      setSelectedCompanyId(1);
    }
  }, [selectedCompanyId]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBranchFilter("all");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getBranchName = (branchId: number) => {
    if (!branchId || branchId === 0) {
      return "Sin sucursal asignada";
    }

    const branch = branches.find((b) => b.id === branchId);

    if (!branch) {
      console.warn("No se encontró la sucursal con id:", branchId);
      return "Sucursal no encontrada";
    }

    return branch.name;
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    if (statusFilter === "active" && !warehouse.is_active) return false;
    if (statusFilter === "inactive" && warehouse.is_active) return false;

    if (branchFilter !== "all") {
      const branchId = parseInt(branchFilter);
      if (warehouse.companyBranchId !== branchId) return false;
    }

    return true;
  });

  const columns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: "Almacén",
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray_m" />
            <span>{row.getValue("name")}</span>
          </div>
          <div className="text-xs text-gray_m flex items-center gap-1 mt-1">
            <span>Código: {row.original.code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "companyBranchId",
      header: "Sucursal",
      cell: ({ row }) => {
        const branchId = row.getValue("companyBranchId") as number;
        const branchName = getBranchName(branchId);

        return <div className="font-medium">{branchName}</div>;
      },
    },
    {
      accessorKey: "contact_info",
      header: "Contacto",
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <div className="text-sm">
            {warehouse.contact_person && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{warehouse.contact_person}</span>
              </div>
            )}
            {warehouse.contact_phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{warehouse.contact_phone}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "location_address",
      header: "Ubicación",
      cell: ({ row }) => {
        const address = row.getValue("location_address") as string;
        return (
          <div className="text-sm">
            {address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Última Actualización",
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as string;
        return (
          <div className="text-sm">
            <div>{formatDate(date)}</div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive ? "bg-green_xxl text-green_b" : "bg-red_xxl text-red_b"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (branchesError) {
      toast.error(branchesError);
    }
  }, [error, branchesError]);

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
              Almacenes
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código..."
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
                          <SelectItem value="active">Activos</SelectItem>
                          <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch-filter">Sucursal</Label>
                      <Select
                        value={branchFilter}
                        onValueChange={handleBranchChange}
                        disabled={branches.length === 0}
                      >
                        <SelectTrigger id="branch-filter">
                          <SelectValue placeholder="Todas las sucursales" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las sucursales
                          </SelectItem>
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id.toString()}
                            >
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

          {selectedCompanyId && branches.length === 0 && !branchesLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay sucursales disponibles para la empresa seleccionada.
            </div>
          )}

          {selectedCompanyId && branches.length > 0 && (
            <DataTable<Warehouse, Warehouse>
              columns={columns}
              data={filteredWarehouses}
              noResultsText="No hay almacenes registrados"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={filteredWarehouses.length}
              itemsPerPage={50}
              setItemsPerPage={() => {}}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default WarehousesPage;
