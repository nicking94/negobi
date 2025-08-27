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

export type Client = {
  id: string;
  client_name: string;
  code: string;
  seller_id: number;
  coordinates?: string;
  email: string;
  phone: string;
  address?: string;
  companyId: number;
  is_active: boolean;
};

const clientSchema = z.object({
  client_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  seller_id: z.number().min(1, "El vendedor es requerido"),
  coordinates: z.string().optional(),
  email: z
    .string()
    .email("El email debe ser válido")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type ClientForm = z.infer<typeof clientSchema>;

const ClientsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [sellers, setSellers] = useState<{ id: number; name: string }[]>([]);

  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      client_name: "Cliente Ejemplo",
      code: "CLI001",
      seller_id: 1,
      coordinates: "10.12345, -66.98765",
      email: "cliente@ejemplo.com",
      phone: "+584121234567",
      address: "Av. Principal, Edificio Ejemplo, Caracas",
      companyId: 1,
      is_active: true,
    },
    {
      id: "2",
      client_name: "Otro Cliente",
      code: "CLI002",
      seller_id: 2,
      email: "otro@cliente.com",
      phone: "+584128765432",
      address: "Calle Secundaria, Local 5, Valencia",
      companyId: 1,
      is_active: true,
    },
    {
      id: "3",
      client_name: "Cliente Inactivo",
      code: "CLI003",
      seller_id: 1,
      coordinates: "10.19876, -67.12345",
      email: "inactivo@cliente.com",
      phone: "+584129876543",
      companyId: 1,
      is_active: false,
    },
  ]);

  // Simular carga de datos de vendedores
  useEffect(() => {
    setSellers([
      { id: 1, name: "Juan Pérez" },
      { id: 2, name: "María García" },
      { id: 3, name: "Carlos Rodríguez" },
    ]);
  }, []);

  // Filtrar clientes según los criterios
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por vendedor
      const matchesSeller =
        selectedSeller === "all" ||
        client.seller_id.toString() === selectedSeller;

      return matchesSearch && matchesSeller;
    });
  }, [clients, searchTerm, selectedSeller]);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_name: "",
      code: "",
      seller_id: 0,
      coordinates: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: ClientForm) => {
    try {
      if (editingClient) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  ...values,
                  email: values.email || "",
                  companyId: editingClient.companyId,
                }
              : c
          )
        );
        toast.success("Cliente actualizado exitosamente");
      } else {
        const newClient: Client = {
          id: Date.now().toString(),
          ...values,
          email: values.email || "",
          companyId: 1,
        };
        setClients((prev) => [...prev, newClient]);
        toast.success("Cliente creado exitosamente");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al guardar el cliente");
    }
  };

  const handleDelete = (client: Client) => {
    toast.error(`¿Eliminar el cliente "${client.client_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          setClients((prev) => prev.filter((c) => c.id !== client.id));
          toast.success("Cliente eliminado exitosamente");
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      client_name: client.client_name,
      code: client.code,
      seller_id: client.seller_id,
      coordinates: client.coordinates || "",
      email: client.email || "",
      phone: client.phone,
      address: client.address || "",
      is_active: client.is_active,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingClient(null);
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("client_name")}</div>
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
      accessorKey: "seller_id",
      header: "Vendedor",
      cell: ({ row }) => {
        const sellerId = row.getValue("seller_id") as number;
        const seller = sellers.find((s) => s.id === sellerId);
        return <div className="font-medium">{seller?.name || sellerId}</div>;
      },
    },
    {
      accessorKey: "coordinates",
      header: "Coordenadas",
      cell: ({ row }) => {
        const coordinates = row.getValue("coordinates") as string;
        return coordinates ? (
          <div className="flex items-center gap-1 text-sm text-gray_m">
            <MapPin className="h-3 w-3" />
            <span>{coordinates}</span>
          </div>
        ) : (
          <div className="text-sm text-gray_m">Sin coordenadas</div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email") || "-"}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("phone")}</div>
      ),
    },
    // Se ha eliminado la columna de estado
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const client = row.original;
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
                  onClick={() => handleEdit(client)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(client)}
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
              Clientes
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código, email o teléfono..."
                  className="pl-8 "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className=" gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <Label htmlFor="seller-filter">Vendedor</Label>
                    <Select
                      value={selectedSeller}
                      onValueChange={setSelectedSeller}
                    >
                      <SelectTrigger id="seller-filter" className="mt-1">
                        <SelectValue placeholder="Todos los vendedores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todos los vendedores
                        </SelectItem>
                        {sellers.map((seller) => (
                          <SelectItem
                            key={seller.id}
                            value={seller.id.toString()}
                          >
                            {seller.name}
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
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo cliente</span>
              </Button>
            </div>
          </div>

          <DataTable<Client, Client>
            columns={columns}
            data={filteredClients || []}
            noResultsText="No se encontraron clientes"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredClients.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingClient ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <FormField
                  control={form.control}
                  name="client_name"
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
                  name="seller_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Vendedor
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un vendedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sellers.map((seller) => (
                              <SelectItem
                                key={seller.id}
                                value={seller.id.toString()}
                              >
                                {seller.name}
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
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Coordenadas
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Ej: 10.12345, -66.98765"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Email
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input {...field} type="email" className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Teléfono
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
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Dirección
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
                        <FormLabel>Cliente activo</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Los clientes inactivos no estarán disponibles para las
                          ventas
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
                    : editingClient
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

export default ClientsPage;
