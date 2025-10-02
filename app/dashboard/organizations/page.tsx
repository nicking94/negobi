"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, Plus } from "lucide-react";
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
import { OrganizationType, ApiError } from "@/types";

// ✅ Schema de validación
const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  rif: z.string().min(6, "RIF inválido").max(13, "RIF inválido"),
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

  // ✅ Hooks
  const { newOrganizations, loading: creating } = usePostOrganizations();
  const {
    setModified,
    organizationsResponse,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    page,
    itemsPerPage,
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
        console.log("🔄 Actualizando organización:", {
          id: editingOrg.id,
          payload: values,
        });

        // Para edición, enviar todos los campos como strings requeridos según el Swagger
        const updatePayload = {
          name: name.trim(),
          legal_tax_id: rif.trim().toUpperCase(),
          contact_email: email.trim().toLowerCase(),
          main_phone: phone.trim().replace(/\s/g, ""),
        };

        const response = await OrganizationsService.UpdateOrganization(
          Number(editingOrg.id),
          updatePayload
        );

        console.log("✅ Organización actualizada:", response.data);
        toast.success("Organización actualizada exitosamente");
        setModified((prev) => !prev);
        reset();
        setEditingOrg(null);
        setIsModalOpen(false);
      } else {
        // Para creación, enviar todos los campos como strings requeridos según el Swagger
        const createPayload = {
          name: name.trim(),
          legal_tax_id: rif.trim().toUpperCase(),
          contact_email: email.trim().toLowerCase(),
          main_phone: phone.trim().replace(/\s/g, ""),
        };

        console.log("📤 Creando organización:", createPayload);

        const response = await newOrganizations(createPayload);

        if (response && "error" in response) {
          // Manejar errores específicos
          if (response.status === 409) {
            toast.error("Ya existe una organización con ese RIF o email");
          } else {
            toast.error(response.message || "Error al crear la organización");
          }
        } else if (
          response &&
          (response.status === 201 || response.status === 200)
        ) {
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

      // Usamos type assertion con tu interfaz ApiError
      const apiError = error as ApiError;

      if (apiError.response?.data) {
        const serverError = apiError.response.data as ServerError;
        console.error("📋 Error del servidor:", serverError);

        // Manejo específico de errores
        if (serverError.statusCode === 409) {
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
      } else {
        toast.error("Error de conexión con el servidor");
      }
    }
  };

  const handleDelete = async (org: OrganizationType) => {
    if (!org.id) {
      toast.error("Error: La organización no tiene ID válido");
      return;
    }

    toast.error(`¿Eliminar la organización "${org.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            const response = await OrganizationsService.DeleteOrganization(
              org.id!
            );

            if (response.status === 200 || response.status === 204) {
              toast.success("Organización eliminada exitosamente");
              setModified((prev) => !prev);
            } else {
              console.error("Error response:", response);
              toast.error(
                `Error ${response.status}: No se pudo eliminar la organización`
              );
            }
          } catch (error: unknown) {
            console.error("Error deleting organization:", error);

            // Usamos type assertion con tu interfaz ApiError
            const apiError = error as ApiError;

            if (apiError.response) {
              console.error("Error response data:", apiError.response.data);
              console.error("Error status:", apiError.response.status);

              if (apiError.response.status === 409) {
                toast.error(
                  "No se puede eliminar: La organización tiene datos relacionados"
                );
              } else if (apiError.response.status === 404) {
                toast.error("Organización no encontrada");
              } else {
                toast.error(
                  `Error ${apiError.response.status}: No se pudo eliminar`
                );
              }
            } else {
              toast.error("Error de conexión al eliminar la organización");
            }
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

  // ✅ Columnas de la tabla (SIN la columna "Estado")
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
      header: "RIF",
      cell: ({ row }) =>
        row.getValue("legal_tax_id") || (
          <span className="text-gray-400 text-sm">Sin RIF</span>
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
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(org)}
                  className="cursor-pointer flex items-center gap-2 text-red-600"
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
            <Button
              onClick={() => {
                reset();
                setEditingOrg(null);
                setIsModalOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
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

      {/* Modal de creación/edición */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? "Editar organización" : "Nueva organización"}
            </DialogTitle>
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
                  RIF
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input
                    id="rif"
                    {...register("rif")}
                    required
                    disabled={isSubmitting}
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
