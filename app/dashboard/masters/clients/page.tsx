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
import useGetClients from "@/hooks/clients/useGetClients";
import useUpdateClient from "@/hooks/clients/useUpdateClient";
import useDeleteClient from "@/hooks/clients/useDeleteClient";
import useAddClient from "@/hooks/clients/useAddClients";
import useGetPaymentTerms from "@/hooks/paymentTerms/useGetPaymentTerms";
import { PaymentTermType, ClientType } from "@/types";
import { useGetSellers } from "@/hooks/users/useGetSellsers";
import { useClientTypes } from "@/hooks/clients/useClientTypes";
import { clientTypeTranslations } from "@/utils/clientTypeTranslations";
import { TAX_DOCUMENT_TYPES } from "@/utils/constants";
import { SelectSearchable } from "@/components/ui/select-searchable";
import { useUserCompany } from "@/hooks/auth/useUserCompany"; // ✅ IMPORTAR EL HOOK

export type Client = {
  id?: string;
  businessTypeId?: number;
  salespersonUserId?: number;
  salesperson?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  zoneId?: number;
  client_code: string;
  legal_name: string;
  tax_document_type: string;
  tax_document_number: string;
  client_type: string;
  is_special_taxpayer?: boolean;
  fiscalCountryId?: number;
  fiscalStateId?: number;
  fiscalCityId?: number;
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
  payment_term?: PaymentTermType;
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
  paymentTermId?: number;
  tax_id?: string;
  companyId?: number;
  company?: {
    id: number;
    name: string;
  };
};

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
  // ✅ CORREGIDO: Usar camelCase
  fiscalCountryId: z.union([z.number(), z.string(), z.undefined()]).optional(),
  fiscalStateId: z.union([z.number(), z.string(), z.undefined()]).optional(),
  fiscalCityId: z.union([z.number(), z.string(), z.undefined()]).optional(),
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

  const {
    companyId,
    isLoading: companyLoading,
    isSuperAdmin,
    userCompany,
  } = useUserCompany();

  const { users: sellers, loading: sellersLoading } = useGetSellers();
  const {
    clientTypes,
    loading: clientTypesLoading,
    error: clientTypesError,
  } = useClientTypes();

  const [taxDocumentTypes, setTaxDocumentTypes] = useState<
    { value: string; name: string }[]
  >([]);

  const sellerOptions = sellers
    .filter((user) => user.is_active)
    .map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
    }));

  const sellerSelectOptions = sellerOptions.map((seller) => ({
    value: seller.id.toString(),
    label: seller.name,
  }));

  // Agregar opción "Sin vendedor"
  const sellerOptionsWithEmpty = [
    { value: "0", label: "Sin vendedor" },
    ...sellerSelectOptions,
  ];

  const {
    paymentTerms,
    loading: paymentTermsLoading,
    error: paymentTermsError,
  } = useGetPaymentTerms();

  // ✅ EL HOOK useGetClients AHORA FILTRA AUTOMÁTICAMENTE POR companyId
  const {
    clientsResponse,
    page,
    itemsPerPage,
    total,
    totalPage,
    setPage,
    setItemsPerPage,
    setModified,
    updateClientInState,
    loading: clientsLoading,
    companyId: currentCompanyId,
  } = useGetClients({
    search: searchTerm,
    salespersonUserId: selectedSeller !== "all" ? selectedSeller : undefined,
  });

  const { createClient, isLoading: isCreating } = useAddClient({
    onSuccess: () => {
      toast.success("Cliente creado exitosamente");
      setModified();
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
    onSuccess: (updatedClient) => {
      toast.success("Cliente actualizado exitosamente");
      updateClientInState(updatedClient);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el cliente";
      toast.error(errorMessage);
      console.error("❌ Error actualizando cliente:", error);
    },
    onUpdateLocalState: (updatedClient) => {
      updateClientInState(updatedClient);
    },
  });

  const { deleteClient } = useDeleteClient({
    onSuccess: () => {
      toast.success("Cliente eliminado exitosamente");
      setModified();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar el cliente";
      toast.error(errorMessage);
    },
  });

  const activePaymentTerms = paymentTerms.filter((term) => term.is_active);

  useEffect(() => {
    const formattedTypes = TAX_DOCUMENT_TYPES.map((type) => ({
      value: type,
      name: type.toUpperCase(),
    }));

    setTaxDocumentTypes(formattedTypes);
  }, []);

  useEffect(() => {
    if (paymentTermsError) {
      console.error("Error loading payment terms:", paymentTermsError);
      toast.error("Error al cargar los términos de pago");
    }
  }, [paymentTermsError]);

  useEffect(() => {
    if (clientTypesError) {
      console.error("Error loading client types:", clientTypesError);
      toast.error("Error al cargar los tipos de cliente");
    }
  }, [clientTypesError]);

  useEffect(() => {
    if (companyLoading) {
      console.log("🔄 Cargando información de la empresa...");
    } else if (companyId) {
      console.log(`✅ Empresa cargada: ${companyId}`, userCompany);
      if (userCompany) {
        console.log("🏢 Datos de empresa:", {
          id: userCompany.id,
          name: userCompany.name,
          legal_tax_id: userCompany.legal_tax_id,
          external_code: userCompany.external_code,
        });
      }
    } else {
      console.log("❌ No se pudo obtener la empresa del usuario");
    }
  }, [companyLoading, companyId, userCompany, isSuperAdmin]);

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
      fiscalCountryId: undefined,
      fiscalStateId: undefined,
      fiscalCityId: undefined,
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

  useEffect(() => {
    if (isModalOpen && editingClient) {
      const currentClient = clientsResponse.find(
        (c) => c.id === editingClient.id
      );

      if (currentClient) {
        setTimeout(() => {
          form.setValue(
            "salespersonUserId",
            currentClient.salespersonUserId !== undefined &&
              currentClient.salespersonUserId !== null &&
              currentClient.salespersonUserId !== 0
              ? currentClient.salespersonUserId
              : undefined
          );
        }, 100);
      }
    }
  }, [isModalOpen, editingClient, clientsResponse, form]);

  const onSubmit = async (values: ClientForm) => {
    try {
      const isSpecialTaxpayer = values.client_type === "special_taxpayer";

      // ✅ Datos base
      const cleanData: Record<string, unknown> = {
        client_code: values.client_code,
        legal_name: values.legal_name,
        tax_document_type: values.tax_document_type,
        tax_document_number: values.tax_document_number,
        client_type: values.client_type,
        is_special_taxpayer: isSpecialTaxpayer,
        has_credit: values.has_credit ?? false,
        is_active: values.is_active ?? true,
      };

      const cleanValue = (value: unknown, fieldName?: string): unknown => {
        if (value === undefined || value === null || value === "") {
          return null;
        }

        // ✅ MANTENER la lógica de salespersonUserId
        if (fieldName === "salespersonUserId") {
          if (value === "0" || value === 0 || value === null) {
            return null;
          }
          return Number(value);
        }

        const stringFields = [
          "main_phone",
          "mobile_phone",
          "contact_phone",
          "zip_code",
          "email",
          "contact_email",
          "contact_person",
          "commercial_name",
          "delivery_address",
          "fiscal_address",
          "map_link",
          "notes",
          "last_sale_number",
          "last_order_number",
          "last_payment_number",
        ];

        if (stringFields.includes(fieldName || "")) {
          if (typeof value === "number") {
            return value.toString();
          }
          return value;
        }

        if (
          typeof value === "string" &&
          !isNaN(Number(value)) &&
          value !== ""
        ) {
          return Number(value);
        }

        return value;
      };

      // ✅ INCLUIR salespersonUserId en los campos opcionales
      const optionalFields = [
        "businessTypeId",
        "salespersonUserId", // ← ESTE ES EL ÚNICO CAMPO PARA EL VENDEDOR
        "zoneId",
        "fiscalCountryId",
        "fiscalStateId",
        "fiscalCityId",
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
        const cleanedValue = cleanValue(value, field);
        if (cleanedValue !== undefined && cleanedValue !== null) {
          cleanData[field] = cleanedValue;
        }
      });

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
    if (!client.id) {
      toast.error("No se puede eliminar: Cliente sin ID válido");
      return;
    }

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
    const currentClient =
      clientsResponse.find((c) => c.id === client.id) || client;

    setEditingClient(currentClient);

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

    let salespersonUserIdValue = undefined;

    if (currentClient.salesperson && currentClient.salesperson.id) {
      salespersonUserIdValue = currentClient.salesperson.id;
    } else if (
      currentClient.salespersonUserId !== undefined &&
      currentClient.salespersonUserId !== null &&
      currentClient.salespersonUserId !== 0
    ) {
      salespersonUserIdValue = currentClient.salespersonUserId;
    } else {
      console.log("❌ No se encontró vendedor asignado");
    }

    form.reset({
      businessTypeId: cleanValueForForm(currentClient.businessTypeId) as
        | number
        | undefined,
      salespersonUserId: salespersonUserIdValue,
      zoneId: cleanValueForForm(currentClient.zoneId) as number | undefined,
      client_code: currentClient.client_code || "",
      legal_name: currentClient.legal_name || "",
      tax_document_type: currentClient.tax_document_type || "",
      tax_document_number: currentClient.tax_document_number || "",
      client_type: currentClient.client_type || "",
      fiscalCountryId: cleanValueForForm(currentClient.fiscalCountryId) as
        | number
        | undefined,
      fiscalStateId: cleanValueForForm(currentClient.fiscalStateId) as
        | number
        | undefined,
      fiscalCityId: cleanValueForForm(currentClient.fiscalCityId) as
        | number
        | undefined,
      fiscal_zone_id: cleanValueForForm(currentClient.fiscal_zone_id) as
        | number
        | undefined,
      email: currentClient.email || "",
      main_phone: currentClient.main_phone || "",
      mobile_phone: currentClient.mobile_phone || "",
      contact_person: currentClient.contact_person || "",
      contact_email: currentClient.contact_email || "",
      contact_phone: currentClient.contact_phone || "",
      commercial_name: currentClient.commercial_name || "",
      delivery_address: currentClient.delivery_address || "",
      fiscal_address: currentClient.fiscal_address || "",
      zip_code: currentClient.zip_code || "",
      latitude: cleanValueForForm(currentClient.latitude) as number | undefined,
      longitude: cleanValueForForm(currentClient.longitude) as
        | number
        | undefined,
      map_link: currentClient.map_link || "",
      payment_term_id: cleanValueForForm(currentClient.payment_term_id) as
        | number
        | undefined,
      credit_limit: cleanValueForForm(currentClient.credit_limit) as
        | number
        | undefined,
      credit_days: cleanValueForForm(currentClient.credit_days) as
        | number
        | undefined,
      has_credit: currentClient.has_credit ?? false,
      default_discount_percentage: cleanValueForForm(
        currentClient.default_discount_percentage
      ) as number | undefined,
      default_price_level: cleanValueForForm(
        currentClient.default_price_level
      ) as number | undefined,
      notes: currentClient.notes || "",
      balance_due: cleanValueForForm(currentClient.balance_due) as
        | number
        | undefined,
      advance_balance: cleanValueForForm(currentClient.advance_balance) as
        | number
        | undefined,
      average_payment_days: cleanValueForForm(
        currentClient.average_payment_days
      ) as number | undefined,
      last_sale_date: currentClient.last_sale_date || undefined,
      last_sale_number: currentClient.last_sale_number || "",
      last_sale_amount: cleanValueForForm(currentClient.last_sale_amount) as
        | number
        | undefined,
      last_order_date: currentClient.last_order_date || undefined,
      last_order_number: currentClient.last_order_number || "",
      last_order_amount: cleanValueForForm(currentClient.last_order_amount) as
        | number
        | undefined,
      last_payment_date: currentClient.last_payment_date || undefined,
      last_payment_number: currentClient.last_payment_number || "",
      last_payment_amount: cleanValueForForm(
        currentClient.last_payment_amount
      ) as number | undefined,
      is_active: currentClient.is_active ?? true,
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
      fiscalCountryId: undefined,
      fiscalStateId: undefined,
      fiscalCityId: undefined,
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
      accessorKey: "companyId",
      header: "Empresa",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="font-medium text-sm text-gray-600">
            {client.company?.name || `Empresa ID: ${client.companyId}`}
          </div>
        );
      },
    },
    {
      accessorKey: "salespersonUserId",
      header: "Vendedor",
      cell: ({ row }) => {
        const client = row.original;

        const sellerId = client.salespersonUserId;

        if (sellerId === undefined || sellerId === null || sellerId === 0) {
          return <div className="font-medium text-gray-500">Sin vendedor</div>;
        }

        // Buscar en sellerOptions usando salespersonUserId
        const sellerIdNum = Number(sellerId);
        const seller = sellerOptions.find((s) => s.id === sellerIdNum);

        if (seller) {
          return <div className="font-medium">{seller.name}</div>;
        }

        // Fallback: mostrar datos del objeto salesperson
        if (client.salesperson) {
          return (
            <div className="font-medium">
              {client.salesperson.first_name} {client.salesperson.last_name}
            </div>
          );
        }

        return (
          <div className="font-medium text-gray-500">
            Vendedor no encontrado
          </div>
        );
      },
    },

    {
      accessorKey: "payment_term_id",
      header: "Término de Pago",
      cell: ({ row }) => {
        const paymentTermId = row.getValue("payment_term_id") as number;
        const paymentTerm = activePaymentTerms.find(
          (term) => term.id === paymentTermId
        );
        return (
          <div className="font-medium">
            {paymentTerm
              ? `${paymentTerm.term_name} (${paymentTerm.number_of_days} días)`
              : "-"}
          </div>
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

  // ✅ LOADING STATE COMBINADO
  const isLoading = clientsLoading || companyLoading;

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
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
                Clientes
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código, documento..."
                  className="pl-8 "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className=" gap-2"
                    disabled={isLoading}
                  >
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
                      disabled={isLoading}
                    >
                      <SelectTrigger id="seller-filter" className="mt-1">
                        <SelectValue placeholder="Todos los vendedores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todos los vendedores
                        </SelectItem>
                        {sellerOptions.map((seller) => (
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
                disabled={isSubmitting || isLoading}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo cliente</span>
              </Button>
            </div>
          </div>

          {/* ✅ MOSTRAR LOADING STATE */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando clientes...</p>
              </div>
            </div>
          ) : (
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
          )}
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingClient ? "Editar cliente" : "Crear Nuevo cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Modifica la información del cliente"
                : "Completa la información para crear un nuevo cliente"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  const isValid = await form.trigger();

                  if (!isValid) {
                    toast.error(
                      "Por favor, corrige los errores en el formulario"
                    );
                    return;
                  }

                  const values = form.getValues();

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
                              placeholder="Ingresa la razón social del cliente"
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
                              placeholder="Ingresa el nombre comercial"
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
                              placeholder="Ej: CLI-001"
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
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Vendedor</FormLabel>
                            <FormControl>
                              <SelectSearchable
                                value={
                                  field.value === null ||
                                  field.value === undefined ||
                                  field.value === 0
                                    ? "0"
                                    : field.value.toString()
                                }
                                onValueChange={(value) => {
                                  if (value === "0") {
                                    field.onChange(undefined);
                                  } else {
                                    field.onChange(Number(value));
                                  }
                                }}
                                placeholder={
                                  sellersLoading
                                    ? "Cargando vendedores..."
                                    : "Buscar vendedor..."
                                }
                                options={sellerOptionsWithEmpty}
                                emptyMessage="No se encontraron vendedores."
                                searchPlaceholder="Buscar por nombre de vendedor..."
                                className="w-full"
                                disabled={isSubmitting || sellersLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
                          <FormLabel>Tipo de Documento *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de documento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {taxDocumentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
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
                              placeholder="Ingresa el número de documento"
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
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={isSubmitting || clientTypesLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    clientTypesLoading
                                      ? "Cargando tipos..."
                                      : clientTypesError
                                      ? "Error al cargar"
                                      : "Selecciona un tipo de cliente"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientTypesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Cargando tipos de cliente...
                                </SelectItem>
                              ) : clientTypesError ? (
                                <SelectItem value="error" disabled>
                                  Error al cargar tipos
                                </SelectItem>
                              ) : clientTypes.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  No hay tipos disponibles
                                </SelectItem>
                              ) : (
                                clientTypes.map((type: ClientType) => (
                                  <SelectItem key={type.id} value={type.name}>
                                    {/* Aplica la traducción aquí */}
                                    {clientTypeTranslations[type.name] ||
                                      type.name}
                                    {type.description &&
                                      ` - ${type.description}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* ELIMINADO: El checkbox de contribuyente especial ya no es necesario */}
                  </div>
                </div>

                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Información de contacto */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información de Contacto</h3>
                    <div className="mt-6.5 space-y-4">
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
                                placeholder="cliente@empresa.com"
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
                                placeholder="+58 412 123 4567"
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
                                placeholder="+58 414 123 4567"
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
                                placeholder="Nombre del contacto principal"
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
                                placeholder="contacto@empresa.com"
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
                                placeholder="+58 212 123 4567"
                                className="w-full"
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Dirección y crédito */}
                  <div className=" space-y-4 ">
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
                              placeholder="Ingresa la dirección fiscal completa"
                              className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                              placeholder="Ingresa la dirección para entregas"
                              className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: 1010"
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Selector de Términos de Pago - AGREGADO */}
                    <FormField
                      control={form.control}
                      name="payment_term_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Término de Pago</FormLabel>
                          <Select
                            value={field.value?.toString() || "0"}
                            onValueChange={(value) =>
                              field.onChange(
                                value === "0" ? undefined : parseInt(value)
                              )
                            }
                            disabled={isSubmitting || paymentTermsLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    paymentTermsLoading
                                      ? "Cargando términos..."
                                      : "Selecciona un término de pago"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">
                                Sin término de pago
                              </SelectItem>
                              {activePaymentTerms.map((term) => (
                                <SelectItem
                                  key={term.id}
                                  value={term.id.toString()}
                                >
                                  {term.term_name} ({term.number_of_days} días)
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
                      name="has_credit"
                      render={({ field }) => (
                        <FormItem className="bg-white flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                            <FormItem>
                              <FormLabel>Límite de Crédito</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="0.00"
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
                                  placeholder="30"
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
                            placeholder="Información adicional sobre el cliente..."
                            className="bg-white flex w-full rounded-md border border-input  px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
