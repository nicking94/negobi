"use client";

import { useState, useMemo, useEffect } from "react";
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
  Star,
  XCircle,
  BadgeCheck,
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
import { Switch } from "@/components/ui/switch";

import {
  CompanyBranch,
  CreateCompanyBranchData,
  UpdateCompanyBranchData,
} from "@/services/companyBranches/companyBranches.service";
import { useCompanyBranches } from "@/hooks/companyBranches/useCompanyBranches";
import { SelectSearchable } from "@/components/ui/select-searchable";
import useGetAllCompanies from "@/hooks/companies/useGetAllCompanies"; // Importar el hook real

type Branch = CompanyBranch & {
  company?: {
    name: string;
    code: string;
  };
};

const BranchesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Usar el hook real de empresas
  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useGetAllCompanies();

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    companyId: 0,
    name: "",
    code: "",
    contact_email: "",
    main_phone: "",
    physical_address: "",
    is_active: true,
    is_central: false,
  });

  const {
    companyBranches,
    loading,
    error,
    createCompanyBranch,
    updateCompanyBranch,
    deleteCompanyBranch,
    refetch,
  } = useCompanyBranches({
    companyId:
      formData.companyId > 0 ? formData.companyId : companies[0]?.id || 0,
    search: searchTerm || undefined,
  });

  // Estados para los filtros
  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  // Preparar opciones para el SelectSearchable usando empresas reales
  const companyOptions = useMemo(() => {
    return companies
      .filter((company) => company.id && company.name)
      .map((company) => ({
        value: company.id.toString(),
        label: `${company.name} (${company.code})`,
      }));
  }, [companies]);

  const branches: Branch[] = useMemo(() => {
    return companyBranches.map((branch) => ({
      ...branch,
      company: companies.find((c) => c.id === branch.companyId) || undefined,
    }));
  }, [companyBranches, companies]);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.physical_address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && branch.is_active) ||
        (statusFilter === "inactive" && !branch.is_active);

      const matchesCompany =
        companyFilter === "all" ||
        branch.companyId.toString() === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [branches, searchTerm, statusFilter, companyFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (companiesError) {
      toast.error(companiesError);
    }
  }, [error, companiesError]);

  useEffect(() => {
    if (companies.length > 0 && formData.companyId === 0) {
      setFormData((prev) => ({
        ...prev,
        companyId: companies[0].id,
      }));
    }
  }, [companies]);

  useEffect(() => {
    console.log("📊 Estado actual del formData:", formData);
    console.log("🏢 Empresas disponibles:", companies);
    console.log("🎯 Opciones de empresas:", companyOptions);
  }, [formData, companies, companyOptions]);

  const handleViewBranch = async (branch: Branch) => {
    try {
      setSelectedBranch(branch);
      setIsViewDialogOpen(true);
    } catch (err) {
      toast.error("Error al cargar los detalles de la sucursal");
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      companyId: branch.companyId,
      name: branch.name,
      code: branch.code,
      contact_email: branch.contact_email,
      main_phone: branch.main_phone,
      physical_address: branch.physical_address,
      is_active: branch.is_active,
      is_central: branch.is_central,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateBranch = () => {
    setSelectedBranch(null);

    // Encontrar la primera empresa válida - IMPORTANTE: usar companies[0].id
    const defaultCompany = companies.find((company) => company.id > 0);
    const defaultCompanyId = defaultCompany ? defaultCompany.id : 0;

    console.log("🔵 Empresa por defecto para nueva sucursal:", {
      defaultCompany,
      defaultCompanyId,
      companies,
    });

    setFormData({
      companyId: defaultCompanyId, // Esto debe ser un número > 0
      name: "",
      code: "",
      contact_email: "",
      main_phone: "",
      physical_address: "",
      is_active: true,
      is_central: false,
    });
    setIsCreateDialogOpen(true);
  };

  const handleSaveBranch = async () => {
    // Validar que tenemos un companyId válido
    if (formData.companyId === 0) {
      toast.error("Por favor selecciona una empresa válida");
      return;
    }

    try {
      if (selectedBranch) {
        // Editar sucursal existente
        const updateData: UpdateCompanyBranchData = {
          name: formData.name,
          code: formData.code,
          contact_email: formData.contact_email,
          main_phone: formData.main_phone,
          physical_address: formData.physical_address,
          is_active: formData.is_active,
          is_central: formData.is_central,
        };

        const result = await updateCompanyBranch(
          selectedBranch.id.toString(),
          updateData
        );
        if (result) {
          toast.success("Sucursal actualizada exitosamente");
          setIsEditDialogOpen(false);
          refetch();
        }
      } else {
        // Crear nueva sucursal
        const createData: CreateCompanyBranchData = {
          companyId: formData.companyId,
          name: formData.name,
          code: formData.code,
          contact_email: formData.contact_email,
          main_phone: formData.main_phone,
          physical_address: formData.physical_address,
          is_active: formData.is_active,
          is_central: formData.is_central,
        };

        const result = await createCompanyBranch(createData);
        if (result) {
          toast.success("Sucursal creada exitosamente");
          setIsCreateDialogOpen(false);
          refetch();
        }
      }
    } catch (err) {
      toast.error("Error al guardar la sucursal");
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    try {
      const success = await deleteCompanyBranch(branch.id.toString());
      if (success) {
        toast.success("Sucursal eliminada exitosamente");
        refetch();
      }
    } catch (err) {
      toast.error("Error al eliminar la sucursal");
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      const updateData: UpdateCompanyBranchData = {
        is_active: !branch.is_active,
      };

      const result = await updateCompanyBranch(
        branch.id.toString(),
        updateData
      );
      if (result) {
        toast.success(
          `Sucursal ${
            !branch.is_active ? "activada" : "desactivada"
          } exitosamente`
        );
        refetch();
      }
    } catch (err) {
      toast.error("Error al cambiar el estado de la sucursal");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada";
    try {
      return format(new Date(dateString), "dd/MM/yyyy hh:mm a");
    } catch {
      return "Fecha inválida";
    }
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find((c) => c.id === companyId);
    return company
      ? `${company.name} (${company.code})`
      : "Empresa no encontrada";
  };

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: "Sucursal",
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            {row.original.is_central && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            {row.getValue("name")}
          </div>
          <div className="text-xs text-gray_m">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="font-medium">
          {getCompanyName(row.original.companyId)}{" "}
        </div>
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
      accessorKey: "is_central",
      header: "Tipo",
      cell: ({ row }) => {
        const isCentral = row.getValue("is_central") as boolean;
        return (
          <div className="font-medium">{isCentral ? "Central" : "Regular"}</div>
        );
      },
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
        const date = row.getValue("created_at") as string;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={loading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleViewBranch(branch)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditBranch(branch)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(branch)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  {branch.is_active ? (
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
                  onClick={() => handleDeleteBranch(branch)}
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

  const isLoading = loading || companiesLoading;

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
              Gestión de Sucursales
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar..."
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
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5">
                      <Label htmlFor="company-filter">Empresa</Label>
                      <SelectSearchable
                        value={companyFilter}
                        onValueChange={setCompanyFilter}
                        placeholder="Todas las empresas"
                        options={[
                          { value: "all", label: "Todas las empresas" },
                          ...companyOptions,
                        ]}
                        searchPlaceholder="Buscar empresa..."
                        emptyMessage="No se encontraron empresas."
                        className="mt-1"
                      />
                    </div>

                    <DropdownMenuSeparator />

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
              onClick={handleCreateBranch}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Crear Sucursal</span>
            </Button>
          </div>

          <DataTable<Branch, Branch>
            columns={columns}
            data={filteredBranches}
            noResultsText="No se encontraron sucursales"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredBranches.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      {/* Modal para ver detalles de sucursal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalles de Sucursal
            </DialogTitle>
            <DialogDescription>
              Información completa de la sucursal seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedBranch && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-name" className="text-sm font-medium">
                    Nombre de la Sucursal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Building className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.name}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-code" className="text-sm font-medium">
                    Código
                  </Label>
                  <p className="mt-1">{selectedBranch.code}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="view-company" className="text-sm font-medium">
                  Empresa
                </Label>
                <p className="mt-1">
                  {getCompanyName(selectedBranch.companyId)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-email" className="text-sm font-medium">
                    Email de Contacto
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Mail className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.contact_email}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-phone" className="text-sm font-medium">
                    Teléfono Principal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Phone className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.main_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="view-address" className="text-sm font-medium">
                  Dirección Física
                </Label>
                <div className="flex items-center mt-1 gap-2">
                  <MapPin className="h-4 w-4 text-gray_m" />
                  <p>{selectedBranch.physical_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-type" className="text-sm font-medium">
                    Tipo de Sucursal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Star
                      className={`h-4 w-4 ${
                        selectedBranch.is_central
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray_m"
                      }`}
                    />
                    <p>
                      {selectedBranch.is_central
                        ? "Sucursal Central"
                        : "Sucursal Regular"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-status" className="text-sm font-medium">
                    Estado
                  </Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedBranch.is_active
                          ? "bg-green_xxl text-green_b"
                          : "bg-red_xxl text-red_b"
                      }`}
                    >
                      {selectedBranch.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="view-created" className="text-sm font-medium">
                  Fecha de Creación
                </Label>
                <p className="mt-1">{formatDate(selectedBranch.created_at)}</p>
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

      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="w-full bg-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {selectedBranch ? "Editar Sucursal" : "Crear Nueva Sucursal"}
            </DialogTitle>
            <DialogDescription>
              {selectedBranch
                ? "Modifica la información de la sucursal seleccionada"
                : "Completa la información para crear una nueva sucursal"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 space-y-2">
                <Label htmlFor="companyId" className="text-sm font-medium">
                  Empresa *
                </Label>
                <SelectSearchable
                  value={
                    formData.companyId > 0 ? formData.companyId.toString() : ""
                  }
                  onValueChange={(value) => {
                    const companyId = parseInt(value);
                    console.log("🔵 Empresa seleccionada:", {
                      value,
                      companyId,
                    });
                    if (companyId > 0) {
                      setFormData({ ...formData, companyId });
                    } else {
                      console.error("❌ ID de empresa inválido:", companyId);
                    }
                  }}
                  placeholder="Seleccionar empresa"
                  options={companyOptions}
                  searchPlaceholder="Buscar empresa..."
                  emptyMessage="No se encontraron empresas."
                />
                {formData.companyId === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    ⚠️ Por favor selecciona una empresa válida
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre de la Sucursal *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Sucursal Principal"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Código *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="ABC-001"
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="contact_email" className="text-sm font-medium">
                  Email de Contacto *
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="sucursal@empresa.com"
                />
              </div>
            </div>

            {/* Fila 3: Teléfono y Tipo de Sucursal */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 space-y-2">
                <Label htmlFor="main_phone" className="text-sm font-medium">
                  Teléfono Principal *
                </Label>
                <Input
                  id="main_phone"
                  value={formData.main_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, main_phone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="is_central" className="text-sm font-medium">
                  Tipo de Sucursal
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="is_central"
                    checked={formData.is_central}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_central: checked })
                    }
                  />
                  <Label htmlFor="is_central" className="text-sm">
                    Sucursal Central
                  </Label>
                </div>
              </div>
            </div>

            {/* Fila 4: Dirección (ancho completo) */}
            <div className="w-full space-y-2">
              <Label htmlFor="physical_address" className="text-sm font-medium">
                Dirección Física *
              </Label>
              <Input
                id="physical_address"
                value={formData.physical_address}
                onChange={(e) =>
                  setFormData({ ...formData, physical_address: e.target.value })
                }
                placeholder="Av. Principal #123, Ciudad"
              />
            </div>

            {/* Fila 5: Estado Activo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                Sucursal Activa
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setIsCreateDialogOpen(false);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveBranch}
              disabled={isLoading}
            >
              {isLoading
                ? "Guardando..."
                : selectedBranch
                ? "Actualizar"
                : "Crear"}{" "}
              Sucursal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles de sucursal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalles de Sucursal
            </DialogTitle>
            <DialogDescription>
              Información completa de la sucursal seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedBranch && (
            <div className="flex flex-col gap-4 py-4">
              {/* Fila 1: Nombre y Código */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="view-name" className="text-sm font-medium">
                    Nombre de la Sucursal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Building className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.name}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <Label htmlFor="view-code" className="text-sm font-medium">
                    Código
                  </Label>
                  <p className="mt-1">{selectedBranch.code}</p>
                </div>
              </div>

              {/* Empresa (ancho completo) */}
              <div className="w-full">
                <Label htmlFor="view-company" className="text-sm font-medium">
                  Empresa
                </Label>
                <p className="mt-1">
                  {getCompanyName(selectedBranch.companyId)}
                </p>
              </div>

              {/* Fila 2: Email y Teléfono */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="view-email" className="text-sm font-medium">
                    Email de Contacto
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Mail className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.contact_email}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <Label htmlFor="view-phone" className="text-sm font-medium">
                    Teléfono Principal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Phone className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.main_phone}</p>
                  </div>
                </div>
              </div>

              {/* Dirección (ancho completo) */}
              <div className="w-full">
                <Label htmlFor="view-address" className="text-sm font-medium">
                  Dirección Física
                </Label>
                <div className="flex items-center mt-1 gap-2">
                  <MapPin className="h-4 w-4 text-gray_m" />
                  <p>{selectedBranch.physical_address}</p>
                </div>
              </div>

              {/* Fila 3: Tipo y Estado */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="view-type" className="text-sm font-medium">
                    Tipo de Sucursal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Star
                      className={`h-4 w-4 ${
                        selectedBranch.is_central
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray_m"
                      }`}
                    />
                    <p>
                      {selectedBranch.is_central
                        ? "Sucursal Central"
                        : "Sucursal Regular"}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <Label htmlFor="view-status" className="text-sm font-medium">
                    Estado
                  </Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedBranch.is_active
                          ? "bg-green_xxl text-green_b"
                          : "bg-red_xxl text-red_b"
                      }`}
                    >
                      {selectedBranch.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fecha de creación (ancho completo) */}
              <div className="w-full">
                <Label htmlFor="view-created" className="text-sm font-medium">
                  Fecha de Creación
                </Label>
                <p className="mt-1">{formatDate(selectedBranch.created_at)}</p>
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
    </div>
  );
};

export default BranchesPage;
