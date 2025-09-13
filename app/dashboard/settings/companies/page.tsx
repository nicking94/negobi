"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  Building,
  Mail,
  Phone,
  MapPin,
  Key,
  User,
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
  DialogDescription,
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
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddCompanies from "@/hooks/companies/useAddCompanies";
import useGetCompanies from "@/hooks/companies/useGetCompanies";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  legal_tax_id: z.string().min(1, "El RIF es requerido"),
  contact_email: z.string().email("Correo inválido"),
  main_phone: z.string().min(1, "El teléfono es requerido"),
  fiscal_address: z.string().min(1, "La dirección es requerida"),

  admin_first_name: z.string().min(1, "El nombre es requerido"),
  admin_last_name: z.string().min(1, "El apellido es requerido"),
  admin_username: z.string().min(1, "El usuario es requerido"),
  admin_email: z.string().email("Correo inválido"),
  admin_phone: z.string().min(1, "El teléfono es requerido"),
  admin_password: z.string().min(6, "Mínimo 6 caracteres").optional(),
  api_key_duration_days: z.number({ error: "Debe ser un número válido" }),
});
type CompanyFormValues = z.infer<typeof companySchema>;

export type Company = {
  organizationId: number;
  name: string;
  legal_tax_id: string;
  api_key_duration_days: number;
  code: string;
  contact_email: string;
  main_phone: string;
  fiscal_address: string;
  is_active: boolean;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
  created_at: Date;
};

const CompaniesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      code: "",
      legal_tax_id: "",
      contact_email: "",
      main_phone: "",
      fiscal_address: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_username: "",
      admin_email: "",
      admin_phone: "",
      admin_password: "",
      api_key_duration_days: 30,
    },
  });

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    name: "",
    legal_tax_id: "",
    api_key_duration_days: 30,
    code: "",
    contact_email: "",
    main_phone: "",
    fiscal_address: "",
    is_active: true,
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    admin_username: "",
    admin_first_name: "",
    admin_last_name: "",
  });

  const { newCompany } = useAddCompanies();

  // Datos de ejemplo
  const [companies, setCompanies] = useState<Company[]>([
    {
      organizationId: 1,
      name: "Empresa ABC, C.A.",
      legal_tax_id: "J-123456789",
      api_key_duration_days: 30,
      code: "ABC001",
      contact_email: "contacto@empresaabc.com",
      main_phone: "+1234567890",
      fiscal_address: "Av. Principal #123, Caracas",
      is_active: true,
      admin_email: "admin@empresaabc.com",
      admin_password: "password123",
      admin_phone: "+1234567890",
      admin_username: "admin_abc",
      admin_first_name: "Juan",
      admin_last_name: "Pérez",
      created_at: new Date("2024-01-15T10:30:00"),
    },
    {
      organizationId: 2,
      name: "Comercial XYZ, S.A.",
      legal_tax_id: "J-987654321",
      api_key_duration_days: 60,
      code: "XYZ002",
      contact_email: "info@comercialxyz.com",
      main_phone: "+0987654321",
      fiscal_address: "Calle Comercio #456, Valencia",
      is_active: true,
      admin_email: "admin@comercialxyz.com",
      admin_password: "password123",
      admin_phone: "+0987654321",
      admin_username: "admin_xyz",
      admin_first_name: "María",
      admin_last_name: "González",
      created_at: new Date("2024-02-20T14:45:00"),
    },
    {
      organizationId: 3,
      name: "Distribuidora Norte, C.A.",
      legal_tax_id: "J-456789123",
      api_key_duration_days: 90,
      code: "DNO003",
      contact_email: "ventas@distribuidoranorte.com",
      main_phone: "+1122334455",
      fiscal_address: "Zona Industrial Norte, Maracaibo",
      is_active: false,
      admin_email: "admin@distribuidoranorte.com",
      admin_password: "password123",
      admin_phone: "+1122334455",
      admin_username: "admin_dno",
      admin_first_name: "Carlos",
      admin_last_name: "Rodríguez",
      created_at: new Date("2024-03-10T09:15:00"),
    },
  ]);

  // Estados para los filtros
  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  const {
    setModified,
    loading,
    companiesResponse,
    modified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch,
    page,
    itemsPerPage,
  } = useGetCompanies();

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      legal_tax_id: company.legal_tax_id,
      api_key_duration_days: company.api_key_duration_days,
      code: company.code,
      contact_email: company.contact_email,
      main_phone: company.main_phone,
      fiscal_address: company.fiscal_address,
      is_active: company.is_active,
      admin_email: company.admin_email,
      admin_password: "", // No mostramos la contraseña por seguridad
      admin_phone: company.admin_phone,
      admin_username: company.admin_username,
      admin_first_name: company.admin_first_name,
      admin_last_name: company.admin_last_name,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateCompany = () => {
    setFormData({
      name: "",
      legal_tax_id: "",
      api_key_duration_days: 30,
      code: "",
      contact_email: "",
      main_phone: "",
      fiscal_address: "",
      is_active: true,
      admin_email: "",
      admin_password: "",
      admin_phone: "",
      admin_username: "",
      admin_first_name: "",
      admin_last_name: "",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: CompanyFormValues) => {
    if (selectedCompany) {
      // Editar empresa existente
      setCompanies(
        companies.map((company) =>
          company.organizationId === selectedCompany.organizationId
            ? {
                ...company,
                name: formData.name,
                legal_tax_id: formData.legal_tax_id,
                api_key_duration_days: formData.api_key_duration_days,
                code: formData.code,
                contact_email: formData.contact_email,
                main_phone: formData.main_phone,
                fiscal_address: formData.fiscal_address,
                is_active: formData.is_active,
                admin_email: formData.admin_email,
                admin_phone: formData.admin_phone,
                admin_username: formData.admin_username,
                admin_first_name: formData.admin_first_name,
                admin_last_name: formData.admin_last_name,
              }
            : company
        )
      );
      toast.success("Empresa actualizada exitosamente");
    } else {
      const response = await newCompany({
        ...data,
        admin_password: data.admin_password ?? "",
      });
      console.log(response);
      if (
        typeof response === "object" &&
        response !== null &&
        "status" in response &&
        response.status === 201
      ) {
        toast.success("Compañía creada exitosamente");
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setModified((prev) => !prev);
        form.reset();
      } else {
        toast.error("Error al crear la compañía");
      }
    }
    // setIsEditDialogOpen(false);
    // setIsCreateDialogOpen(false);
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanies(
      companies.filter((c) => c.organizationId !== company.organizationId)
    );
    toast.success("Empresa eliminada exitosamente");
  };

  const handleToggleStatus = (company: Company) => {
    setCompanies(
      companies.map((c) =>
        c.organizationId === company.organizationId
          ? { ...c, is_active: !c.is_active }
          : c
      )
    );
    toast.success(
      `Empresa ${!company.is_active ? "activada" : "desactivada"} exitosamente`
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("name")}</div>
          <div className="text-xs text-gray_m">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: "legal_tax_id",
      header: "RIF",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("legal_tax_id")}</div>
      ),
    },
    {
      accessorKey: "contact_email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("contact_email")}</div>
      ),
    },
    {
      accessorKey: "main_phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("main_phone")}</div>
      ),
    },
    {
      accessorKey: "api_key_duration_days",
      header: "Duración API Key",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("api_key_duration_days")} días
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
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
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const company = row.original;
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
                  onClick={() => handleViewCompany(company)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditCompany(company)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(company)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  {company.is_active ? (
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
                  onClick={() => handleDeleteCompany(company)}
                  className="cursor-pointer flex items-center gap-2 text-red_b"
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
              Gestión de Empresas
            </h1>
            <Button
              onClick={handleCreateCompany}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Empresa</span>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, RIF, código o email..."
                  className="pl-8"
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
                          {statusOptions.map((status) => (
                            <SelectItem key={status.id} value={status.name}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <DataTable<Company, Company>
            columns={columns}
            data={companiesResponse || []}
            noResultsText="No se encontraron empresas"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={total}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>

      {/* Modal para ver detalles de empresa */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalles de Empresa
            </DialogTitle>
            <DialogDescription>
              Información completa de la empresa seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-name" className="text-sm font-medium">
                    Nombre de la Empresa
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Building className="h-4 w-4 text-gray_m" />
                    <p>{selectedCompany.name}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-code" className="text-sm font-medium">
                    Código
                  </Label>
                  <p className="mt-1">{selectedCompany.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-rif" className="text-sm font-medium">
                    RIF
                  </Label>
                  <p className="mt-1">{selectedCompany.legal_tax_id}</p>
                </div>

                <div>
                  <Label htmlFor="view-status" className="text-sm font-medium">
                    Estado
                  </Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedCompany.is_active
                          ? "bg-green_xxl text-green_b"
                          : "bg-red_xxl text-red_b"
                      }`}
                    >
                      {selectedCompany.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-email" className="text-sm font-medium">
                    Email de Contacto
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Mail className="h-4 w-4 text-gray_m" />
                    <p>{selectedCompany.contact_email}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-phone" className="text-sm font-medium">
                    Teléfono Principal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Phone className="h-4 w-4 text-gray_m" />
                    <p>{selectedCompany.main_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="view-address" className="text-sm font-medium">
                  Dirección Fiscal
                </Label>
                <div className="flex items-center mt-1 gap-2">
                  <MapPin className="h-4 w-4 text-gray_m" />
                  <p>{selectedCompany.fiscal_address}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="view-api-days" className="text-sm font-medium">
                  Duración de API Key
                </Label>
                <p className="mt-1">
                  {selectedCompany.api_key_duration_days} días
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Administrador Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="view-admin-name"
                      className="text-sm font-medium"
                    >
                      Nombre Completo
                    </Label>
                    <div className="flex items-center mt-1 gap-2">
                      <User className="h-4 w-4 text-gray_m" />
                      <p>
                        {selectedCompany.admin_first_name}{" "}
                        {selectedCompany.admin_last_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="view-admin-username"
                      className="text-sm font-medium"
                    >
                      Usuario
                    </Label>
                    <p className="mt-1">{selectedCompany.admin_username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label
                      htmlFor="view-admin-email"
                      className="text-sm font-medium"
                    >
                      Email
                    </Label>
                    <div className="flex items-center mt-1 gap-2">
                      <Mail className="h-4 w-4 text-gray_m" />
                      <p>{selectedCompany.admin_email}</p>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="view-admin-phone"
                      className="text-sm font-medium"
                    >
                      Teléfono
                    </Label>
                    <div className="flex items-center mt-1 gap-2">
                      <Phone className="h-4 w-4 text-gray_m" />
                      <p>{selectedCompany.admin_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="view-created" className="text-sm font-medium">
                  Fecha de Creación
                </Label>
                <p className="mt-1">{formatDate(selectedCompany.created_at)}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para crear/editar empresa */}
      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedCompany ? "Editar Empresa" : "Crear Nueva Empresa"}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany
                ? "Modifica la información de la empresa seleccionada"
                : "Completa la información para crear una nueva empresa"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            {/* Nombre y código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Empresa ABC, C.A."
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="ABC001"
                />
                {form.formState.errors.code && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>
            </div>

            {/* RIF y API Key */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal_tax_id">RIF *</Label>
                <Input
                  id="legal_tax_id"
                  {...form.register("legal_tax_id")}
                  placeholder="J-123456789"
                />
                {form.formState.errors.legal_tax_id && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.legal_tax_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key_duration_days">
                  Duración API Key (días) *
                </Label>
                <Input
                  id="api_key_duration_days"
                  type="number"
                  {...form.register("api_key_duration_days", {
                    valueAsNumber: true,
                  })}
                  placeholder="30"
                />
                {form.formState.errors.api_key_duration_days && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.api_key_duration_days.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email y teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de Contacto *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...form.register("contact_email")}
                />
                {form.formState.errors.contact_email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.contact_email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_phone">Teléfono Principal *</Label>
                <Input
                  id="main_phone"
                  {...form.register("main_phone")}
                  placeholder="+1234567890"
                />
                {form.formState.errors.main_phone && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.main_phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="fiscal_address">Dirección Fiscal *</Label>
              <Input id="fiscal_address" {...form.register("fiscal_address")} />
              {form.formState.errors.fiscal_address && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.fiscal_address.message}
                </p>
              )}
            </div>

            {/* Admin principal */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Administrador Principal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_first_name">Nombre *</Label>
                  <Input
                    id="admin_first_name"
                    {...form.register("admin_first_name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_last_name">Apellido *</Label>
                  <Input
                    id="admin_last_name"
                    {...form.register("admin_last_name")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Usuario *</Label>
                  <Input
                    id="admin_username"
                    {...form.register("admin_username")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email *</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    {...form.register("admin_email")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Teléfono *</Label>
                  <Input id="admin_phone" {...form.register("admin_phone")} />
                </div>
                {!selectedCompany && (
                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Contraseña *</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      {...form.register("admin_password")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedCompany ? "Actualizar" : "Crear"} Empresa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
