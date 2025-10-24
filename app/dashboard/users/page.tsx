"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  User,
  Mail,
  Phone,
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import useGetUsers from "@/hooks/users/useGetUsers";
import { useCreateUser } from "@/hooks/users/useCreateUsers";
import { useUpdateUser } from "@/hooks/users/useUpdateUser";
import { useDeleteUser } from "@/hooks/users/useDeleteUser";
import {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/services/users/users.service";
import { UserType } from "@/types";
import { useUserRoles } from "@/hooks/users/useUserRoles";
import { useTranslation } from "@/hooks/translation/useTranslation";

const createUserSchema = (availableRoles: string[] = []) => {
  return z.object({
    email: z.string().email("Correo inválido"),
    username: z.string().min(3, "El nombre de usuario es obligatorio"),
    password: z
      .string()
      .min(6, "La contraseña debe tener mínimo 6 caracteres")
      .optional()
      .or(z.literal("")),

    first_name: z.string().min(1, "El nombre es obligatorio"),
    last_name: z.string().min(1, "El apellido es obligatorio"),
    phone: z.string().optional(),

    // 🚀 validación dinámica de roles
    role: z.string().refine((val) => availableRoles.includes(val), {
      message: "Selecciona un rol válido",
    }),

    seller_code: z.string().optional(),
  });
};

type UserFormValues = z.infer<ReturnType<typeof createUserSchema>>;

const UsersPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // ✅ Usar el hook de traducción
  const { translateRole } = useTranslation();

  // Obtener roles desde la API
  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useUserRoles();

  const getAvailableRoles = () => {
    if (!rolesData) return [];

    try {
      if (rolesData.data?.message) {
        const parsed = JSON.parse(rolesData.data.message);
        return Array.isArray(parsed) ? parsed : [];
      }

      if (Array.isArray(rolesData.data)) {
        return rolesData.data;
      }

      if (rolesData.data && typeof rolesData.data === "object") {
        const rolesArray = Object.values(rolesData.data).flat();
        return Array.isArray(rolesArray) ? rolesArray : [];
      }

      return [];
    } catch (error) {
      console.error("Error parsing roles:", error);
      return [];
    }
  };

  const availableRoles = getAvailableRoles();

  const userSchema = createUserSchema(availableRoles);

  // Usar los hooks
  const {
    users,
    page,
    totalPage,
    total,
    itemsPerPage,
    search,
    setPage,
    setItemsPerPage,
    setSearch,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsers();

  const {
    createUser: createUserHook,
    loading: creatingUser,
    reset: resetCreate,
  } = useCreateUser({
    onSuccess: () => {
      toast.success("Usuario creado exitosamente");
      setIsCreateDialogOpen(false);
      form.reset();
      resetCreate();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    updateUser: updateUserHook,
    loading: updatingUser,
    reset: resetUpdate,
  } = useUpdateUser({
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente");
      setIsEditDialogOpen(false);
      form.reset();
      resetUpdate();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { deleteUser: deleteUserHook } = useDeleteUser({
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: availableRoles[0] || "user",
      seller_code: "",
    },
  });

  useEffect(() => {
    if (availableRoles.length > 0 && !selectedUser) {
      form.reset({
        ...form.getValues(),
        role: availableRoles[0],
      });
    }
  }, [availableRoles, form, selectedUser]);

  // Efecto para resetear form cuando se cierran los diálogos
  useEffect(() => {
    if (!isEditDialogOpen && !isCreateDialogOpen) {
      form.reset();
      setSelectedUser(null);
    }
  }, [isEditDialogOpen, isCreateDialogOpen, form]);

  // Efecto para cargar datos del usuario en edición
  useEffect(() => {
    if (selectedUser && isEditDialogOpen && availableRoles.length > 0) {
      form.reset({
        email: selectedUser.email,
        username: selectedUser.username,
        password: "",
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        phone: selectedUser.phone,
        role: selectedUser.role,
        seller_code: selectedUser.seller_code || "",
      });
    }
  }, [selectedUser, isEditDialogOpen, form, availableRoles]);

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveUser = async (data: UserFormValues) => {
    if (selectedUser) {
      const updateData: UpdateUserPayload = {
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        seller_code: data.seller_code,
      };

      if (data.email !== selectedUser.email) {
        updateData.email = data.email;
      }

      await updateUserHook(selectedUser.id, updateData);
    } else {
      const createData: CreateUserPayload = {
        email: data.email,
        password: data.password || "",
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || "",
        role: data.role,
        seller_code: data.seller_code || "",
        branch_id: 4,
        company_id: 4,
      };

      await createUserHook(createData);
    }
  };

  const handleDeleteUser = (user: UserType) => {
    toast.error(`¿Eliminar el usuario "${user.first_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          await deleteUserHook(user.id);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy hh:mm a");
    } catch {
      return "Fecha inválida";
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    return roleMatch;
  });

  const columns: ColumnDef<UserType>[] = [
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
        <div className="font-medium">{row.getValue("phone") || "N/A"}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <div className="font-medium">
          {/* ✅ Usar translateRole aquí */}
          {translateRole(row.getValue("role"))}
        </div>
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
        const user = row.original;
        const hasValidId = !!user.id;

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
                  onClick={() => handleEditUser(user)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user)}
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
              Usuarios
            </h1>
          </div>

          {/* Mostrar errores de carga */}
          {usersError && (
            <div className="bg-red_xxl border border-red_b text-red_b px-4 py-3 rounded mb-4">
              {usersError}
            </div>
          )}

          {rolesError && (
            <div className="bg-red_xxl border border-red_b text-red_b px-4 py-3 rounded mb-4">
              Error al cargar los roles: {rolesError.message}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu
                  open={isFilterDropdownOpen}
                  onOpenChange={setIsFilterDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtrar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[18rem]"
                    // ✅ Prevenir que el Select interfiera con el cierre
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                      // ✅ Permitir que el clic fuera cierre el dropdown
                      const target = e.target as HTMLElement;
                      if (!target.closest("[data-radix-select-content]")) {
                        setIsFilterDropdownOpen(false);
                      }
                    }}
                  >
                    <div className="px-2 py-1.5">
                      <Label htmlFor="role-filter">Rol</Label>
                      <Select
                        value={roleFilter}
                        onValueChange={(value) => {
                          setRoleFilter(value);
                        }}
                        onOpenChange={(open) => {
                          if (!open) {
                            setTimeout(() => {
                              document.body.style.pointerEvents = "";
                              document.documentElement.style.pointerEvents = "";
                            }, 100);
                          }
                        }}
                      >
                        <SelectTrigger id="role-filter" className="mt-1">
                          <SelectValue placeholder="Todos los roles" />
                        </SelectTrigger>
                        <SelectContent
                          onCloseAutoFocus={(e) => e.stopPropagation()}
                        >
                          <SelectItem value="all">Todos los roles</SelectItem>
                          {availableRoles.map((role: string, index: number) => (
                            <SelectItem key={index} value={role}>
                              {translateRole(role)}
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
              disabled={creatingUser || updatingUser || rolesLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Crear Usuario</span>
            </Button>
          </div>

          <DataTable<UserType, UserType>
            columns={columns}
            data={filteredUsers}
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
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                    <p>{selectedUser.phone || "N/A"}</p>
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
                    {/* ✅ Usar translateRole aquí */}
                    <p>{translateRole(selectedUser.role)}</p>
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
                        selectedUser.is_active
                          ? "bg-green_xxl text-green_b"
                          : "bg-red_xxl text-red_b"
                      }`}
                    >
                      {selectedUser.is_active ? "Activo" : "Inactivo"}
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
                  <p className="mt-1">{selectedUser.branch_id || "N/A"}</p>
                </div>

                <div>
                  <Label htmlFor="view-company" className="text-sm font-medium">
                    ID Empresa
                  </Label>
                  <p className="mt-1">{selectedUser.company_id || "N/A"}</p>
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
        <DialogContent className="w-full bg-gray_xxl sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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

          {rolesLoading ? (
            <div className="py-4 text-center">Cargando roles...</div>
          ) : (
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
                  {form.formState.errors.first_name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    placeholder="Pérez"
                    {...form.register("last_name")}
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
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

                <div className=" space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Controller
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role: string, index: number) => (
                            <SelectItem key={index} value={role}>
                              {/* ✅ Usar translateRole aquí también */}
                              {translateRole(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.role && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.role.message}
                    </p>
                  )}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsCreateDialogOpen(false);
                  }}
                  disabled={creatingUser || updatingUser}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingUser || updatingUser}>
                  {creatingUser || updatingUser
                    ? "Procesando..."
                    : selectedUser
                    ? "Actualizar"
                    : "Crear"}{" "}
                  Usuario
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
