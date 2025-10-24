// components/dashboard/BranchesPage.tsx - CORREGIDO
"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
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
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useUserCompany } from "@/hooks/auth/useUserCompany";

type Branch = CompanyBranch & {
  company?: {
    name: string;
    code: string;
  };
};

const BranchesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Obtener empresa del usuario logeado
  const {
    userCompany,
    companyId,
    isLoading: userCompanyLoading,
    hasCompany,
  } = useUserCompany();

  // Hook de permisos
  const {
    canCreateBranch,
    canEditBranch,
    canDeleteBranch,
    canToggleBranchStatus,
    userRole,
  } = usePermissions();

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contact_email: "",
    main_phone: "",
    physical_address: "",
    is_active: true,
    is_central: false,
  });

  // Configurar filtros SIN companyId (se obtiene automáticamente del usuario)
  const [filters, setFilters] = useState({
    search: "",
  });

  const {
    companyBranches,
    loading,
    error,
    createCompanyBranch,
    updateCompanyBranch,
    deleteCompanyBranch,
    refetch,
  } = useCompanyBranches(filters);

  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, [searchTerm]);

  // CORRECCIÓN: Información de la empresa del usuario - usar hasCompany para consistencia
  const companyName = userCompany?.name || "Empresa no asignada";

  const handleEditBranch = (branch: Branch) => {
    if (!canEditBranch()) {
      toast.error("No tienes permisos para editar sucursales");
      return;
    }

    setSelectedBranch(branch);
    setFormData({
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
    if (!canCreateBranch()) {
      toast.error("No tienes permisos para crear sucursales");
      return;
    }

    // Verificar que el usuario tenga empresa asignada
    if (!hasCompany) {
      toast.error("No tienes una empresa asignada para crear sucursales");
      return;
    }

    setSelectedBranch(null);
    setFormData({
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

  const handleDeleteBranch = async (branch: Branch) => {
    if (!canDeleteBranch()) {
      toast.error("No tienes permisos para eliminar sucursales");
      return;
    }

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

  const handleSaveBranch = async () => {
    // Verificar que el usuario tenga empresa asignada
    if (!hasCompany) {
      toast.error("No tienes una empresa asignada para gestionar sucursales");
      return;
    }

    try {
      if (selectedBranch) {
        // Verificar permisos para editar
        if (!canEditBranch()) {
          toast.error("No tienes permisos para editar sucursales");
          return;
        }

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
        // Verificar permisos para crear
        if (!canCreateBranch()) {
          toast.error("No tienes permisos para crear sucursales");
          return;
        }

        const createData: CreateCompanyBranchData = {
          companyId: companyId!, // Usar la empresa del usuario (ya verificada con hasCompany)
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
          setSearchTerm("");
          setTimeout(() => {
            refetch();
          }, 500);
        }
      }
    } catch (err) {
      console.error("❌ Error al guardar sucursal:", err);
      toast.error("Error al guardar la sucursal");
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    if (!canToggleBranchStatus()) {
      toast.error("No tienes permisos para cambiar el estado de sucursales");
      return;
    }

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
      accessorKey: "contact_email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("contact_email") || "No especificado"}
        </div>
      ),
    },
    {
      accessorKey: "main_phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("main_phone") || "No especificado"}
        </div>
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
                {/* Editar - solo si tiene permisos */}
                {canEditBranch() && (
                  <DropdownMenuItem
                    onClick={() => handleEditBranch(branch)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                )}

                {/* Cambiar estado - solo si tiene permisos */}
                {canToggleBranchStatus() && (
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
                )}

                {/* Eliminar - solo si tiene permisos */}
                {canDeleteBranch() && (
                  <>
                    {(canEditBranch() || canToggleBranchStatus()) && (
                      <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteBranch(branch)}
                      className="cursor-pointer flex items-center gap-2 text-red_b"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Mensaje si no tiene ningún permiso */}
                {!canEditBranch() &&
                  !canToggleBranchStatus() &&
                  !canDeleteBranch() && (
                    <DropdownMenuItem className="text-gray-400 cursor-not-allowed">
                      No tienes permisos para realizar acciones
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const filteredBranches = useMemo(() => {
    return companyBranches.filter((branch) => {
      // Filtro por búsqueda
      const matchesSearch =
        !searchTerm ||
        (branch.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (branch.code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (branch.contact_email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (branch.physical_address?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      // Filtro por status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && branch.is_active) ||
        (statusFilter === "inactive" && !branch.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [companyBranches, searchTerm, statusFilter]);

  const isLoading = loading || userCompanyLoading;

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
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
                Sucursales
              </h1>
            </div>
          </div>

          {/* Sección de filtros SIN selector de empresas */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar sucursales..."
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

            {/* Botón crear con verificación de permisos */}
            <Button
              onClick={handleCreateBranch}
              className="flex items-center gap-2 whitespace-nowrap"
              disabled={isLoading || !canCreateBranch() || !hasCompany}
            >
              <Plus className="h-4 w-4" />
              <span>Crear Sucursal</span>
              {!canCreateBranch() && (
                <span className="sr-only">
                  (No tienes permisos para crear sucursales)
                </span>
              )}
            </Button>
          </div>

          {/* Mensaje informativo sobre permisos */}
          {!canCreateBranch() && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Información:</strong> Tu rol actual ({userRole}) no
                tiene permisos para crear sucursales. Contacta al administrador
                del sistema si necesitas este acceso.
              </p>
            </div>
          )}

          {/* CORRECCIÓN: Mensaje si el usuario no tiene empresa asignada */}
          {!hasCompany && !userCompanyLoading && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> No tienes una empresa asignada. No
                puedes ver ni gestionar sucursales. Contacta al administrador.
              </p>
            </div>
          )}

          {/* CORRECCIÓN: Mostrar tabla solo si hay una empresa asignada */}
          {hasCompany ? (
            <DataTable<Branch, Branch>
              columns={columns}
              data={Array.isArray(filteredBranches) ? filteredBranches : []}
              noResultsText="No se encontraron sucursales"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={
                Array.isArray(filteredBranches) ? filteredBranches.length : 0
              }
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          ) : !userCompanyLoading ? (
            <div className="text-center py-8 text-gray-500">
              No tienes una empresa asignada para ver sucursales
            </div>
          ) : null}
        </main>
      </div>

      {/* Los modales permanecen igual */}
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

              {/* CORRECCIÓN: Mostrar empresa del usuario solo si tiene empresa */}
              {hasCompany && (
                <div className="w-full">
                  <Label htmlFor="view-company" className="text-sm font-medium">
                    Empresa
                  </Label>
                  <p className="mt-1">{companyName}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="view-email" className="text-sm font-medium">
                    Email de Contacto
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Mail className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.contact_email || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <Label htmlFor="view-phone" className="text-sm font-medium">
                    Teléfono Principal
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Phone className="h-4 w-4 text-gray_m" />
                    <p>{selectedBranch.main_phone || "No especificado"}</p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="view-address" className="text-sm font-medium">
                  Dirección Física
                </Label>
                <div className="flex items-center mt-1 gap-2">
                  <MapPin className="h-4 w-4 text-gray_m" />
                  <p>{selectedBranch.physical_address || "No especificada"}</p>
                </div>
              </div>

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

      {/* Modal de edición/creación */}
      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="w-full bg-gray_xxl sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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

          <div className="grid grid-cols-1 gap-4 py-4">
            {/* Fila 1: Nombre y Código en grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
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
            </div>

            {/* Fila 2: Email y Teléfono en grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
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
            </div>

            {/* Fila 3: Dirección - Ocupa toda la fila */}
            <div className="space-y-2">
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

            {/* Fila 4: Tipo de Sucursal y Sucursal Activa en grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Sucursal */}
              <div className="space-y-2">
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

              {/* Sucursal Activa */}
              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Estado
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    Sucursal Activa
                  </Label>
                </div>
              </div>
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
              disabled={isLoading || !hasCompany}
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
    </div>
  );
};

export default BranchesPage;
