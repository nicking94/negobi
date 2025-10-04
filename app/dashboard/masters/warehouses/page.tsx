"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  addWarehouse,
  deleteWarehouse,
  updateWarehouse,
} from "@/services/warehouse/warehouse.service";
import useGetWarehouses from "@/hooks/warehouse/useGetWarehouses";

export type Warehouse = {
  id?: string;
  companyBranchId: number;
  name: string;
  code: string;
  contact_person?: string;
  contact_phone?: string;
  location_address?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
};

const warehouseSchema = z.object({
  companyBranchId: z.number().min(1, "La sucursal es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  location_address: z.string().optional(),
  is_active: z.boolean(),
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

  const [branches, setBranches] = useState([
    { id: 1, name: "Sucursal Principal" },
    { id: 2, name: "Sucursal Norte" },
    { id: 3, name: "Sucursal Sur" },
  ]);

  const form = useForm<z.infer<typeof warehouseSchema>>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      companyBranchId: 1,
      name: "",
      code: "",
      contact_person: "",
      contact_phone: "",
      location_address: "",
      is_active: true,
    },
  });

  const {
    warehousesResponse,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    page,
    itemsPerPage,
  } = useGetWarehouses();

  const onSubmit = async (values: WarehouseForm) => {
    try {
      if (editingWarehouse && typeof editingWarehouse.id === "string") {
        // Lógica para actualizar
        const { id } = editingWarehouse;
        try {
          await updateWarehouse(id, values);
        } catch (error) {
          toast.error("Error al actualizar el almacén: " + error);
        }
        toast.success("Almacén actualizado exitosamente");
      } else {
        // Lógica para crear
        const newWarehouse: Warehouse = {
          ...values,
        };
        try {
          await addWarehouse(newWarehouse);
          toast.success("Almacén creado exitosamente");
        } catch (error) {
          toast.error("Error al crear el almacén: " + error);
        }
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al guardar el almacén: " + error);
    }
  };

  const handleDelete = (warehouse: Warehouse) => {
    toast.error(`¿Eliminar el almacén "${warehouse.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          deleteWarehouse(warehouse.id as string);
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
      is_active: warehouse.is_active,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      companyBranchId: 1,
      name: "",
      code: "",
      contact_person: "",
      contact_phone: "",
      location_address: "",
      is_active: true,
    });
    setEditingWarehouse(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

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
        const branch = branches.find((b) => b.id === branchId);
        return (
          <div className="font-medium">{branch?.name || "Desconocida"}</div>
        );
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
          <div className="flex items-center">
            <div
              className={`h-2.5 w-2.5 rounded-full mr-2 ${
                isActive ? "bg-green_m" : "bg-gray_m"
              }`}
            ></div>
            <span className="text-sm">{isActive ? "Activo" : "Inactivo"}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const warehouse = row.original;
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
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(warehouse)}
                  className="cursor-pointer flex items-center gap-2 text-red_m"
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
            <div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo almacén</span>
              </Button>
            </div>
          </div>

          <DataTable<Warehouse, Warehouse>
            columns={columns}
            data={warehousesResponse || []}
            noResultsText="No hay almacenes registrados"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={total}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
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
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                        <FormLabel>Sucursal</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la sucursal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
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
                        <FormLabel>Persona de Contacto (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                        <FormLabel>Teléfono de Contacto (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                      <FormLabel>Dirección de Ubicación (Opcional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Almacén activo</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Los almacenes inactivos no estarán disponibles para
                          operaciones
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
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
                  disabled={form.formState.isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {form.formState.isSubmitting
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
