"use client";

import { useEffect, useState } from "react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddCompanies from "@/hooks/companies/useAddCompanies";
import useGetCompanies from "@/hooks/companies/useGetCompanies";
import useDeleteCompanies from "@/hooks/companies/useDeleteCompanies";
import useUpdateCompanies from "@/hooks/companies/useUpdateCompanies";

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
  api_key_duration_days: z.number().min(1, "La duración es requerida"),
});
type CompanyFormValues = z.infer<typeof companySchema>;

export type Company = {
  id: number;
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
  const { deleteCompany, loading: deleteLoading } = useDeleteCompanies();
  const { updateCompany, loading: updateLoading } = useUpdateCompanies();
  const { newCompany, loading: createLoading } = useAddCompanies();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      api_key_duration_days: 180,
    },
  });

  const {
    setModified,
    companiesResponse,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    page,
    itemsPerPage,
  } = useGetCompanies();

  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  const handleEditCompany = (company: Company) => {
    if (!company.id) {
      toast.error("No se puede editar la empresa: ID no disponible");
      return;
    }

    setSelectedCompany(company);
    form.reset({
      name: company.name,
      code: company.code,
      legal_tax_id: company.legal_tax_id,
      contact_email: company.contact_email,
      main_phone: company.main_phone,
      fiscal_address: company.fiscal_address,
      admin_first_name: company.admin_first_name,
      admin_last_name: company.admin_last_name,
      admin_username: company.admin_username,
      admin_email: company.admin_email,
      admin_phone: company.admin_phone,
      admin_password: "", // No mostramos la contraseña por seguridad
      api_key_duration_days: company.api_key_duration_days,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    form.reset({
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
      api_key_duration_days: 180,
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = async (data: CompanyFormValues) => {
    console.log("🟢 onSubmit ejecutado", { selectedCompany, data });

    try {
      if (selectedCompany) {
        // Actualizar empresa existente
        if (!selectedCompany.id) {
          toast.error("No se puede actualizar: ID no disponible");
          return;
        }

        console.log("🟡 Actualizando empresa ID:", selectedCompany.id);

        const response = await updateCompany(
          selectedCompany.id.toString(),
          data
        );

        console.log("🟢 Respuesta de actualización:", response);

        if (response && response.status === 200) {
          toast.success("Empresa actualizada exitosamente");
          setIsEditDialogOpen(false);
          setModified((prev) => !prev);
          setSelectedCompany(null);
          form.reset();
        } else {
          toast.error("Error al actualizar la empresa");
        }
      } else {
        // Crear nueva empresa
        const companyData = {
          ...data,
          admin_password: data.admin_password ?? "",
          organizationId: 0,
          is_active: true,
        };

        const response = await newCompany(companyData);

        // CORRECIÓN: Verificar la respuesta correctamente
        if (
          response &&
          typeof response === "object" &&
          "status" in response &&
          response.status === 201
        ) {
          toast.success("Compañía creada exitosamente");
          setIsCreateDialogOpen(false);
          setModified((prev) => !prev);
          form.reset();
        } else {
          toast.error("Error al crear la compañía");
        }
      }
    } catch (error) {
      console.error("🔴 Error en onSubmit:", error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const handleDeleteClick = (company: Company) => {
    console.log("🟡 handleDeleteClick ejecutado", company.name);
    if (!company.id) {
      toast.error("No se puede eliminar: ID no disponible");
      return;
    }
    setCompanyToDelete(company);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCompany = async (companyId?: number) => {
    console.log("🔴 handleDeleteCompany ejecutado");

    const idToDelete = companyId || companyToDelete?.id;

    if (!idToDelete) {
      console.log("❌ No hay ID para eliminar");
      toast.error("No se pudo identificar la empresa a eliminar");
      return;
    }

    console.log("🔴 Eliminando empresa con ID:", idToDelete);

    const result = await deleteCompany(idToDelete.toString());

    console.log("🔴 Resultado:", result);

    if (result.success) {
      toast.success("Empresa eliminada exitosamente");
      setModified((prev) => !prev);
      setDeleteConfirmOpen(false);
      setCompanyToDelete(null);
    } else {
      toast.error(result.error || "Error al eliminar la empresa");
    }
  };

  const handleToggleStatus = async (company: Company) => {
    if (!company.id) {
      toast.error("No se puede cambiar el estado: ID no disponible");
      return;
    }

    try {
      // Enviar todos los datos necesarios junto con el cambio de estado
      const updateData = {
        name: company.name,
        code: company.code,
        legal_tax_id: company.legal_tax_id,
        contact_email: company.contact_email,
        main_phone: company.main_phone,
        fiscal_address: company.fiscal_address,
        admin_first_name: company.admin_first_name,
        admin_last_name: company.admin_last_name,
        admin_username: company.admin_username,
        admin_email: company.admin_email,
        admin_phone: company.admin_phone,
        api_key_duration_days: company.api_key_duration_days,
        is_active: !company.is_active, // Cambiar el estado
      };

      console.log("🟡 Cambiando estado de empresa:", {
        id: company.id,
        nuevoEstado: !company.is_active,
        data: updateData,
      });

      const response = await updateCompany(company.id.toString(), updateData);

      console.log("🟢 Respuesta de cambio de estado:", response);

      if (response && response.status === 200) {
        toast.success(
          `Empresa ${
            !company.is_active ? "activada" : "desactivada"
          } exitosamente`
        );
        setModified((prev) => !prev);
      } else {
        toast.error("Error al cambiar el estado de la empresa");
      }
    } catch (error) {
      console.error("🔴 Error cambiando estado de empresa:", error);
      toast.error("Error al cambiar el estado de la empresa");
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(new Date(date), "dd/MM/yyyy hh:mm a");
  };

  // Filtrar empresas por búsqueda y estado
  const filteredCompanies =
    companiesResponse?.filter((company: Company) => {
      const matchesSearch =
        searchTerm === "" ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.legal_tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && company.is_active) ||
        (statusFilter === "inactive" && !company.is_active);

      return matchesSearch && matchesStatus;
    }) || [];

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
        const hasValidId = !!company.id;

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
                  onClick={() => handleEditCompany(company)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(company)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
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
                  onClick={() => handleDeleteClick(company)}
                  className={`cursor-pointer flex items-center gap-2 text-red_b ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
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

  useEffect(() => {
    console.log("Companies data:", companiesResponse);
  }, [companiesResponse]);

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
              Empresas
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, RIF, código o email..."
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
            <Button
              onClick={handleCreateCompany}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Empresa</span>
            </Button>
          </div>

          <DataTable<Company, Company>
            columns={columns}
            data={filteredCompanies}
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

      {/* Modal de confirmación para eliminar empresa */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{companyToDelete?.name}</strong>? <br /> Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setCompanyToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteCompany(companyToDelete?.id)}
              disabled={deleteLoading || !companyToDelete?.id}
              className="w-full sm:w-auto"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Empresa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para crear/editar empresa */}
      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
            setSelectedCompany(null);
            form.reset();
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
            {/* Información de la Empresa */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray_b">
                Información de la Empresa
              </h3>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legal_tax_id">ID Empresa *</Label>
                  <Input
                    id="legal_tax_id"
                    {...form.register("legal_tax_id")}
                    placeholder="12345"
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
                    placeholder="180"
                  />
                  {form.formState.errors.api_key_duration_days && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.api_key_duration_days.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contacto *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    {...form.register("contact_email")}
                    placeholder="contacto@empresa.com"
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
                    placeholder="+58 412-1234567"
                  />
                  {form.formState.errors.main_phone && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.main_phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal_address">Dirección Fiscal *</Label>
                <Input
                  id="fiscal_address"
                  {...form.register("fiscal_address")}
                  placeholder="Av. Principal, Edificio XYZ, Piso 4"
                />
                {form.formState.errors.fiscal_address && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.fiscal_address.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setIsCreateDialogOpen(false);
                  setSelectedCompany(null);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createLoading || updateLoading}>
                {createLoading || updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedCompany ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>{selectedCompany ? "Actualizar" : "Crear"} Empresa</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
