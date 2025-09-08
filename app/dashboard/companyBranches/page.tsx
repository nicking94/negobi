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
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

export type Branch = {
  id: number;
  companyId: number;
  name: string;
  code: string;
  contact_email: string;
  main_phone: string;
  physical_address: string;
  is_active: boolean;
  is_central: boolean;
  created_at: Date;
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
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    companyId: 1,
    name: "",
    code: "",
    contact_email: "",
    main_phone: "",
    physical_address: "",
    is_active: true,
    is_central: false,
  });

  // Datos de ejemplo de empresas
  const companies = [
    { id: 1, name: "Empresa ABC, C.A.", code: "ABC" },
    { id: 2, name: "Comercial XYZ, S.A.", code: "XYZ" },
    { id: 3, name: "Distribuidora Norte, C.A.", code: "DNO" },
  ];

  // Datos de ejemplo de sucursales
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 1,
      companyId: 1,
      name: "Sucursal Principal",
      code: "ABC-001",
      contact_email: "principal@empresaabc.com",
      main_phone: "+1234567890",
      physical_address: "Av. Principal #123, Caracas",
      is_active: true,
      is_central: true,
      created_at: new Date("2024-01-15T10:30:00"),
      company: {
        name: "Empresa ABC, C.A.",
        code: "ABC",
      },
    },
    {
      id: 2,
      companyId: 1,
      name: "Sucursal Este",
      code: "ABC-002",
      contact_email: "este@empresaabc.com",
      main_phone: "+1234567891",
      physical_address: "Av. Este #456, Caracas",
      is_active: true,
      is_central: false,
      created_at: new Date("2024-02-20T14:45:00"),
      company: {
        name: "Empresa ABC, C.A.",
        code: "ABC",
      },
    },
    {
      id: 3,
      companyId: 2,
      name: "Sucursal Central",
      code: "XYZ-001",
      contact_email: "central@comercialxyz.com",
      main_phone: "+0987654321",
      physical_address: "Calle Comercio #456, Valencia",
      is_active: true,
      is_central: true,
      created_at: new Date("2024-03-10T09:15:00"),
      company: {
        name: "Comercial XYZ, S.A.",
        code: "XYZ",
      },
    },
    {
      id: 4,
      companyId: 3,
      name: "Sucursal Norte",
      code: "DNO-001",
      contact_email: "norte@distribuidoranorte.com",
      main_phone: "+1122334455",
      physical_address: "Zona Industrial Norte, Maracaibo",
      is_active: false,
      is_central: true,
      created_at: new Date("2024-04-05T11:20:00"),
      company: {
        name: "Distribuidora Norte, C.A.",
        code: "DNO",
      },
    },
  ]);

  // Estados para los filtros
  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  // Filtrar sucursales según los criterios
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.physical_address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtrar por estado (si no es "todos")
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && branch.is_active) ||
        (statusFilter === "inactive" && !branch.is_active);

      // Filtrar por empresa (si no es "todos")
      const matchesCompany =
        companyFilter === "all" ||
        branch.companyId.toString() === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [branches, searchTerm, statusFilter, companyFilter]);

  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewDialogOpen(true);
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
    setFormData({
      companyId: 1,
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

  const handleSaveBranch = () => {
    if (selectedBranch) {
      // Editar sucursal existente
      setBranches(
        branches.map((branch) =>
          branch.id === selectedBranch.id
            ? {
                ...branch,
                companyId: formData.companyId,
                name: formData.name,
                code: formData.code,
                contact_email: formData.contact_email,
                main_phone: formData.main_phone,
                physical_address: formData.physical_address,
                is_active: formData.is_active,
                is_central: formData.is_central,
                company: companies.find((c) => c.id === formData.companyId),
              }
            : branch
        )
      );
      toast.success("Sucursal actualizada exitosamente");
    } else {
      // Crear nueva sucursal
      const company = companies.find((c) => c.id === formData.companyId);
      const newBranch: Branch = {
        id: branches.length + 1,
        companyId: formData.companyId,
        name: formData.name,
        code: formData.code,
        contact_email: formData.contact_email,
        main_phone: formData.main_phone,
        physical_address: formData.physical_address,
        is_active: formData.is_active,
        is_central: formData.is_central,
        created_at: new Date(),
        company: company
          ? {
              name: company.name,
              code: company.code,
            }
          : undefined,
      };
      setBranches([...branches, newBranch]);
      toast.success("Sucursal creada exitosamente");
    }
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteBranch = (branch: Branch) => {
    setBranches(branches.filter((b) => b.id !== branch.id));
    toast.success("Sucursal eliminada exitosamente");
  };

  const handleToggleStatus = (branch: Branch) => {
    setBranches(
      branches.map((b) =>
        b.id === branch.id ? { ...b, is_active: !b.is_active } : b
      )
    );
    toast.success(
      `Sucursal ${!branch.is_active ? "activada" : "desactivada"} exitosamente`
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(date, "dd/MM/yyyy hh:mm a");
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
          {row.original.company
            ? `${row.original.company.name} (${row.original.company.code})`
            : getCompanyName(row.original.companyId)}
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
        const date = row.getValue("created_at") as Date;
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
                <Button variant="ghost" className="h-8 w-8 p-0">
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
                  placeholder="Buscar por nombre, código, email o dirección..."
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
                      <Label htmlFor="company-filter">Empresa</Label>
                      <Select
                        value={companyFilter}
                        onValueChange={setCompanyFilter}
                      >
                        <SelectTrigger id="company-filter" className="mt-1">
                          <SelectValue placeholder="Todas las empresas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las empresas
                          </SelectItem>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={company.id.toString()}
                            >
                              {company.name} ({company.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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

      {/* Modal para crear/editar sucursal */}
      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="w-full bg-white sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId" className="text-sm font-medium">
                  Empresa *
                </Label>
                <Select
                  value={formData.companyId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, companyId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="companyId">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                      >
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveBranch}>
              {selectedBranch ? "Actualizar" : "Crear"} Sucursal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchesPage;
