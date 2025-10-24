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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

// Importar tus servicios y hooks reales
import { useServices } from "@/hooks/services/useServices";
import { useProductCategories } from "@/hooks/productCategories/useProductCategories";
import {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "@/services/servicios/services.service";
import { useCurrency } from "@/context/CurrencyContext";

const serviceSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  price_level_1: z
    .number()
    .min(0, "El precio nivel 1 debe ser mayor o igual a 0"),
  price_level_2: z
    .number()
    .min(0, "El precio nivel 2 debe ser mayor o igual a 0"),
  price_level_3: z
    .number()
    .min(0, "El precio nivel 3 debe ser mayor o igual a 0"),
  category_id: z.union([z.number(), z.null()]).optional(),
  company_id: z.number().min(1, "La compañía es requerida"),
});

type ServiceFormInputs = z.infer<typeof serviceSchema>;

const ServicesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { formatPrice } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Company ID activo (debería venir del contexto de autenticación)
  const activeCompanyId = "4";

  // Usar hooks reales
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    createService,
    updateService,
    deleteService,
    refetch: refetchServices,
  } = useServices({
    companyId: activeCompanyId,
    search: searchTerm || undefined,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const {
    productCategories: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useProductCategories({
    is_active: true,
    page: 1,
    itemsPerPage: 100,
  });

  const form = useForm<ServiceFormInputs>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      category_id: null,
      company_id: parseInt(activeCompanyId),
    },
  });

  const onSubmit = async (data: ServiceFormInputs) => {
    try {
      if (editingService && editingService.id) {
        const updateData: UpdateServiceData = {
          name: data.name,
          code: data.code,
          description: data.description,
          price_level_1: data.price_level_1,
          price_level_2: data.price_level_2,
          price_level_3: data.price_level_3,
          category_id: data.category_id,
          company_id: data.company_id,
        };

        const result = await updateService(
          editingService.id.toString(),
          updateData
        );
        if (result) {
          toast.success("Servicio actualizado exitosamente");
        } else {
          toast.error("Error al actualizar el servicio");
          return;
        }
      } else {
        // Crear nuevo servicio
        const createData: CreateServiceData = {
          name: data.name,
          code: data.code,
          description: data.description || "",
          price_level_1: data.price_level_1,
          price_level_2: data.price_level_2,
          price_level_3: data.price_level_3,
          category_id: data.category_id, // ← YA ES number | null
          company_id: data.company_id,
          erp_code_inst: "",
          external_code: "",
        };

        const result = await createService(createData);
        if (result) {
          toast.success("Servicio creado exitosamente");
        } else {
          toast.error("Error al crear el servicio");
          return;
        }
      }

      resetForm();
      setIsModalOpen(false);
      refetchServices();
    } catch (error) {
      console.error("❌ Error al guardar el servicio:", error);
      toast.error("Error al guardar el servicio");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleDelete = async (service: Service) => {
    if (!service.id) {
      toast.error("Servicio no encontrado");
      return;
    }

    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="font-semibold mb-2">¿Eliminar servicio?</h3>
          <p className="text-sm text-gray-600 mb-4">
            {`¿Estás seguro de que quieres eliminar "${service.name}"? Esta acción no se puede deshacer.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                toast.dismiss(t);
                const success = await deleteService(service.id!.toString());
                if (success) {
                  toast.success("Servicio eliminado exitosamente");
                  refetchServices();
                } else {
                  toast.error("Error al eliminar el servicio");
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);

    form.reset({
      name: service.name,
      code: service.code,
      description: service.description || "",
      price_level_1: service.price_level_1,
      price_level_2: service.price_level_2,
      price_level_3: service.price_level_3,
      category_id: service.category_id || null,
      company_id: service.company_id || parseInt(activeCompanyId),
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      name: "",
      code: "",
      description: "",
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      category_id: null,
      company_id: parseInt(activeCompanyId),
    });
    setEditingService(null);
  };

  const getCategoryName = (service: Service) => {
    const categoryId = service.category_id || service.category?.id;

    if (!categoryId) return "Sin categoría";
    const category = categories.find((c) => c.id === categoryId);

    if (category) {
      return category.category_name;
    }

    if (service.category?.category_name) {
      return service.category.category_name;
    }

    return "Sin categoría";
  };

  const getSyncStatus = (service: Service) => {
    return service.sync_with_erp ? "Sincronizado" : "No sincronizado";
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Servicio",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-xs text-gray_m">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "category_id",
      header: "Categoría",
      cell: ({ row }) => {
        const service = row.original;
        return <div className="font-medium">{getCategoryName(service)}</div>;
      },
    },
    {
      accessorKey: "sync_with_erp",
      header: "Estado Sync",
      cell: ({ row }) => {
        const service = row.original;
        const isSynced = service.sync_with_erp;
        return (
          <div
            className={`flex items-center gap-1 text-sm ${
              isSynced ? "text-green-600" : "text-yellow-600"
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            <span>{getSyncStatus(service)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "price_level_1",
      header: "Precio 1",
      cell: ({ row }) => {
        const price = row.getValue("price_level_1") as number;
        return <div className="font-medium">{formatPrice(price)}</div>;
      },
    },
    {
      accessorKey: "price_level_2",
      header: "Precio 2",
      cell: ({ row }) => {
        const price = row.getValue("price_level_2") as number;
        return <div className="font-medium">{formatPrice(price)}</div>;
      },
    },
    {
      accessorKey: "price_level_3",
      header: "Precio 3",
      cell: ({ row }) => {
        const price = row.getValue("price_level_3") as number;
        return <div className="font-medium">{formatPrice(price)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const service = row.original;
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
                  onClick={() => handleEdit(service)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(service)}
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

  // Mostrar estado de carga
  if ((servicesLoading && services.length === 0) || categoriesLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando servicios...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (servicesError || categoriesError) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p>Error: {servicesError || categoriesError}</p>
              <Button
                onClick={() => {
                  refetchServices();
                  refetchCategories();
                }}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              Servicios
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar servicios..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[18rem]">
                  <div className="px-2 py-1.5">
                    <Label htmlFor="category-filter">Categoría</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="category-filter" className="mt-1">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas las categorías
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="gap-2 w-full sm:w-auto"
                disabled={servicesLoading}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo servicio</span>
              </Button>
            </div>
          </div>

          {/* Tabla de servicios */}
          <div className="bg-white rounded-lg shadow-sm border">
            <DataTable<Service, ColumnDef<Service>[]>
              columns={columns}
              data={services}
              noResultsText="No se encontraron servicios"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={services.length}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          </div>
        </main>
      </div>

      {/* Modal para crear/editar servicio */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingService ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Nombre *
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Consultoría IT"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Código *
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="SERV001"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Descripción
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <textarea
                            {...field}
                            className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
                            placeholder="Descripción del servicio..."
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Categoría
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <Select
                          value={field.value ? field.value.toString() : "none"} // ← CAMBIA "" por "none"
                          onValueChange={(value) => {
                            // Manejar correctamente valores
                            if (value === "none") {
                              field.onChange(null);
                            } else {
                              field.onChange(parseInt(value));
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una categoría (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Usar "none" en lugar de string vacío */}
                            <SelectItem value="none">Sin categoría</SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_level_1"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Precio Nivel 1 *
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_level_2"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Precio Nivel 2 *
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_level_3"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Precio Nivel 3 *
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
                  disabled={form.formState.isSubmitting || servicesLoading}
                  className="w-full sm:w-auto"
                >
                  {form.formState.isSubmitting || servicesLoading
                    ? "Guardando..."
                    : editingService
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

export default ServicesPage;
