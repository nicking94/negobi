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

export type Supplier = {
  id: string;
  companyId: number;
  supplier_code: string;
  legal_name: string;
  tax_document_type: string;
  tax_document_number: string;
  person_type: string;
  email?: string;
  main_phone?: string;
  mobile_phone?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  commercial_name?: string;
  delivery_address?: string;
  paymentTermId?: number;
  credit_limit?: number;
  credit_days?: number;
  notes?: string;
  balance_due: number;
  advance_balance: number;
  last_purchase_date: string;
  last_purchase_number: string;
  last_purchase_amount: number;
  last_payment_date: string;
  last_payment_number: string;
  last_payment_amount: number;
  is_active: boolean;
  created_by: string;
  updated_by: string;
};

const supplierSchema = z.object({
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
  delivery_address: z.string().optional(),
  paymentTermId: z.number().optional().nullable(),
  credit_limit: z
    .number()
    .min(0, "El límite de crédito no puede ser negativo")
    .optional(),
  credit_days: z
    .number()
    .min(0, "Los días de crédito no pueden ser negativos")
    .optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

type SupplierForm = z.infer<typeof supplierSchema>;

const SuppliersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");

  // Datos de ejemplo
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      companyId: 1,
      supplier_code: "PROV001",
      legal_name: "Tecnologías Avanzadas S.A.",
      tax_document_type: "RIF",
      tax_document_number: "J-123456789",
      person_type: "Jurídica",
      email: "ventas@tecnologiasavanzadas.com",
      main_phone: "0212-555-1234",
      mobile_phone: "0414-555-1234",
      contact_person: "Carlos Rodríguez",
      contact_email: "carlos@tecnologiasavanzadas.com",
      contact_phone: "0412-555-5678",
      commercial_name: "TecnoAvanzada",
      delivery_address: "Av. Principal, Edificio Centro, Piso 3, Oficina 301",
      paymentTermId: 1,
      credit_limit: 5000,
      credit_days: 30,
      notes: "Proveedor preferencial para equipos tecnológicos",
      balance_due: 1250.75,
      advance_balance: 0,
      last_purchase_date: "2024-01-15T10:30:00Z",
      last_purchase_number: "OC-2024-00125",
      last_purchase_amount: 2500.5,
      last_payment_date: "2024-01-05T14:20:00Z",
      last_payment_number: "P-2024-00087",
      last_payment_amount: 3000.0,
      is_active: true,
      created_by: "admin",
      updated_by: "admin",
    },
    {
      id: "2",
      companyId: 1,
      supplier_code: "PROV002",
      legal_name: "Suministros Industriales C.A.",
      tax_document_type: "RIF",
      tax_document_number: "J-987654321",
      person_type: "Jurídica",
      email: "info@suministrosindustriales.com",
      main_phone: "0212-555-4321",
      mobile_phone: "0414-555-4321",
      contact_person: "María González",
      contact_email: "maria.g@suministrosindustriales.com",
      contact_phone: "0412-555-8765",
      commercial_name: "Suministros Ind.",
      delivery_address: "Zona Industrial, Galpón 12, Local B",
      paymentTermId: 2,
      credit_limit: 10000,
      credit_days: 45,
      notes: "Proveedor de materiales de oficina y limpieza",
      balance_due: 0,
      advance_balance: 500.0,
      last_purchase_date: "2024-01-10T09:15:00Z",
      last_purchase_number: "OC-2024-00098",
      last_purchase_amount: 1500.75,
      last_payment_date: "2024-01-08T11:45:00Z",
      last_payment_number: "P-2024-00092",
      last_payment_amount: 2000.0,
      is_active: true,
      created_by: "admin",
      updated_by: "admin",
    },
    {
      id: "3",
      companyId: 2,
      supplier_code: "PROV003",
      legal_name: "Juan Pérez",
      tax_document_type: "Cédula",
      tax_document_number: "V-12345678",
      person_type: "Natural",
      email: "juanperez@gmail.com",
      main_phone: "0212-555-1111",
      mobile_phone: "0414-555-1111",
      contact_person: "Juan Pérez",
      contact_email: "juanperez@gmail.com",
      contact_phone: "0414-555-1111",
      commercial_name: "Servicios JP",
      delivery_address: "Calle 5, #12-34, Urbanización Las Acacias",
      paymentTermId: 3,
      credit_limit: 2000,
      credit_days: 15,
      notes: "Proveedor de servicios de mantenimiento",
      balance_due: 750.25,
      advance_balance: 0,
      last_purchase_date: "2024-01-12T16:20:00Z",
      last_purchase_number: "OC-2024-00105",
      last_purchase_amount: 1000.0,
      last_payment_date: "2023-12-28T10:30:00Z",
      last_payment_number: "P-2023-00125",
      last_payment_amount: 500.0,
      is_active: false,
      created_by: "admin",
      updated_by: "admin",
    },
  ]);

  const [paymentTerms, setPaymentTerms] = useState([
    { id: 1, name: "Contado" },
    { id: 2, name: "15 días" },
    { id: 3, name: "30 días" },
    { id: 4, name: "45 días" },
    { id: 5, name: "60 días" },
  ]);

  const [instances, setInstances] = useState([
    { id: 1, name: "Instancia Principal" },
    { id: 2, name: "Sucursal Norte" },
    { id: 3, name: "Sucursal Sur" },
  ]);

  // Filtrar proveedores según los criterios
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplier_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.commercial_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.tax_document_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtrar por estado
      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = supplier.is_active;
      } else if (statusFilter === "inactive") {
        matchesStatus = !supplier.is_active;
      }

      // Filtrar por instancia (si no es "todas")
      const matchesInstance =
        instanceFilter === "all" ||
        supplier.companyId.toString() === instanceFilter;

      return matchesSearch && matchesStatus && matchesInstance;
    });
  }, [suppliers, searchTerm, statusFilter, instanceFilter]);

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
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
      contact_email: "",
      contact_phone: "",
      commercial_name: "",
      delivery_address: "",
      paymentTermId: undefined,
      credit_limit: 0,
      credit_days: 0,
      notes: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: SupplierForm) => {
    try {
      const postData = {
        ...values,
        email: values.email || "",
        main_phone: values.main_phone || "",
        mobile_phone: values.mobile_phone || "",
        contact_person: values.contact_person || "",
        contact_email: values.contact_email || "",
        contact_phone: values.contact_phone || "",
        commercial_name: values.commercial_name || "",
        delivery_address: values.delivery_address || "",
        paymentTermId: values.paymentTermId || 0, // Convert undefined to 0
        credit_limit: values.credit_limit || 0, // Convert undefined to 0
        credit_days: values.credit_days || 0, // Convert undefined to 0
        notes: values.notes || "",
        companyId: 1,
        created_by: "admin",
        updated_by: "admin",
        balance_due: 0,
        advance_balance: 0,
        last_purchase_date: new Date().toISOString(),
        last_purchase_number: "",
        last_purchase_amount: 0,
        last_payment_date: new Date().toISOString(),
        last_payment_number: "",
        last_payment_amount: 0,
      };

      if (editingSupplier) {
        // Lógica para actualizar
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === editingSupplier.id
              ? {
                  ...s,
                  ...postData,
                  companyId: editingSupplier.companyId,
                }
              : s
          )
        );
        toast.success("Proveedor actualizado exitosamente");
      } else {
        // Lógica para crear
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          ...postData,
          companyId: 1,
        };
        setSuppliers((prev) => [...prev, newSupplier]);
        toast.success("Proveedor creado exitosamente");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al guardar el proveedor");
    }
  };

  const handleDelete = (supplier: Supplier) => {
    toast.error(`¿Eliminar el proveedor "${supplier.legal_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
          toast.success("Proveedor eliminado exitosamente");
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

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      supplier_code: supplier.supplier_code,
      legal_name: supplier.legal_name,
      tax_document_type: supplier.tax_document_type,
      tax_document_number: supplier.tax_document_number,
      person_type: supplier.person_type,
      email: supplier.email,
      main_phone: supplier.main_phone,
      mobile_phone: supplier.mobile_phone,
      contact_person: supplier.contact_person,
      contact_email: supplier.contact_email,
      contact_phone: supplier.contact_phone,
      commercial_name: supplier.commercial_name || "",
      delivery_address: supplier.delivery_address || "",
      paymentTermId: supplier.paymentTermId,
      credit_limit: supplier.credit_limit,
      credit_days: supplier.credit_days,
      notes: supplier.notes || "",
      is_active: supplier.is_active,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setEditingSupplier(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "legal_name",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray_m" />
            <span>{row.getValue("legal_name")}</span>
          </div>
          {row.original.commercial_name && (
            <div className="text-xs text-gray_m">
              {row.original.commercial_name}
            </div>
          )}
          <div className="text-xs text-gray_m flex items-center gap-1 mt-1">
            <span>{row.original.tax_document_type}:</span>
            <span>{row.original.tax_document_number}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "supplier_code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("supplier_code")}</div>
      ),
    },
    {
      accessorKey: "contact_info",
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
      accessorKey: "credit_info",
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
        return (
          <div className="text-sm">
            <div>{formatDate(date)}</div>
            <div className="text-xs text-gray_m">
              {formatCurrency(row.original.last_purchase_amount)}
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
                  onClick={() => handleEdit(supplier)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(supplier)}
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
              Proveedores
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, código, RIF o documento..."
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
                <span>Nuevo proveedor</span>
              </Button>
            </div>
          </div>

          <DataTable<Supplier, Supplier>
            columns={columns}
            data={filteredSuppliers || []}
            noResultsText="No se encontraron proveedores"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredSuppliers.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
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
                    name="person_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Persona</FormLabel>
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
                      <FormLabel>Razón Social</FormLabel>
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
                        <FormLabel>Tipo de Documento</FormLabel>
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
                        <FormLabel>Número de Documento</FormLabel>
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

                <FormField
                  control={form.control}
                  name="delivery_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Entrega (Opcional)</FormLabel>
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
                    : editingSupplier
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
