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
  Mail,
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

import { useForm } from "react-hook-form";
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
import { SupplierCreatePayload, SupplierType } from "@/types";

// Schema de validación actualizado según el swagger
const supplierSchema = z.object({
  companyId: z.number().min(1, "La compañía es requerida"),
  supplier_code: z.string().min(1, "El código es requerido"),
  legal_name: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres"),
  tax_document_type: z.string().min(1, "El tipo de documento es requerido"),
  tax_document_number: z.string().min(1, "El número de documento es requerido"),
  person_type: z.string().min(1, "El tipo de persona es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  main_phone: z.string().optional(),
  mobile_phone: z.string().optional(),
  contact_person: z.string().optional(),
  contact_email: z
    .string()
    .email("Email de contacto inválido")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional(),
  commercial_name: z.string().optional(),
  address: z.string().optional(),
  fiscal_address: z.string().optional(),
  zip_code: z.string().optional(),
  paymentTermId: z.number().optional(),
  credit_limit: z
    .number()
    .min(0, "El límite de crédito no puede ser negativo")
    .optional(),
  credit_days: z
    .number()
    .min(0, "Los días de crédito no pueden ser negativos")
    .optional(),
  notes: z.string().optional(),
  balance_due: z.number().optional(),
  advance_balance: z.number().optional(),
  is_active: z.boolean(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

// Interfaces para los datos locales
interface PaymentTerm {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
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

  // Datos de ejemplo para selects (deberías obtener estos de la API)
  const [paymentTerms] = useState<PaymentTerm[]>([
    { id: 1, name: "Contado" },
    { id: 2, name: "15 días" },
    { id: 3, name: "30 días" },
    { id: 4, name: "45 días" },
    { id: 5, name: "60 días" },
  ]);

  const [companies] = useState<Company[]>([
    { id: 1, name: "Instancia Principal" },
    { id: 2, name: "Sucursal Norte" },
    { id: 3, name: "Sucursal Sur" },
  ]);

  // Configurar form
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      companyId: 1, // Valor por defecto
      supplier_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      person_type: "",
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      commercial_name: "",
      address: "",
      fiscal_address: "",
      zip_code: "",
      paymentTermId: undefined,
      credit_limit: 0,
      credit_days: 0,
      notes: "",
      balance_due: 0,
      advance_balance: 0,
      is_active: true,
      created_by: user?.username || "admin",
      updated_by: user?.username || "admin",
    },
  });

  // Cuando se selecciona un supplier para editar, cargar sus datos
  useEffect(() => {
    if (currentSupplier && editingSupplierId) {
      form.reset({
        companyId: currentSupplier.companyId,
        supplier_code: currentSupplier.supplier_code,
        legal_name: currentSupplier.legal_name,
        tax_document_type: currentSupplier.tax_document_type,
        tax_document_number: currentSupplier.tax_document_number,
        person_type: currentSupplier.person_type,
        email: currentSupplier.email || "",
        main_phone: currentSupplier.main_phone || "",
        mobile_phone: currentSupplier.mobile_phone || "",
        contact_person: currentSupplier.contact_person || "",
        contact_email: currentSupplier.contact_email || "",
        contact_phone: currentSupplier.contact_phone || "",
        commercial_name: currentSupplier.commercial_name || "",
        address: currentSupplier.address || "",
        fiscal_address: currentSupplier.fiscal_address || "",
        zip_code: currentSupplier.zip_code || "",
        paymentTermId: currentSupplier.paymentTermId,
        credit_limit: currentSupplier.credit_limit || 0,
        credit_days: currentSupplier.credit_days || 0,
        notes: currentSupplier.notes || "",
        balance_due: currentSupplier.balance_due || 0,
        advance_balance: currentSupplier.advance_balance || 0,
        is_active: currentSupplier.is_active,
        created_by: currentSupplier.created_by,
        updated_by: user?.username || "admin",
      });
    }
  }, [currentSupplier, editingSupplierId, form, user]);

  // Filtrar suppliers según los criterios (filtro adicional en frontend si es necesario)
  const filteredSuppliers = useMemo(() => {
    if (!suppliersResponse) return [];

    return suppliersResponse.filter((supplier: SupplierType) => {
      // Filtrar por estado si es necesario
      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = supplier.is_active;
      } else if (statusFilter === "inactive") {
        matchesStatus = !supplier.is_active;
      }

      return matchesStatus;
    });
  }, [suppliersResponse, statusFilter]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      // Preparar datos para enviar con los campos faltantes
      const supplierData: SupplierCreatePayload = {
        ...data,
        // Asegurar que los campos opcionales string tengan valores por defecto
        email: data.email || "",
        main_phone: data.main_phone || "",
        mobile_phone: data.mobile_phone || "",
        contact_person: data.contact_person || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        commercial_name: data.commercial_name || "",
        address: data.address || "",
        fiscal_address: data.fiscal_address || "",
        zip_code: data.zip_code || "",
        notes: data.notes || "",

        // Asegurar que los campos numéricos opcionales tengan valores por defecto
        paymentTermId: data.paymentTermId || 0, // o un valor por defecto apropiado
        credit_limit: data.credit_limit || 0,
        credit_days: data.credit_days || 0,
        balance_due: data.balance_due || 0,
        advance_balance: data.advance_balance || 0,

        // Usuario
        created_by: user?.username || "admin",
        updated_by: user?.username || "admin",

        // Campos adicionales requeridos por SupplierCreatePayload
        last_purchase_date: "", // o null si tu API lo permite
        last_purchase_number: "",
        last_purchase_amount: 0,
        last_payment_date: "", // o null si tu API lo permite
        last_payment_number: "",
        last_payment_amount: 0,
      };

      if (editingSupplierId) {
        // Actualizar supplier existente
        await updateSupplier(editingSupplierId, supplierData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        // Crear nuevo supplier
        await createSupplier(supplierData);
        toast.success("Proveedor creado exitosamente");
      }

      resetForm();
      setIsModalOpen(false);
      setModified((prev) => !prev); // Refrescar la lista
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al guardar el proveedor";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (supplierId: number, supplierName: string) => {
    toast.error(`¿Eliminar el proveedor "${supplierName}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteSupplier(supplierId);
            toast.success("Proveedor eliminado exitosamente");
            setModified((prev) => !prev); // Refrescar la lista
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

  const handleEdit = (supplierId: number) => {
    setEditingSupplierId(supplierId);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      companyId: 1,
      supplier_code: "",
      legal_name: "",
      tax_document_type: "",
      tax_document_number: "",
      person_type: "",
      email: "",
      main_phone: "",
      mobile_phone: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      commercial_name: "",
      address: "",
      fiscal_address: "",
      zip_code: "",
      paymentTermId: undefined,
      credit_limit: 0,
      credit_days: 0,
      notes: "",
      balance_due: 0,
      advance_balance: 0,
      is_active: true,
      created_by: user?.username || "admin",
      updated_by: user?.username || "admin",
    });
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
            {supplier.contact_email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{supplier.contact_email}</span>
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

                    <div className="px-2 py-1.5">
                      <Label htmlFor="company-filter">Compañía</Label>
                      <Select
                        value={companyId?.toString() || "all"}
                        onValueChange={(value) =>
                          setCompanyId(
                            value === "all" ? undefined : parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger id="company-filter" className="mt-1">
                          <SelectValue placeholder="Todas las compañías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las compañías
                          </SelectItem>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <Button
                onClick={handleCreateNew}
                className="gap-2 w-full sm:w-auto"
                disabled={creating || updating}
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
                          <Input {...field} className="w-full" />
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
                </div>

                <FormField
                  control={form.control}
                  name="legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón Social *</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
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
                      <FormLabel>Nombre Comercial (Opcional)</FormLabel>
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
                            <SelectItem value="RIF">RIF</SelectItem>
                            <SelectItem value="Cédula">Cédula</SelectItem>
                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
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
                          <Input {...field} className="w-full" />
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
                          <Input type="email" {...field} className="w-full" />
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
                          <Input {...field} className="w-full" />
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
                        <FormLabel>Teléfono Móvil (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                        <FormLabel>Persona de Contacto (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contacto (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="w-full" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full" />
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
                          <Input {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
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
                    name="paymentTermId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Término de Pago (Opcional)</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(value ? parseInt(value) : undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el término de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentTerms.map((term) => (
                              <SelectItem
                                key={term.id}
                                value={term.id.toString()}
                              >
                                {term.name}
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
                        <FormLabel>Días de Crédito (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            className="w-full"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
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
                      <FormLabel>Límite de Crédito (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          className="w-full"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
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
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
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
                  disabled={creating || updating}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating || loadingOne}
                  className="w-full sm:w-auto"
                >
                  {creating || updating
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
