"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Layers,
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
  DialogDescription,
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
import { ServiceService } from "@/services/servicios/services.service";
import useGetInstances from "@/hooks/instances/useGetInstance";
import useGetService from "@/hooks/services/useGetServices";

type Category = {
  id: number;
  category_name: string;
};

export type Service = {
  id?: string;
  name: string;
  code: string;
  description?: string;
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  category_id: number;
  company_id: number;
  synced_locations?: number;
  is_active?: boolean;
};

const serviceSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  price_level_1: z.number().min(0, "El precio no puede ser negativo"),
  price_level_2: z.number().min(0, "El precio no puede ser negativo"),
  price_level_3: z.number().min(0, "El precio no puede ser negativo"),
  category_id: z.number().min(0, "La categoría es requerida"),
  is_active: z.boolean().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const ServicesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncFilter, setSyncFilter] = useState<string>("all");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");
  const { instancesResponse } = useGetInstances();
  const {
    servicesResponse,
    page,
    setItemsPerPage,
    itemsPerPage,
    setPage,
    total,
    totalPage,
    setModified,
  } = useGetService();

  // Datos de ejemplo
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Consultoría IT",
      code: "SERV001",
      description: "Servicio de consultoría en tecnología",
      price_level_1: 100.0,
      price_level_2: 90.0,
      price_level_3: 85.0,
      category_id: 1,
      company_id: 1,
      synced_locations: 5,
      is_active: true,
    },
    {
      id: "2",
      name: "Desarrollo Web",
      code: "SERV002",
      description: "Desarrollo de aplicaciones web a medida",
      price_level_2: 200.0,
      price_level_1: 180.0,
      price_level_3: 160.0,
      category_id: 2,
      company_id: 1,
      synced_locations: 8,
      is_active: true,
    },
    {
      id: "3",
      name: "Soporte Técnico",
      code: "SERV003",
      description: "Soporte técnico remoto y presencial",
      price_level_1: 500.0,
      price_level_2: 450.0,
      price_level_3: 400.0,
      category_id: 3,
      company_id: 1,
      synced_locations: 3,
      is_active: false,
    },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Consultoría" },
    { id: 2, name: "Desarrollo" },
    { id: 3, name: "Soporte" },
  ]);

  const [instances, setInstances] = useState([
    { id: 1, name: "Instancia Principal" },
    { id: 2, name: "Sucursal Norte" },
    { id: 3, name: "Sucursal Sur" },
  ]);

  // Filtrar servicios según los criterios
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por instancia (si no es "todas")
      const matchesInstance =
        instanceFilter === "all" ||
        service.company_id.toString() === instanceFilter;

      return matchesSearch && matchesInstance;
    });
  }, [services, searchTerm, syncFilter, instanceFilter]);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      category_id: 0,
    },
  });

  const onSubmit = async (values: ServiceForm) => {
    try {
      // Preparar datos para el POST
      const postData = {
        ...values,
        company_id: 4, // Esto debería venir del contexto de la empresa
      };

      if (editingService && typeof editingService.id === "number") {
        // Lógica para actualizar
        const result = await ServiceService.patchService(
          editingService.id,
          postData
        );
        toast.success("Servicio actualizado exitosamente");
        setModified((prev) => !prev);
      } else {
        // Lógica para crear
        const newService: Service = {
          ...postData,
        };
        const result = await ServiceService.postService(newService);
        toast.success("Servicio creado exitosamente");
        setModified((prev) => !prev);

        // Aquí iría la llamada a la API:
        // await fetch('/api/services', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(postData)
        // });
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al guardar el servicio");
    }
  };

  const handleDelete = (service: Service) => {
    toast.error(`¿Eliminar el servicio "${service.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          if (!service.id) {
            toast.error("ID de servicio no válido");
            return;
          }
          await ServiceService.deleteService(service.id);
          toast.success("Servicio eliminado exitosamente");
          setModified((prev) => !prev);
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

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      code: service.code,
      description: service.description || "",
      price_level_1: service.price_level_1,
      price_level_2: service.price_level_2,
      price_level_3: service.price_level_3,
      category_id: service.category_id,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingService(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
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
      accessorKey: "synced_locations",
      header: "Sincronizado en",
      cell: ({ row }) => {
        const locations = row.getValue("synced_locations") as number;
        return (
          <div className="flex items-center gap-1 text-sm">
            <RefreshCw className="h-3 w-3" />
            <span>
              {locations} sucursal{locations !== 1 ? "es" : ""}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "price_level_1",
      header: "Precio 1",
      cell: ({ row }) => {
        const price = row.getValue("price_level_1") as number;
        return <div className="font-medium">{formatCurrency(price)}</div>;
      },
    },
    {
      accessorKey: "price_level_2",
      header: "Precio 2",
      cell: ({ row }) => {
        const price = row.getValue("price_level_2") as number;
        return <div className="font-medium">{formatCurrency(price)}</div>;
      },
    },
    {
      accessorKey: "price_level_3",
      header: "Precio 3",
      cell: ({ row }) => {
        const price = row.getValue("price_level_3") as number;
        return <div className="font-medium">{formatCurrency(price)}</div>;
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Servicios
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código o descripción..."
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
                      <Label htmlFor="sync-filter">Sincronización</Label>
                      <Select value={syncFilter} onValueChange={setSyncFilter}>
                        <SelectTrigger id="sync-filter" className="mt-1">
                          <SelectValue placeholder="Todos los servicios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los servicios
                          </SelectItem>
                          <SelectItem value="synced">Sincronizados</SelectItem>
                          <SelectItem value="not-synced">
                            No sincronizados
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="instance-filter">Instancia</Label>
                      <Select
                        value={instanceFilter}
                        onValueChange={setInstanceFilter}
                      >
                        <SelectTrigger id="instance-filter" className="mt-1">
                          <SelectValue placeholder="Todas las instancias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las instancias
                          </SelectItem>
                          {instances.map((instance) => (
                            <SelectItem
                              key={instance.id}
                              value={instance.id.toString()}
                            >
                              {instance.name}
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
                <span>Nuevo servicio</span>
              </Button>
            </div>
          </div>

          <DataTable<Service, Service>
            columns={columns}
            data={servicesResponse || []}
            noResultsText="No se encontraron servicios"
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
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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
                        Nombre
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                        Código
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
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
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {instancesResponse.map((category: Category) => (
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
                        Precio Nivel 1
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
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
                        Precio Nivel 2
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
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
                        Precio Nivel 3
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
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
