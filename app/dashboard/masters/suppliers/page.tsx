"use client";

import { useState, useMemo, useEffect } from "react";
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

import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";

// Importar hooks
import useGetSuppliers from "@/hooks/suppliers/useGetSuppliers";
import useAddSupplier from "@/hooks/suppliers/useAddSupplier";
import usePutSupplier from "@/hooks/suppliers/usePutSupplier";
import useDeleteSupplier from "@/hooks/suppliers/useDeleteSupplier";
import useGetOneSupplier from "@/hooks/suppliers/useGetOneSupplier";
import { useAuth } from "@/context/AuthContext";
import { SupplierCreatePayload, SupplierType, ApiError } from "@/types";

import { TAX_DOCUMENT_TYPES } from "@/utils/constants";
import useGetPaymentTermsForSelect from "@/hooks/paymentTerms/useGetPaymentTermsForSelect";
import useGetCompaniesForSelect from "@/hooks/companies/useGetCompaniesForSelect";
import { SelectSearchable } from "@/components/ui/select-searchable";
import { supplierService } from "@/services/suppliers/suppliers.service";

// Esquema de Zod - REESTRUCTURADO
const supplierSchema = z.object({
  // Campos requeridos
  supplier_code: z.string().min(1, "El código es requerido"),
  legal_name: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  tax_document_type: z.string().min(1, "El tipo de documento es requerido"),
  tax_document_number: z.string().min(1, "El número de documento es requerido"),
  person_type: z.string().min(1, "El tipo de persona es requerido"),

  // Campos opcionales con valores por defecto explícitos
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  main_phone: z.string().optional().or(z.literal("")),
  mobile_phone: z.string().optional().or(z.literal("")),
  contact_person: z.string().optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  commercial_name: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  fiscal_address: z.string().optional().or(z.literal("")),
  zip_code: z.string().optional().or(z.literal("")),
  external_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),

  // Campos numéricos con transformación explícita
  paymentTermId: z.union([z.number(), z.null()]).optional(),
  credit_limit: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number().min(0, "El límite de crédito no puede ser negativo"))
    .default(0),
  credit_days: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number().min(0, "Los días de crédito no pueden ser negativos"))
    .default(0),
  balance_due: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number())
    .default(0),
  advance_balance: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number())
    .default(0),
  last_purchase_amount: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number())
    .default(0),
  last_payment_amount: z
    .union([
      z.string().transform((val) => (val === "" ? 0 : Number(val))),
      z.number(),
    ])
    .pipe(z.number())
    .default(0),

  // Campos de fecha y texto
  last_purchase_date: z.string().optional().or(z.literal("")),
  last_payment_date: z.string().optional().or(z.literal("")),
  last_purchase_number: z.string().optional().or(z.literal("")),
  last_payment_number: z.string().optional().or(z.literal("")),

  // Campos de usuario
  created_by: z.string().optional().or(z.literal("")),
  updated_by: z.string().optional().or(z.literal("")),

  // Campo booleano
  is_active: z.boolean().default(true),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

// Tipo para el campo del formulario
interface FormFieldProps {
  field: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    name: string;
  };
}

const SuppliersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(
    null
  );

  const {
    suppliersResponse,
    setModified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch,
    setCompanyId,
    page,
    itemsPerPage,
    search,
    companyId,
  } = useGetSuppliers();

  const { createSupplier, loading: creating } = useAddSupplier();
  const { updateSupplier, loading: updating } = usePutSupplier();
  const { deleteSupplier } = useDeleteSupplier();
  const { supplier: currentSupplier, loading: loadingOne } =
    useGetOneSupplier(editingSupplierId);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { paymentTerms: realPaymentTerms, loading: paymentTermsLoading } =
    useGetPaymentTermsForSelect();
  const { companyOptions } = useGetCompaniesForSelect();

  const filteredSuppliers = useMemo(() => {
    if (!suppliersResponse) return [];
    return suppliersResponse.filter((supplier: SupplierType) => {
      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = supplier.is_active;
      } else if (statusFilter === "inactive") {
        matchesStatus = !supplier.is_active;
      }
      return matchesStatus;
    });
  }, [suppliersResponse, statusFilter]);

  const taxDocumentTypes = useMemo(() => {
    return TAX_DOCUMENT_TYPES.map((type) => ({
      value: type,
      name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    }));
  }, []);

  // Función para verificar posibles duplicados
  const checkForDuplicateFields = async (
    supplierData: SupplierCreatePayload
  ): Promise<string | null> => {
    try {
      const checks = [
        {
          field: "tax_document_number" as const,
          value: supplierData.tax_document_number,
        },
        { field: "external_code" as const, value: supplierData.external_code },
        { field: "email" as const, value: supplierData.email },
      ];

      for (const check of checks) {
        if (check.value) {
          const params = {
            companyId: supplierData.companyId,
            [check.field]: check.value,
            page: 1,
            itemsPerPage: 1,
          };

          const response = await supplierService.getSuppliers(params);
          const exists =
            response.success &&
            response.data &&
            response.data.data &&
            response.data.data.length > 0;

          if (exists) {
            console.log(
              `⚠️  Campo duplicado encontrado: ${check.field} = ${check.value}`
            );
            return check.field;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error checking duplicate fields:", error);
      return null;
    }
  };

  const checkSupplierCodeExists = async (
    companyId: number,
    supplierCode: string
  ): Promise<boolean> => {
    try {
      console.log("🔍 Verificando código:", { companyId, supplierCode });

      // Primero verifica localmente
      if (suppliersResponse && suppliersResponse.length > 0) {
        const exists = suppliersResponse.some(
          (supplier: SupplierType) =>
            supplier.companyId === companyId &&
            supplier.supplier_code === supplierCode
        );

        console.log("✅ Existe localmente:", exists);
        if (exists) return true;
      }

      // Consulta a la API
      const params = {
        companyId,
        supplier_code: supplierCode,
        page: 1,
        itemsPerPage: 1,
      };

      const response = await supplierService.getSuppliers(params);

      console.log("📡 Respuesta completa:", response);

      // Verificar diferentes estructuras de respuesta
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        const exists = response.data.data.length > 0;
        console.log("✅ Existe en API (data.data):", exists);
        return exists;
      }

      if (response.data && Array.isArray(response.data)) {
        const exists = response.data.length > 0;
        console.log("✅ Existe en API (data):", exists);
        return exists;
      }

      if (Array.isArray(response)) {
        const exists = response.length > 0;
        console.log("✅ Existe en API (array directo):", exists);
        return exists;
      }

      console.log("❌ No se encontró en ninguna estructura");
      return false;
    } catch (error) {
      console.error("❌ Error checking supplier code:", error);
      return false;
    }
  };

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(
      supplierSchema
    ) as unknown as Resolver<SupplierFormData>,
    defaultValues: {
      supplier_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      person_type: "",
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_phone: "",
      commercial_name: "",
      address: "",
      fiscal_address: "",
      zip_code: "",
      paymentTermId: null,
      credit_limit: 0,
      credit_days: 0,
      notes: "",
      balance_due: 0,
      advance_balance: 0,
      last_purchase_date: "",
      last_payment_date: "",
      last_purchase_number: "",
      last_payment_number: "",
      last_purchase_amount: 0,
      last_payment_amount: 0,
      is_active: true,
      created_by: user?.username || "admin",
      updated_by: user?.username || "admin",
      external_code: "",
    },
  });

  useEffect(() => {
    if (currentSupplier && editingSupplierId) {
      console.log("🔄 Setting form data for editing:", {
        currentSupplier,
        editingSupplierId,
      });

      const formData: SupplierFormData = {
        supplier_code: currentSupplier.supplier_code || "",
        legal_name: currentSupplier.legal_name || "",
        tax_document_type: currentSupplier.tax_document_type || "",
        tax_document_number: currentSupplier.tax_document_number || "",
        person_type: currentSupplier.person_type || "",
        email: currentSupplier.email || "",
        main_phone: currentSupplier.main_phone || "",
        mobile_phone: currentSupplier.mobile_phone || "",
        contact_person: currentSupplier.contact_person || "",
        contact_phone: currentSupplier.contact_phone || "",
        commercial_name: currentSupplier.commercial_name || "",
        address: currentSupplier.address || "",
        fiscal_address: currentSupplier.fiscal_address || "",
        zip_code: currentSupplier.zip_code || "",
        paymentTermId: currentSupplier.paymentTermId || null,
        credit_limit: currentSupplier.credit_limit || 0,
        credit_days: currentSupplier.credit_days || 0,
        notes: currentSupplier.notes || "",
        balance_due: currentSupplier.balance_due || 0,
        advance_balance: currentSupplier.advance_balance || 0,
        last_purchase_date: currentSupplier.last_purchase_date || "",
        last_payment_date: currentSupplier.last_payment_date || "",
        last_purchase_number: currentSupplier.last_purchase_number || "",
        last_payment_number: currentSupplier.last_payment_number || "",
        last_purchase_amount: currentSupplier.last_purchase_amount || 0,
        last_payment_amount: currentSupplier.last_payment_amount || 0,
        is_active: currentSupplier.is_active ?? true,
        created_by: currentSupplier.created_by || user?.username || "admin",
        updated_by: user?.username || "admin",
        external_code: currentSupplier.external_code || "",
      };

      console.log("🎯 Final form data to set:", formData);

      setTimeout(() => {
        form.reset(formData);
      }, 0);
    }
  }, [currentSupplier, editingSupplierId, form, user]);

  const onSubmit = async (data: SupplierFormData) => {
    console.log("🎯 onSubmit triggered", { editingSupplierId, data });

    try {
      const userCompanyId = user?.company_id || 4;

      if (!userCompanyId) {
        toast.error("No se pudo determinar la compañía del usuario");
        return;
      }

      console.log("🏢 Usando companyId del usuario:", userCompanyId);

      const cleanValue = (
        value: string | number | undefined
      ): string | number | undefined => (value === "" ? undefined : value);

      // Si es un nuevo proveedor, verificar duplicados
      if (!editingSupplierId) {
        // Verificar código de proveedor
        const codeExists = await checkSupplierCodeExists(
          userCompanyId,
          data.supplier_code
        );
        if (codeExists) {
          toast.error(
            "El código de proveedor ya existe. Por favor, usa un código diferente."
          );
          return;
        }

        // Preparar datos para verificar otros campos únicos
        const supplierDataForCheck: SupplierCreatePayload = {
          companyId: userCompanyId,
          supplier_code: data.supplier_code,
          legal_name: data.legal_name,
          tax_document_type: data.tax_document_type,
          tax_document_number: data.tax_document_number,
          person_type: data.person_type,
          email: cleanValue(data.email) as string | undefined,
          external_code: cleanValue(data.external_code) as string | undefined,
        };

        // Verificar otros campos únicos
        const duplicateField = await checkForDuplicateFields(
          supplierDataForCheck
        );
        if (duplicateField) {
          const fieldNames: { [key: string]: string } = {
            tax_document_number: "número de documento",
            external_code: "código externo",
            email: "email",
          };

          toast.error(
            `El ${
              fieldNames[duplicateField] || duplicateField
            } ya existe. Por favor, usa un valor diferente.`
          );
          return;
        }
      }

      const supplierData: SupplierCreatePayload = {
        companyId: userCompanyId,
        supplier_code: data.supplier_code,
        legal_name: data.legal_name,
        tax_document_type: data.tax_document_type,
        tax_document_number: data.tax_document_number,
        person_type: data.person_type,
        email: cleanValue(data.email) as string | undefined,
        main_phone: cleanValue(data.main_phone) as string | undefined,
        mobile_phone: cleanValue(data.mobile_phone) as string | undefined,
        contact_person: cleanValue(data.contact_person) as string | undefined,
        contact_phone: cleanValue(data.contact_phone) as string | undefined,
        commercial_name: cleanValue(data.commercial_name) as string | undefined,
        address: cleanValue(data.address) as string | undefined,
        fiscal_address: cleanValue(data.fiscal_address) as string | undefined,
        zip_code: cleanValue(data.zip_code) as string | undefined,
        external_code: cleanValue(data.external_code) as string | undefined,
        notes: cleanValue(data.notes) as string | undefined,

        // Términos de pago
        paymentTermId: data.paymentTermId || null,

        // Campos numéricos
        credit_limit: data.credit_limit,
        credit_days: data.credit_days,
        balance_due: data.balance_due,
        advance_balance: data.advance_balance,
        last_purchase_amount: data.last_purchase_amount,
        last_payment_amount: data.last_payment_amount,

        // Campos de fecha
        last_purchase_date:
          (cleanValue(data.last_purchase_date) as string | undefined) || null,
        last_payment_date:
          (cleanValue(data.last_payment_date) as string | undefined) || null,
        last_purchase_number: cleanValue(data.last_purchase_number) as
          | string
          | undefined,
        last_payment_number: cleanValue(data.last_payment_number) as
          | string
          | undefined,

        // Información del sistema
        is_active: data.is_active,
        created_by: user?.username || "admin",
        updated_by: user?.username || "admin",
      };

      console.log("📤 Payload final para API:", supplierData);

      if (editingSupplierId) {
        await updateSupplier(editingSupplierId, supplierData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await createSupplier(supplierData);
        toast.success("Proveedor creado exitosamente");
      }

      resetForm();
      setIsModalOpen(false);
      setModified((prev) => !prev);
    } catch (error: unknown) {
      console.error("❌ Error completo:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Error al guardar el proveedor";

      console.log("🔍 Mensaje de error:", errorMessage);

      if (
        errorMessage.includes("duplicate key") ||
        errorMessage.includes("UQ_") ||
        errorMessage.includes("unique constraint") ||
        errorMessage.includes("already exists")
      ) {
        // Intentar identificar qué campo está duplicado basado en el mensaje
        if (
          errorMessage.includes("tax_document") ||
          errorMessage.includes("document")
        ) {
          toast.error(
            "El número de documento ya existe. Por favor, usa un número diferente."
          );
        } else if (errorMessage.includes("email")) {
          toast.error("El email ya existe. Por favor, usa un email diferente.");
        } else if (errorMessage.includes("external")) {
          toast.error(
            "El código externo ya existe. Por favor, usa un código diferente."
          );
        } else {
          toast.error(
            "Ya existe un proveedor con estos datos. Por favor, verifica la información."
          );
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (supplierId: number, supplierName: string) => {
    toast.error(`¿Eliminar el proveedor "${supplierName}"?`, {
      description: "Esta acción no se puede deshacer.",
      duration: 10000,
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteSupplier(supplierId);
            toast.success("Proveedor eliminado exitosamente");
            setModified((prev) => !prev);
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Error al eliminar el proveedor";
            toast.error(errorMessage);
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

  const handleEdit = async (supplierId: number) => {
    resetForm();

    await new Promise((resolve) => setTimeout(resolve, 100));

    setEditingSupplierId(supplierId);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    resetForm();

    const generateUniqueCode = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      return `PROV${timestamp.toString().slice(-6)}${random}`;
    };

    form.setValue("supplier_code", generateUniqueCode());

    setIsModalOpen(true);
  };

  const renderNumberInput = (
    field: FormFieldProps["field"],
    isSubmitting: boolean
  ) => (
    <Input
      type="number"
      min="0"
      step="0.01"
      value={field.value as number}
      onChange={field.onChange}
      onBlur={field.onBlur}
      className="w-full"
      disabled={isSubmitting}
    />
  );

  const resetForm = () => {
    const defaultValues: SupplierFormData = {
      supplier_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      person_type: "",
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_phone: "",
      commercial_name: "",
      address: "",
      fiscal_address: "",
      zip_code: "",
      paymentTermId: null,
      credit_limit: 0,
      credit_days: 0,
      notes: "",
      balance_due: 0,
      advance_balance: 0,
      last_purchase_date: "",
      last_payment_date: "",
      last_purchase_number: "",
      last_payment_number: "",
      last_purchase_amount: 0,
      last_payment_amount: 0,
      is_active: true,
      created_by: user?.username || "admin",
      updated_by: user?.username || "admin",
      external_code: "",
    };

    form.reset(defaultValues);
    setEditingSupplierId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // Definir las columnas con tipos correctos
  const columns: ColumnDef<SupplierType>[] = [
    {
      accessorKey: "legal_name",
      header: "Proveedor",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="font-medium">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray_m" />
              <span>{supplier.legal_name}</span>
            </div>
            {supplier.commercial_name && (
              <div className="text-xs text-gray_m">
                {supplier.commercial_name}
              </div>
            )}
            <div className="text-xs text-gray_m flex items-center gap-1 mt-1">
              <span>{supplier.tax_document_type}:</span>
              <span>{supplier.tax_document_number}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "supplier_code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("supplier_code")}</div>
      ),
    },
    {
      id: "contact_info",
      header: "Contacto",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="text-sm">
            {supplier.contact_person && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{supplier.contact_person}</span>
              </div>
            )}

            {supplier.contact_phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{supplier.contact_phone}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "credit_info",
      header: "Límite de Crédito",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="text-sm">
            <div>{formatCurrency(supplier.credit_limit || 0)}</div>
            <div className="text-xs text-gray_m">
              {supplier.credit_days || 0} días
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "balance_due",
      header: "Saldo Pendiente",
      cell: ({ row }) => {
        const balance = row.getValue("balance_due") as number;
        return (
          <div className={`font-medium ${balance > 0 ? "text-red_m" : ""}`}>
            {formatCurrency(balance)}
          </div>
        );
      },
    },
    {
      accessorKey: "last_purchase_date",
      header: "Última Compra",
      cell: ({ row }) => {
        const date = row.getValue("last_purchase_date") as string;
        if (!date)
          return <div className="text-sm text-gray_m">Sin compras</div>;
        return (
          <div className="text-sm">
            <div>{formatDate(date)}</div>
            <div className="text-xs text-gray_m">
              {formatCurrency(row.original.last_purchase_amount || 0)}
            </div>
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
        const supplier = row.original;
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
                  onClick={() => handleEdit(supplier.id)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(supplier.id, supplier.legal_name)}
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

  const isSubmitting = creating || updating || loadingOne;

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
              Proveedores
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem] ">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código o documento..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

                    <div className="w-full px-2 py-1.5">
                      <Label htmlFor="company-filter">Compañía</Label>
                      <SelectSearchable
                        value={companyId?.toString() || "all"}
                        onValueChange={(value) =>
                          setCompanyId(
                            value === "all" ? undefined : parseInt(value)
                          )
                        }
                        placeholder="Todas las compañías"
                        options={[
                          { value: "all", label: "Todas las compañías" },
                          ...companyOptions,
                        ]}
                        emptyMessage="No se encontraron compañías"
                        searchPlaceholder="Buscar compañía..."
                        className="w-full mt-1"
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <Button
                onClick={handleCreateNew}
                className="gap-2 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo proveedor</span>
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredSuppliers}
            noResultsText="No se encontraron proveedores"
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
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingSupplierId ? "Editar proveedor" : "Nuevo proveedor"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplier_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            disabled={isSubmitting}
                            onBlur={async (e) => {
                              if (!editingSupplierId && field.value) {
                                const exists = await checkSupplierCodeExists(
                                  user?.company_id || 1,
                                  field.value
                                );
                                if (exists) {
                                  form.setError("supplier_code", {
                                    type: "manual",
                                    message:
                                      "Este código de proveedor ya existe",
                                  });
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="external_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Externo </FormLabel>
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
                    name="person_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Persona *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de persona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Natural">Natural</SelectItem>
                            <SelectItem value="Jurídica">Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
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
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
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
                        <FormLabel>Número de Documento *</FormLabel>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Móvil </FormLabel>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
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
                    name="fiscal_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección Fiscal</FormLabel>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Término de Pago</FormLabel>
                        <Select
                          value={field.value?.toString() || "none"}
                          onValueChange={(value) =>
                            field.onChange(
                              value === "none" ? null : Number(value)
                            )
                          }
                          disabled={isSubmitting || paymentTermsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el término de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              Sin término de pago
                            </SelectItem>
                            {realPaymentTerms.map((term) => (
                              <SelectItem
                                key={term.id}
                                value={term.id.toString()}
                              >
                                {term.term_name}{" "}
                                {term.number_of_days > 0
                                  ? `(${term.number_of_days} días)`
                                  : "(Contado)"}
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
                    name="credit_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días de Crédito</FormLabel>
                        <FormControl>
                          {renderNumberInput(field, isSubmitting)}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="credit_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Límite de Crédito</FormLabel>
                      <FormControl>
                        {renderNumberInput(field, isSubmitting)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="bg-white flex w-full rounded-md border border-input  px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                          placeholder="Escribe algo..."
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Proveedor activo</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Los proveedores inactivos no estarán disponibles para
                          las compras
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
                  disabled={isSubmitting}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingSupplierId
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

export default SuppliersPage;
