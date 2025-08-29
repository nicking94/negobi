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
import usePostOrganizations from "@/hooks/organizations/useAddOrganization";
import useGetOrganizations from "@/hooks/organizations/useGetOrganizations";
import { toast, Toaster } from "sonner";
import { OrganizationsService } from "@/services/organizations/organizations.service";

export type Organization = {
  id: string;
  name: string;
  companies: string[];
  roles: string[];
  logo?: string;
  contact_email?: string;
  legal_tax_id?: string;
  main_phone?: string;
  is_active?: boolean;
};

const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  rif: z.string().min(6, "RIF inválido").max(13, "RIF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido").max(15, "Teléfono inválido"),
});

type OrganizationForm = z.infer<typeof organizationSchema>;

const OrganizationsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

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

  const { newOrganizations } = usePostOrganizations();
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

  // ✅ Crear o actualizar
  const onSubmit = async (values: OrganizationForm) => {
    const { name, rif, email, phone } = values;
    const payload = {
      name,
      contact_email: email,
      legal_tax_id: rif,
      main_phone: phone,
    };

    if (editingOrg) {
      // 🔥 Aquí llamas a tu hook de actualización (ej: useUpdateOrganization)
      const response = await OrganizationsService.UpdateOrganization(
        editingOrg.id,
        payload
      );
      console.log("Actualizar org", editingOrg.id, payload);
      if (response.status === 200) {
        toast.success("Organización actualizada exitosamente");
        setModified((prev) => !prev);
      } else {
        toast.error("Error al actualizar la organización");
      }
    } else {
      const response = await newOrganizations(payload);
      if (
        typeof response === "object" &&
        response !== null &&
        "status" in response &&
        response.status === 201
      ) {
        setModified((prev) => !prev);
        toast.success("Organización creada exitosamente");
      }
    }

    reset();
    setEditingOrg(null);
    setIsModalOpen(false);
  };

  // ✅ Eliminar
  const handleDelete = (org: Organization) => {
    toast.error(`¿Eliminar la organización "${org.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const response = await OrganizationsService.DeleteOrganization(
            org.id
          );
          if (response.status === 200) {
            toast.success("Organización eliminada exitosamente");
            setModified((prev) => !prev);
          } else {
            toast.error("Error al eliminar la organización");
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

  // ✅ Editar
  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    reset({
      name: org.name || "",
      rif: org.legal_tax_id || "",
      email: org.contact_email || "",
      phone: org.main_phone || "",
    });
    setIsModalOpen(true);
  };

  // ✅ Columnas con handlers
  const columns: ColumnDef<Organization>[] = [
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
          <span className="text-gray_l text-sm">Sin RIF</span>
        ),
    },
    {
      accessorKey: "contact_email",
      header: "Correo",
      cell: ({ row }) =>
        row.getValue("contact_email") || (
          <span className="text-gray_l text-sm">Sin correo</span>
        ),
    },
    {
      accessorKey: "main_phone",
      header: "Teléfono",
      cell: ({ row }) =>
        row.getValue("main_phone") || (
          <span className="text-gray_l text-sm">Sin teléfono</span>
        ),
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) =>
        row.getValue("is_active") ? (
          <span className="text-green_m font-medium">Activo</span>
        ) : (
          <span className="text-red_m font-medium">Inactivo</span>
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
                  className="cursor-pointer flex items-center gap-2 text-red_m"
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Organizaciones
            </h1>
            <Button
              onClick={() => {
                reset();
                setEditingOrg(null);
                setIsModalOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva organización</span>
            </Button>
          </div>

          <DataTable<Organization, Organization>
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
                  <Input id="name" {...register("name")} required />
                  {errors.name && (
                    <p className="text-xs text-red_m">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="rif" className="sm:text-right">
                  RIF
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input id="rif" {...register("rif")} required />
                  {errors.rif && (
                    <p className="text-xs text-red_m">{errors.rif.message}</p>
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
                  />
                  {errors.email && (
                    <p className="text-xs text-red_m">{errors.email.message}</p>
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
                  />
                  {errors.phone && (
                    <p className="text-xs text-red_m">{errors.phone.message}</p>
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
