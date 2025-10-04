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
import useGetClients from "@/hooks/clients/useGetClients";
import useUpdateClient from "@/hooks/clients/useUpdateClient";
import useDeleteClient from "@/hooks/clients/useDeleteClient";
import useAddClient from "@/hooks/clients/useAddClients";

export type Client = {
  id?: string;
  businessTypeId?: number;
  salespersonUserId?: number;
  zoneId?: number;
  client_code: string;
  legal_name: string;
  tax_document_type: string;
  tax_document_number: string;
  client_type: string;
  is_special_taxpayer?: boolean;
  fiscal_country_id?: number;
  fiscal_state_id?: number;
  fiscal_city_id?: number;
  fiscal_zone_id?: number;
  email?: string;
  main_phone?: string;
  mobile_phone?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  commercial_name?: string;
  delivery_address?: string;
  fiscal_address?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  map_link?: string;
  payment_term_id?: number;
  credit_limit?: number;
  credit_days?: number;
  has_credit: boolean;
  default_discount_percentage?: number;
  default_price_level?: number;
  notes?: string;
  balance_due?: number;
  advance_balance?: number;
  average_payment_days?: number;
  last_sale_date?: string;
  last_sale_number?: string;
  last_sale_amount?: number;
  last_order_date?: string;
  last_order_number?: string;
  last_order_amount?: number;
  last_payment_date?: string;
  last_payment_number?: string;
  last_payment_amount?: number;
  is_active?: boolean;
};

// Schema con tipos específicos en lugar de 'any'
const clientSchema = z.object({
  businessTypeId: z.union([z.number(), z.string(), z.undefined()]).optional(),
  salespersonUserId: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  zoneId: z.union([z.number(), z.string(), z.undefined()]).optional(),
  client_code: z.string().min(1, "El código de cliente es requerido"),
  legal_name: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  tax_document_type: z
    .string()
    .min(1, "El tipo de documento fiscal es requerido"),
  tax_document_number: z
    .string()
    .min(1, "El número de documento fiscal es requerido"),
  client_type: z.string().min(1, "El tipo de cliente es requerido"),
  is_special_taxpayer: z.boolean().optional(),
  fiscal_country_id: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  fiscal_state_id: z.union([z.number(), z.string(), z.undefined()]).optional(),
  fiscal_city_id: z.union([z.number(), z.string(), z.undefined()]).optional(),
  fiscal_zone_id: z.union([z.number(), z.string(), z.undefined()]).optional(),
  email: z
    .string()
    .email("El email debe ser válido")
    .optional()
    .or(z.literal("")),
  main_phone: z.string().optional(),
  mobile_phone: z.string().optional(),
  contact_person: z.string().optional(),
  contact_email: z
    .string()
    .email("El email de contacto debe ser válido")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional(),
  commercial_name: z.string().optional(),
  delivery_address: z.string().optional(),
  fiscal_address: z.string().optional(),
  zip_code: z.string().optional(),
  latitude: z.union([z.number(), z.string(), z.undefined()]).optional(),
  longitude: z.union([z.number(), z.string(), z.undefined()]).optional(),
  map_link: z.string().optional(),
  payment_term_id: z.union([z.number(), z.string(), z.undefined()]).optional(),
  credit_limit: z.union([z.number(), z.string(), z.undefined()]).optional(),
  credit_days: z.union([z.number(), z.string(), z.undefined()]).optional(),
  has_credit: z.boolean(),
  default_discount_percentage: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  default_price_level: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  notes: z.string().optional(),
  balance_due: z.union([z.number(), z.string(), z.undefined()]).optional(),
  advance_balance: z.union([z.number(), z.string(), z.undefined()]).optional(),
  average_payment_days: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  last_sale_date: z.string().optional(),
  last_sale_number: z.string().optional(),
  last_sale_amount: z.union([z.number(), z.string(), z.undefined()]).optional(),
  last_order_date: z.string().optional(),
  last_order_number: z.string().optional(),
  last_order_amount: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  last_payment_date: z.string().optional(),
  last_payment_number: z.string().optional(),
  last_payment_amount: z
    .union([z.number(), z.string(), z.undefined()])
    .optional(),
  is_active: z.boolean().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

const ClientsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [sellers, setSellers] = useState<{ id: number; name: string }[]>([]);
  const [clientTypes, setClientTypes] = useState<string[]>([]);
  const [taxDocumentTypes, setTaxDocumentTypes] = useState<
    { value: string; name: string }[]
  >([]);

  // Usar los hooks personalizados
  const {
    clientsResponse,
    page,
    itemsPerPage,
    total,
    totalPage,
    setPage,
    setItemsPerPage,
    setModified,
  } = useGetClients({
    search: searchTerm,
    salespersonUserId: selectedSeller !== "all" ? selectedSeller : undefined,
  });

  const { createClient, isLoading: isCreating } = useAddClient({
    onSuccess: () => {
      toast.success("Cliente creado exitosamente");
      setModified((prev) => !prev);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Error al crear el cliente";
      toast.error(errorMessage);
    },
  });

  const { updateClient, isLoading: isUpdating } = useUpdateClient({
    onSuccess: () => {
      toast.success("Cliente actualizado exitosamente");
      setModified((prev) => !prev);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el cliente";
      toast.error(errorMessage);
    },
  });

  const { deleteClient } = useDeleteClient({
    onSuccess: () => {
      toast.success("Cliente eliminado exitosamente");
      setModified((prev) => !prev);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar el cliente";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    setSellers([
      { id: 1, name: "Juan Pérez" },
      { id: 2, name: "María García" },
      { id: 3, name: "Carlos Rodríguez" },
    ]);

    setClientTypes(["taxpayer", "end_consumer", "Gobierno", "Extranjero"]);
    setTaxDocumentTypes([
      { value: "rif", name: "RIF" },
      { value: "cedula", name: "Cédula" },
      { value: "pasaporte", name: "Pasaporte" },
      { value: "dni", name: "DNI" },
    ]);
  }, []);

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      businessTypeId: undefined,
      salespersonUserId: undefined,
      zoneId: undefined,
      client_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      client_type: "",
      is_special_taxpayer: false,
      fiscal_country_id: undefined,
      fiscal_state_id: undefined,
      fiscal_city_id: undefined,
      fiscal_zone_id: undefined,
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      commercial_name: "",
      delivery_address: "",
      fiscal_address: "",
      zip_code: "",
      latitude: undefined,
      longitude: undefined,
      map_link: "",
      payment_term_id: undefined,
      credit_limit: undefined,
      credit_days: undefined,
      has_credit: false,
      default_discount_percentage: undefined,
      default_price_level: undefined,
      notes: "",
      balance_due: undefined,
      advance_balance: undefined,
      average_payment_days: undefined,

      last_sale_date: undefined,
      last_sale_number: "",
      last_sale_amount: undefined,
      last_order_date: undefined,
      last_order_number: "",
      last_order_amount: undefined,
      last_payment_date: undefined,
      last_payment_number: "",
      last_payment_amount: undefined,
      is_active: true,
    },
  });

  const onSubmit = async (values: ClientForm) => {
    console.log("Form submitted with values:", values);

    try {
      // Limpiar datos antes de enviar
      const cleanData: Record<string, unknown> = {
        client_code: values.client_code,
        legal_name: values.legal_name,
        tax_document_type: values.tax_document_type,
        tax_document_number: values.tax_document_number,
        client_type: values.client_type,
        is_special_taxpayer: values.is_special_taxpayer ?? false,
        has_credit: values.has_credit ?? false,
        is_active: values.is_active ?? true,
      };

      // Función helper para limpiar valores
      const cleanValue = (value: unknown): unknown => {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          value === "0"
        ) {
          return undefined;
        }
        return value;
      };

      // Agregar campos opcionales solo si tienen valor válido
      const optionalFields = [
        "businessTypeId",
        "salespersonUserId",
        "zoneId",
        "fiscal_country_id",
        "fiscal_state_id",
        "fiscal_city_id",
        "fiscal_zone_id",
        "email",
        "main_phone",
        "mobile_phone",
        "contact_person",
        "contact_email",
        "contact_phone",
        "commercial_name",
        "delivery_address",
        "fiscal_address",
        "zip_code",
        "latitude",
        "longitude",
        "map_link",
        "payment_term_id",
        "credit_limit",
        "credit_days",
        "default_discount_percentage",
        "default_price_level",
        "notes",
        "balance_due",
        "advance_balance",
        "average_payment_days",
      ];

      optionalFields.forEach((field) => {
        const value = values[field as keyof ClientForm];
        const cleanedValue = cleanValue(value);
        if (cleanedValue !== undefined) {
          cleanData[field] = cleanedValue;
        }
      });

      console.log("Final data to send:", cleanData);

      if (editingClient && editingClient.id) {
        await updateClient(editingClient.id, cleanData);
      } else {
        await createClient(cleanData as Client);
      }
    } catch {
      // El error ya se maneja en los callbacks de los hooks
    }
  };

  const handleDelete = (client: Client) => {
    toast.error(`¿Eliminar el cliente "${client.legal_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteClient(client.id!);
          } catch {
            // El error ya se maneja en el callback del hook
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);

    // Función helper para limpiar valores al cargar
    const cleanValueForForm = (value: unknown): unknown => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === 0
      ) {
        return undefined;
      }
      return value;
    };

    form.reset({
      businessTypeId: cleanValueForForm(client.businessTypeId) as
        | number
        | undefined,
      salespersonUserId: cleanValueForForm(client.salespersonUserId) as
        | number
        | undefined,
      zoneId: cleanValueForForm(client.zoneId) as number | undefined,
      client_code: client.client_code,
      legal_name: client.legal_name,
      tax_document_type: client.tax_document_type,
      tax_document_number: client.tax_document_number,
      client_type: client.client_type,
      is_special_taxpayer: client.is_special_taxpayer || false,
      fiscal_country_id: cleanValueForForm(client.fiscal_country_id) as
        | number
        | undefined,
      fiscal_state_id: cleanValueForForm(client.fiscal_state_id) as
        | number
        | undefined,
      fiscal_city_id: cleanValueForForm(client.fiscal_city_id) as
        | number
        | undefined,
      fiscal_zone_id: cleanValueForForm(client.fiscal_zone_id) as
        | number
        | undefined,
      email: client.email || "",
      main_phone: client.main_phone || "",
      mobile_phone: client.mobile_phone || "",
      contact_person: client.contact_person || "",
      contact_email: client.contact_email || "",
      contact_phone: client.contact_phone || "",
      commercial_name: client.commercial_name || "",
      delivery_address: client.delivery_address || "",
      fiscal_address: client.fiscal_address || "",
      zip_code: client.zip_code || "",
      latitude: cleanValueForForm(client.latitude) as number | undefined,
      longitude: cleanValueForForm(client.longitude) as number | undefined,
      map_link: client.map_link || "",
      payment_term_id: cleanValueForForm(client.payment_term_id) as
        | number
        | undefined,
      credit_limit: cleanValueForForm(client.credit_limit) as
        | number
        | undefined,
      credit_days: cleanValueForForm(client.credit_days) as number | undefined,
      has_credit: client.has_credit ?? false,
      default_discount_percentage: cleanValueForForm(
        client.default_discount_percentage
      ) as number | undefined,
      default_price_level: cleanValueForForm(client.default_price_level) as
        | number
        | undefined,
      notes: client.notes || "",
      balance_due: cleanValueForForm(client.balance_due) as number | undefined,
      advance_balance: cleanValueForForm(client.advance_balance) as
        | number
        | undefined,
      average_payment_days: cleanValueForForm(client.average_payment_days) as
        | number
        | undefined,
      last_sale_date: client.last_sale_date || undefined,
      last_sale_number: client.last_sale_number || "",
      last_sale_amount: cleanValueForForm(client.last_sale_amount) as
        | number
        | undefined,
      last_order_date: client.last_order_date || undefined,
      last_order_number: client.last_order_number || "",
      last_order_amount: cleanValueForForm(client.last_order_amount) as
        | number
        | undefined,
      last_payment_date: client.last_payment_date || undefined,
      last_payment_number: client.last_payment_number || "",
      last_payment_amount: cleanValueForForm(client.last_payment_amount) as
        | number
        | undefined,
      is_active: client.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      businessTypeId: undefined,
      salespersonUserId: undefined,
      zoneId: undefined,
      client_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      client_type: "",
      is_special_taxpayer: false,
      fiscal_country_id: undefined,
      fiscal_state_id: undefined,
      fiscal_city_id: undefined,
      fiscal_zone_id: undefined,
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      commercial_name: "",
      delivery_address: "",
      fiscal_address: "",
      zip_code: "",
      latitude: undefined,
      longitude: undefined,
      map_link: "",
      payment_term_id: undefined,
      credit_limit: undefined,
      credit_days: undefined,
      has_credit: false,
      default_discount_percentage: undefined,
      default_price_level: undefined,
      notes: "",
      balance_due: undefined,
      advance_balance: undefined,
      average_payment_days: undefined,
      last_sale_date: undefined,
      last_sale_number: "",
      last_sale_amount: undefined,
      last_order_date: undefined,
      last_order_number: "",
      last_order_amount: undefined,
      last_payment_date: undefined,
      last_payment_number: "",
      last_payment_amount: undefined,
      is_active: true,
    });
    setEditingClient(null);
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "legal_name",
      header: "Razón Social",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("legal_name")}</div>
      ),
    },
    {
      accessorKey: "client_code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("client_code")}</div>
      ),
    },
    {
      accessorKey: "commercial_name",
      header: "Nombre Comercial",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("commercial_name") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "tax_document_type",
      header: "Tipo Doc.",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("tax_document_type")}</div>
      ),
    },
    {
      accessorKey: "tax_document_number",
      header: "Número Doc.",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("tax_document_number")}</div>
      ),
    },
    {
      accessorKey: "salespersonUserId",
      header: "Vendedor",
      cell: ({ row }) => {
        const sellerId = row.getValue("salespersonUserId") as number;
        const seller = sellers.find((s) => s.id === sellerId);
        return <div className="font-medium">{seller?.name || "-"}</div>;
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
      accessorKey: "main_phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("main_phone") || "-"}</div>
      ),
    },
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

  const isSubmitting = isCreating || isUpdating;

  // Agrega esto en tu componente, después de la declaración del form
  useEffect(() => {
    console.log("Form state changed - isValid:", form.formState.isValid);
    console.log("Form state changed - errors:", form.formState.errors);
    console.log(
      "Form state changed - isSubmitting:",
      form.formState.isSubmitting
    );
  }, [
    form.formState.isValid,
    form.formState.errors,
    form.formState.isSubmitting,
  ]);

  // También para ver cambios en los campos
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      console.log(`Field ${name} changed:`, value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
              Clientes
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar..."
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
                <DropdownMenuContent align="end" className="w-[18rem]">
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
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo cliente</span>
              </Button>
            </div>
          </div>

          <DataTable<Client, Client>
            columns={columns}
            data={clientsResponse || []}
            noResultsText="No se encontraron clientes"
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
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingClient ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={async (e) => {
                console.log("Form submit event triggered");
                e.preventDefault();

                try {
                  console.log("Manually validating form...");

                  // Validación manual directa
                  const isValid = await form.trigger();
                  console.log("Form validation result:", isValid);

                  if (!isValid) {
                    const errors = form.formState.errors;
                    console.log("Form errors:", errors);
                    toast.error(
                      "Por favor, corrige los errores en el formulario"
                    );
                    return;
                  }

                  // Obtener valores directamente
                  const values = form.getValues();
                  console.log("Form values:", values);
                  console.log("Editing client:", editingClient);

                  // Llamar a onSubmit manualmente
                  await onSubmit(values);
                } catch (error) {
                  console.error("Form submission error:", error);
                }
              }}
              noValidate
            >
              <div className="grid gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información Básica</h3>

                    <FormField
                      control={form.control}
                      name="legal_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razón Social *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commercial_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Comercial</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Cliente *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salespersonUserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendedor</FormLabel>
                          <Select
                            value={field.value?.toString() || "0"}
                            onValueChange={(value) =>
                              field.onChange(
                                value === "0" ? undefined : parseInt(value)
                              )
                            }
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un vendedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Sin vendedor</SelectItem>
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
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Información fiscal */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información Fiscal</h3>

                    <FormField
                      control={form.control}
                      name="tax_document_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Documento Fiscal *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un tipo de documento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {taxDocumentTypes.map((type) => (
                                <SelectItem key={type.name} value={type.value}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tax_document_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento Fiscal *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="client_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cliente *</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) => {
                              if (value !== "none") {
                                field.onChange(value);
                              }
                            }}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un tipo de cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none" disabled>
                                Selecciona una opción
                              </SelectItem>
                              {clientTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* En la sección de Información Fiscal, después del campo client_type */}
                    <FormField
                      control={form.control}
                      name="is_special_taxpayer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>¿Contribuyente especial?</FormLabel>
                            <FormDescription className="text-xs sm:text-sm">
                              Marcar si el cliente es un contribuyente especial
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información de contacto */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información de Contacto</h3>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="main_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono Principal</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono Móvil</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contacto</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="w-full"
                              disabled={isSubmitting}
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
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dirección y crédito */}
                  <div className="space-y-4 ">
                    <h3 className="font-medium">Dirección y Crédito</h3>
                    {/* En la sección de Dirección y Crédito, antes del delivery_address */}
                    <FormField
                      control={form.control}
                      name="fiscal_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección Fiscal</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              rows={3}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección de Entrega</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              rows={3}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem className="mt-12">
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_credit"
                      render={({ field }) => (
                        <FormItem className="-mt-0.5 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>¿Tiene crédito?</FormLabel>
                            <FormDescription className="text-xs sm:text-sm">
                              Habilitar si el cliente tiene línea de crédito
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("has_credit") && (
                      <>
                        <FormField
                          control={form.control}
                          name="credit_limit"
                          render={({ field }) => (
                            <FormItem className="-mt-3">
                              <FormLabel>Límite de Crédito</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined
                                    )
                                  }
                                  className="w-full"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="credit_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Días de Crédito</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined
                                    )
                                  }
                                  className="w-full"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Notas y estado */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                  disabled={isSubmitting}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting
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
