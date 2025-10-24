"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Building,
  Phone,
  User,
  MapPin,
  BadgeCheck,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { useWarehouses } from "@/hooks/warehouse/useWarehouses";
import { Warehouse as WarehouseType } from "@/services/warehouse/warehouse.service";
import { useCompanyBranches } from "@/hooks/companyBranches/useCompanyBranches";
import useGetAllCompanies from "@/hooks/companies/useGetAllCompanies";

type Warehouse = WarehouseType;

const warehouseSchema = z.object({
  companyBranchId: z.number().min(1, "La sucursal es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  location_address: z.string().optional(),
});

type WarehouseForm = z.infer<typeof warehouseSchema>;

const WarehousesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  // Obtener empresas
  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useGetAllCompanies();

  // Obtener sucursales basadas en la empresa seleccionada
  const {
    companyBranches: branches,
    loading: branchesLoading,
    error: branchesError,
  } = useCompanyBranches({
    companyId: selectedCompanyId,
  });

  // Usa el nuevo hook con filtros
  const {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    refetch: refetchWarehouses,
  } = useWarehouses({
    search: searchTerm,
    companyId: selectedCompanyId || undefined,
  });

  const form = useForm<WarehouseForm>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      companyBranchId: 0,
      name: "",
      code: "",
      contact_person: "",
      contact_phone: "",
      location_address: "",
    },
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      const firstCompanyId = companies[0].id;
      setSelectedCompanyId(firstCompanyId);
    }
  }, [companies, selectedCompanyId]);

  useEffect(() => {
    const companyBranches = getBranchesForSelectedCompany();
    const currentBranchId = form.getValues("companyBranchId");

    if (
      companyBranches.length > 0 &&
      (!currentBranchId || currentBranchId === 0)
    ) {
      form.setValue("companyBranchId", companyBranches[0].id);
    }
  }, [branches, selectedCompanyId, form]);

  const onSubmit = async (values: WarehouseForm) => {
    try {
      let result;

      if (editingWarehouse && editingWarehouse.id) {
        // Actualizar almacén
        const updateData = {
          ...values,
          is_active: editingWarehouse.is_active,
        };
        result = await updateWarehouse(
          editingWarehouse.id.toString(),
          updateData
        );
      } else {
        // Crear nuevo almacén
        const createData = {
          ...values,
          is_active: true,
        };
        result = await createWarehouse(createData);
      }

      if (result) {
        toast.success(
          editingWarehouse
            ? "Almacén actualizado exitosamente"
            : "Almacén creado exitosamente"
        );

        // ✅ CORRECCIÓN: Recargar la lista de almacenes
        await refetchWarehouses();

        resetForm();
        setIsModalOpen(false);
      } else {
        toast.error(
          editingWarehouse
            ? "Error al actualizar el almacén"
            : "Error al crear el almacén"
        );
      }
    } catch (error) {
      toast.error("Error al guardar el almacén: " + error);
    }
  };

  const handleToggleStatus = async (warehouse: Warehouse) => {
    if (!warehouse.id) {
      toast.error("No se puede cambiar el estado: ID no disponible");
      return;
    }

    try {
      const updateData = {
        companyBranchId: warehouse.companyBranchId,
        name: warehouse.name,
        code: warehouse.code,
        contact_person: warehouse.contact_person || "",
        contact_phone: warehouse.contact_phone || "",
        location_address: warehouse.location_address || "",
        is_active: !warehouse.is_active,
      };

      const result = await updateWarehouse(warehouse.id.toString(), updateData);

      if (result) {
        toast.success(
          `Almacén ${
            !warehouse.is_active ? "activado" : "desactivado"
          } exitosamente`
        );

        await refetchWarehouses();
      } else {
        toast.error("Error al cambiar el estado del almacén");
      }
    } catch (error) {
      console.error("Error cambiando estado de almacén:", error);
      toast.error("Error al cambiar el estado del almacén");
    }
  };

  const handleDelete = async (warehouse: Warehouse) => {
    toast.error(`¿Eliminar el almacén "${warehouse.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const success = await deleteWarehouse(warehouse.id.toString());
          if (success) {
            toast.success("Almacén eliminado exitosamente");
            // ✅ CORRECCIÓN: Recargar la lista
            await refetchWarehouses();
          } else {
            toast.error("Error al eliminar el almacén");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
          toast.info("Eliminación cancelada");
        },
      },
    });
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.reset({
      companyBranchId: warehouse.companyBranchId,
      name: warehouse.name,
      code: warehouse.code,
      contact_person: warehouse.contact_person || "",
      contact_phone: warehouse.contact_phone || "",
      location_address: warehouse.location_address || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    const defaultBranchId = branches.length > 0 ? branches[0].id : 0;
    form.reset({
      companyBranchId: defaultBranchId,
      name: "",
      code: "",
      contact_person: "",
      contact_phone: "",
      location_address: "",
    });
    setEditingWarehouse(null);
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

  const getBranchesForSelectedCompany = () => {
    if (!selectedCompanyId) {
      return [];
    }

    const filteredBranches = branches.filter((branch) => {
      return branch.companyId && branch.companyId === selectedCompanyId;
    });

    return filteredBranches;
  };

  // Aplica filtros adicionales
  const filteredWarehouses = warehouses.filter((warehouse) => {
    // Filtro por estado
    if (statusFilter === "active" && !warehouse.is_active) return false;
    if (statusFilter === "inactive" && warehouse.is_active) return false;

    // Filtro por sucursal
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
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const warehouse = row.original;
        const hasValidId = !!warehouse.id;

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
                  onClick={() => handleEdit(warehouse)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleToggleStatus(warehouse)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
                  {warehouse.is_active ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Desactivar</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4 w-4" />
                      <span>Activar</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleDelete(warehouse)}
                  className={`cursor-pointer flex items-center gap-2 text-red_m ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
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

  // Muestra errores del hook
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (branchesError) {
      toast.error(branchesError);
    }
    if (companiesError) {
      toast.error(companiesError);
    }
  }, [error, branchesError, companiesError]);

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
              Almacenes
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
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
                          <SelectItem value="active">Activos</SelectItem>
                          <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="branch-filter">Sucursal</Label>
                      <Select
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                        disabled={branches.length === 0}
                      >
                        <SelectTrigger id="branch-filter" className="mt-1">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="company-selector"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Seleccionar Empresa:
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCompanyId?.toString() || ""}
                    onValueChange={(value) => {
                      setSelectedCompanyId(Number(value));

                      setBranchFilter("all");
                      setStatusFilter("all");
                      setSearchTerm("");
                    }}
                  >
                    <SelectTrigger
                      id="company-selector"
                      className="w-full md:w-64"
                    >
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 whitespace-nowrap"
                disabled={branches.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo almacén</span>
              </Button>
            </div>
          </div>

          {selectedCompanyId && branches.length === 0 && !branchesLoading && (
            <div className="text-center py-8 text-gray-500">
              No hay sucursales disponibles para la empresa seleccionada. Debes
              crear sucursales antes de poder agregar almacenes.
            </div>
          )}

          {/* DataTable actualizado */}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingWarehouse ? "Editar almacén" : "Nuevo almacén"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Ej: ALM-001"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyBranchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sucursal *</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          disabled={
                            getBranchesForSelectedCompany().length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  getBranchesForSelectedCompany().length === 0
                                    ? "No hay sucursales disponibles para esta empresa"
                                    : "Selecciona la sucursal"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getBranchesForSelectedCompany().map((branch) => (
                              <SelectItem
                                key={branch.id}
                                value={branch.id.toString()}
                              >
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Ej: Almacén Principal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona de Contacto</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Ej: Juan Pérez"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Contacto</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Ej: +58 412-1234567"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Ubicación</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                          placeholder="Ej: Av. Principal, Edificio Comercial, Piso 2, Oficina 201..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NOTA: Se elimina el checkbox de is_active del formulario */}
                {/* El estado ahora se maneja desde las acciones con los botones Activar/Desactivar */}
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    loading ||
                    branches.length === 0
                  }
                  className="w-full sm:w-auto"
                >
                  {form.formState.isSubmitting || loading
                    ? "Guardando..."
                    : editingWarehouse
                    ? "Actualizar"
                    : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehousesPage;
