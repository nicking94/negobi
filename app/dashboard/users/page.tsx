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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { UsersService } from "@/services/users/users.service";
import useGetUsers from "@/hooks/users/useGetUsers";

const userSchema = z.object({
  email: z.string().email("Correo inválido"),
  username: z.string().min(3, "El nombre de usuario es obligatorio"),
  password: z
    .string()
    .min(6, "La contraseña debe tener mínimo 6 caracteres")
    .optional(),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().optional(),
  role: z.enum(["superAdmin", "admin", "sellers", "user"], {
    error: "Selecciona un rol",
  }),
  seller_code: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export type User = {
  id?: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "superAdmin" | "admin" | "user" | "sellers";
  seller_code: string;
  branch_id: number;
  company_id: number;
  status?: "active" | "inactive";
  created_at?: Date;
};
type UserRole = "superAdmin" | "admin" | "user" | "sellers";

const UsersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: selectedUser
      ? {
          ...selectedUser,
        }
      : {
          email: "",
          username: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "user",
          seller_code: "",
        },
  });

  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user" as "superAdmin" | "admin" | "user" | "sellers",
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
      role: "sellers",
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
    { id: "4", name: "sellers", label: "Vendedor" },
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
    form.reset(user);

    setIsEditDialogOpen(true);
  };

  const {
    usersResponse,
    page,
    itemsPerPage,
    setItemsPerPage,
    setModified,
    setPage,
    setSearch,
    total,
    totalPage,
  } = useGetUsers();

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
  console.log(form.formState.errors);

  const handleSaveUser = async (data: UserFormValues) => {
    const newUser: User = {
      ...data,
      branch_id: 4,
      company_id: 4,
      phone: data.phone ?? "", //
      seller_code: data.seller_code ?? "",
    };
    if (selectedUser) {
      const response = await UsersService.patchUser(selectedUser.id!, newUser);
      if (response.status === 200) {
        toast.success("Usuario actualizado exitosamente");
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setModified((prev) => !prev);
        form.reset();
      } else {
        toast.error("Error al crear el usuario");
      }
    } else {
      // Crear nuevo usuario

      const response = await UsersService.postUser(newUser);
      if (response.status === 201) {
        toast.success("Usuario creado exitosamente");
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setModified((prev) => !prev);
        form.reset();
      } else {
        toast.error("Error al crear el usuario");
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    toast.error(`¿Eliminar el usuario"${user.first_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const response = await UsersService.deleteUser(user.id as string);
          if (response.status === 200) {
            toast.success("Usuario eliminado exitosamente");
            setModified((prev) => !prev);
          } else {
            toast.error("Error al eliminar el usuario");
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
      case "sellers":
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
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("is_active") as boolean;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === true
                ? "bg-green_xxl text-green_b"
                : "bg-red_xxl text-red_b"
            }`}
          >
            {status === true ? "Activo" : "Inactivo"}
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
            data={usersResponse || []}
            noResultsText="No se encontraron usuarios"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={total}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
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
                <p className="mt-1">
                  {formatDate(selectedUser.created_at ?? null)}
                </p>
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
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Modifica la información del usuario seleccionado"
                : "Completa la información para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSaveUser)}
            className="grid gap-4 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  placeholder="nombre.usuario"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  placeholder="Juan"
                  {...form.register("first_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  placeholder="Pérez"
                  {...form.register("last_name")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  {...form.register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superAdmin">
                          Super Administrador
                        </SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="sellers">Vendedor</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {form.watch("role") === "sellers" && (
              <div className="space-y-2">
                <Label htmlFor="seller_code">Código de Vendedor</Label>
                <Input
                  id="seller_code"
                  placeholder="VD001"
                  {...form.register("seller_code")}
                />
              </div>
            )}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch_id">ID Sucursal</Label>
                <Input
                  id="branch_id"
                  type="number"
                  placeholder="1"
                  {...form.register("branch_id")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">ID Empresa</Label>
                <Input
                  id="company_id"
                  type="number"
                  placeholder="1"
                  {...form.register("company_id")}
                />
              </div>
            </div> */}

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
                {selectedUser ? "Actualizar" : "Crear"} Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
