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
  User,
  Building,
  Mail,
  Phone,
  Key,
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

export type User = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "superAdmin" | "admin" | "user" | "seller";
  seller_code: string;
  branch_id: number;
  company_id: number;
  status: "active" | "inactive";
  created_at: Date;
};
type UserRole = "superAdmin" | "admin" | "user" | "seller";

const UsersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user" as "superAdmin" | "admin" | "user" | "seller",
    phone: "",
    username: "",
    branch_id: 0,
    company_id: 0,
    first_name: "",
    last_name: "",
    seller_code: "",
  });

  // Datos de ejemplo
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@empresa.com",
      username: "admin",
      first_name: "Juan",
      last_name: "Pérez",
      phone: "+1234567890",
      role: "admin",
      seller_code: "AD001",
      branch_id: 1,
      company_id: 1,
      status: "active",
      created_at: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "2",
      email: "vendedor1@empresa.com",
      username: "vendedor1",
      first_name: "María",
      last_name: "González",
      phone: "+0987654321",
      role: "seller",
      seller_code: "VD001",
      branch_id: 1,
      company_id: 1,
      status: "active",
      created_at: new Date("2024-02-20T14:45:00"),
    },
    {
      id: "3",
      email: "usuario@empresa.com",
      username: "usuario",
      first_name: "Carlos",
      last_name: "Rodríguez",
      phone: "+1122334455",
      role: "user",
      seller_code: "",
      branch_id: 2,
      company_id: 1,
      status: "inactive",
      created_at: new Date("2024-03-10T09:15:00"),
    },
    {
      id: "4",
      email: "super@empresa.com",
      username: "superadmin",
      first_name: "Ana",
      last_name: "Martínez",
      phone: "+5566778899",
      role: "superAdmin",
      seller_code: "",
      branch_id: 1,
      company_id: 1,
      status: "active",
      created_at: new Date("2024-01-05T08:00:00"),
    },
  ]);

  // Roles para los filtros
  const roles = [
    { id: "1", name: "superAdmin", label: "Super Administrador" },
    { id: "2", name: "admin", label: "Administrador" },
    { id: "3", name: "user", label: "Usuario" },
    { id: "4", name: "seller", label: "Vendedor" },
  ];

  // Estados para los filtros
  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  // Filtrar usuarios según los criterios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por rol (si no es "todos")
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Filtrar por estado (si no es "todos")
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // No mostramos la contraseña por seguridad
      role: user.role,
      phone: user.phone,
      username: user.username,
      branch_id: user.branch_id,
      company_id: user.company_id,
      first_name: user.first_name,
      last_name: user.last_name,
      seller_code: user.seller_code,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      email: "",
      password: "",
      role: "user",
      phone: "",
      username: "",
      branch_id: 1, // Valor por defecto
      company_id: 1, // Valor por defecto
      first_name: "",
      last_name: "",
      seller_code: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Editar usuario existente
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                email: formData.email,
                role: formData.role,
                phone: formData.phone,
                username: formData.username,
                branch_id: formData.branch_id,
                company_id: formData.company_id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                seller_code: formData.seller_code,
              }
            : user
        )
      );
      toast.success("Usuario actualizado exitosamente");
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: (users.length + 1).toString(),
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
        seller_code: formData.seller_code,
        branch_id: formData.branch_id,
        company_id: formData.company_id,
        status: "active",
        created_at: new Date(),
      };
      setUsers([...users, newUser]);
      toast.success("Usuario creado exitosamente");
    }
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast.success("Usuario eliminado exitosamente");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return format(date, "dd/MM/yyyy hh:mm a");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "superAdmin":
        return "Super Admin";
      case "admin":
        return "Administrador";
      case "seller":
        return "Vendedor";
      default:
        return "Usuario";
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Usuario",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("username")}</div>
          <div className="text-xs text-gray_m">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "first_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("phone")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <div className="font-medium">{getRoleLabel(row.getValue("role"))}</div>
      ),
    },
    {
      accessorKey: "seller_code",
      header: "Código Vendedor",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("seller_code") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === "active"
                ? "bg-green_xxl text-green_b"
                : "bg-red_xxl text-red_b"
            }`}
          >
            {status === "active" ? "Activo" : "Inactivo"}
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
        const user = row.original;
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
                  onClick={() => handleViewUser(user)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditUser(user)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user)}
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
              Gestión de Usuarios
            </h1>
          </div>

          <div className=" flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className=" flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, usuario, email o teléfono..."
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
                      <Label htmlFor="role-filter">Rol</Label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger id="role-filter" className="mt-1">
                          <SelectValue placeholder="Todos los roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los roles</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.label}
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
              onClick={handleCreateUser}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Usuario</span>
            </Button>
          </div>

          <DataTable<User, User>
            columns={columns}
            data={filteredUsers}
            noResultsText="No se encontraron usuarios"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredUsers.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      {/* Modal para ver detalles de usuario */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalles de Usuario
            </DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Mail className="h-4 w-4 text-gray_m" />
                    <p>{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-phone" className="text-sm font-medium">
                    Teléfono
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <Phone className="h-4 w-4 text-gray_m" />
                    <p>{selectedUser.phone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="view-username"
                    className="text-sm font-medium"
                  >
                    Usuario
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <User className="h-4 w-4 text-gray_m" />
                    <p>{selectedUser.username}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="view-role" className="text-sm font-medium">
                    Rol
                  </Label>
                  <div className="flex items-center mt-1 gap-2">
                    <BadgeCheck className="h-4 w-4 text-gray_m" />
                    <p>{getRoleLabel(selectedUser.role)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="view-firstname"
                    className="text-sm font-medium"
                  >
                    Nombre
                  </Label>
                  <p className="mt-1">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>

                <div>
                  <Label htmlFor="view-status" className="text-sm font-medium">
                    Estado
                  </Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.status === "active"
                          ? "bg-green_xxl text-green_b"
                          : "bg-red_xxl text-red_b"
                      }`}
                    >
                      {selectedUser.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.seller_code && (
                <div>
                  <Label
                    htmlFor="view-sellercode"
                    className="text-sm font-medium"
                  >
                    Código de Vendedor
                  </Label>
                  <p className="mt-1">{selectedUser.seller_code}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-branch" className="text-sm font-medium">
                    ID Sucursal
                  </Label>
                  <p className="mt-1">{selectedUser.branch_id}</p>
                </div>

                <div>
                  <Label htmlFor="view-company" className="text-sm font-medium">
                    ID Empresa
                  </Label>
                  <p className="mt-1">{selectedUser.company_id}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="view-created" className="text-sm font-medium">
                  Fecha de Creación
                </Label>
                <p className="mt-1">{formatDate(selectedUser.created_at)}</p>
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

      {/* Modal para crear/editar usuario */}
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
              {selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Modifica la información del usuario seleccionado"
                : "Completa la información para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ejemplo@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nombre de Usuario *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="nombre.usuario"
                />
              </div>
            </div>

            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  Nombre *
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="Juan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Apellido *
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Rol *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superAdmin">
                      Super Administrador
                    </SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === "seller" && (
              <div className="space-y-2">
                <Label htmlFor="seller_code" className="text-sm font-medium">
                  Código de Vendedor
                </Label>
                <Input
                  id="seller_code"
                  value={formData.seller_code}
                  onChange={(e) =>
                    setFormData({ ...formData, seller_code: e.target.value })
                  }
                  placeholder="VD001"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch_id" className="text-sm font-medium">
                  ID Sucursal
                </Label>
                <Input
                  id="branch_id"
                  type="number"
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branch_id: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id" className="text-sm font-medium">
                  ID Empresa
                </Label>
                <Input
                  id="company_id"
                  type="number"
                  value={formData.company_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      company_id: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="1"
                />
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
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveUser}>
              {selectedUser ? "Actualizar" : "Crear"} Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
