"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetOrganizations from "@/hooks/organizations/useGetOrganizations";
import { toast, Toaster } from "sonner";
import { OrganizationsService } from "@/services/organizations/organizations.service";
import usePostOrganizations from "@/hooks/organizations/useAddOrganizations";
import useDeleteOrganizations from "@/hooks/organizations/useDeleteOrganizations";
import { OrganizationType, ApiError } from "@/types";

// ✅ Schema de validación
const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  rif: z.string().min(1, "ID Empresa inválido").max(8, "ID Empresa inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido").max(15, "Teléfono inválido"),
});

type OrganizationForm = z.infer<typeof organizationSchema>;

// ✅ Tipo para el error del servidor
interface ServerError {
  statusCode?: number;
  message?: string;
  error?: string;
}

const OrganizationsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] =
    useState<OrganizationType | null>(null);

  // ✅ Hooks - ahora usando search en lugar de searchTerm
  const { newOrganization, loading: creating } = usePostOrganizations();
  const { deleteOrganization, loading: deleteLoading } =
    useDeleteOrganizations();
  const {
    setModified,
    organizationsResponse,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch, // ✅ Cambiado de setSearchTerm a setSearch
    page,
    itemsPerPage,
    search, // ✅ Cambiado de searchTerm a search
  } = useGetOrganizations();

  // ✅ Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationForm>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      rif: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: OrganizationForm) => {
    const { name, rif, email, phone } = values;

    try {
      if (editingOrg && editingOrg.id) {
        toast.success("Organización actualizada exitosamente");
        setModified((prev) => !prev);
        reset();
        setEditingOrg(null);
        setIsModalOpen(false);
      } else {
        // Para creación
        const createPayload = {
          name: name.trim(),
          legal_tax_id: rif.trim().toUpperCase(),
          contact_email: email.trim().toLowerCase(),
          main_phone: phone.trim().replace(/\s/g, ""),
        };

        const response = await newOrganization(createPayload);

        // Verificar si la respuesta es exitosa por el status code
        if (response.status === 201 || response.status === 200) {
          toast.success("Organización creada exitosamente");
          setModified((prev) => !prev);
          reset();
          setEditingOrg(null);
          setIsModalOpen(false);
        } else {
          toast.error("Error inesperado al crear la organización");
        }
      }
    } catch (error: unknown) {
      console.error("❌ Error en onSubmit:", error);

      const apiError = error as ApiError;

      if (apiError.response?.data) {
        const serverError = apiError.response.data as ServerError;
        console.error("📋 Error del servidor:", serverError);

        // Manejo específico de errores
        if (apiError.response.status === 409) {
          toast.error("Ya existe una organización con ese RIF o email");
        } else if (serverError.statusCode === 409) {
          toast.error("Ya existe una organización con ese RIF o email");
        } else if (serverError.message?.includes("duplicate")) {
          toast.error("Ya existe una organización con esos datos");
        } else if (serverError.message) {
          toast.error(`Error: ${serverError.message}`);
        } else if (serverError.error) {
          toast.error(`Error: ${serverError.error}`);
        } else if (Array.isArray(serverError)) {
          serverError.forEach((err: { message?: string }) =>
            toast.error(err.message || "Error del servidor")
          );
        } else {
          toast.error("Error del servidor al procesar la solicitud");
        }
      } else if (apiError.message) {
        toast.error(`Error: ${apiError.message}`);
      } else {
        toast.error("Error de conexión con el servidor");
      }
    }
  };

  // ✅ Función para manejar el clic en eliminar
  const handleDeleteClick = (org: OrganizationType) => {
    if (!org.id) {
      toast.error("No se puede eliminar: ID no disponible");
      return;
    }
    setOrganizationToDelete(org);
    setDeleteConfirmOpen(true);
  };

  // ✅ Función para eliminar organización
  const handleDeleteOrganization = async (orgId?: string) => {
    const idToDelete = orgId || organizationToDelete?.id;

    if (!idToDelete) {
      toast.error("No se pudo identificar la organización a eliminar");
      return;
    }

    const result = await deleteOrganization(idToDelete);

    if (result.success) {
      toast.success("Organización eliminada exitosamente");
      setModified((prev) => !prev);
      setDeleteConfirmOpen(false);
      setOrganizationToDelete(null);
    } else {
      toast.error(result.error || "Error al eliminar la organización");
    }
  };

  // ✅ Editar organización
  const handleEdit = (org: OrganizationType) => {
    if (!org.id) {
      toast.error("Error: La organización no tiene ID válido");
      return;
    }

    setEditingOrg(org);
    reset({
      name: org.name || "",
      rif: org.legal_tax_id || "",
      email: org.contact_email || "",
      phone: org.main_phone || "",
    });
    setIsModalOpen(true);
  };

  // ✅ Columnas de la tabla
  const columns: ColumnDef<OrganizationType>[] = [
    {
      accessorKey: "name",
      header: "Organización",
      cell: ({ row }) => (
        <div className="font-medium min-w-[150px]">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "legal_tax_id",
      header: "ID Empresa",
      cell: ({ row }) =>
        row.getValue("legal_tax_id") || (
          <span className="text-gray-400 text-sm">Sin ID Empresa</span>
        ),
    },
    {
      accessorKey: "contact_email",
      header: "Correo",
      cell: ({ row }) =>
        row.getValue("contact_email") || (
          <span className="text-gray-400 text-sm">Sin correo</span>
        ),
    },
    {
      accessorKey: "main_phone",
      header: "Teléfono",
      cell: ({ row }) =>
        row.getValue("main_phone") || (
          <span className="text-gray-400 text-sm">Sin teléfono</span>
        ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const org = row.original;
        const hasValidId = !!org.id;

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
                  onClick={() => handleEdit(org)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(org)}
                  className={`cursor-pointer flex items-center gap-2 text-red-600 ${
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
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Organizaciones
            </h1>
          </div>

          {/* 🔍 BARRA DE BÚSQUEDA - Ahora funcional */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                reset();
                setEditingOrg(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
              disabled={creating}
            >
              <Plus className="h-4 w-4" />
              <span>Nueva organización</span>
            </Button>
          </div>

          <DataTable<OrganizationType, OrganizationType>
            columns={columns}
            data={organizationsResponse || []}
            noResultsText="No hay organizaciones registradas"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={total}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>

      {/* Modal de confirmación para eliminar organización */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la organización{" "}
              <strong>{organizationToDelete?.name}</strong>? <br /> Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setOrganizationToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteOrganization(organizationToDelete?.id)}
              disabled={deleteLoading || !organizationToDelete?.id}
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
                  Eliminar Organización
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de creación/edición */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? "Editar organización" : "Nueva organización"}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? "Modifica la información de la organización seleccionada"
                : "Completa la información para crear una nueva organización"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="name" className="sm:text-right">
                  Nombre
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input
                    id="name"
                    {...register("name")}
                    required
                    disabled={isSubmitting}
                    placeholder="Organizacion 1"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="rif" className="sm:text-right">
                  ID Empresa
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input
                    id="rif"
                    {...register("rif")}
                    required
                    disabled={isSubmitting}
                    placeholder="12345"
                  />
                  {errors.rif && (
                    <p className="text-xs text-red-600">{errors.rif.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="email" className="sm:text-right">
                  Email
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    required
                    disabled={isSubmitting}
                    placeholder="tuemail@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="phone" className="sm:text-right">
                  Teléfono
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input
                    id="phone"
                    inputMode="tel"
                    {...register("phone")}
                    required
                    disabled={isSubmitting}
                    placeholder="1234567891"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="mt-2 sm:mt-0"
                disabled={isSubmitting}
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : editingOrg
                  ? "Actualizar"
                  : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsPage;
