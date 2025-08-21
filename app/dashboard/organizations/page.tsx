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

// 🔥 React Hook Form + Zod
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import usePostOrganizations from "@/hooks/organizations/useAddOrganization";
import useGetOrganizations from "@/hooks/organizations/useGetOrganizations";
import { toast, Toaster } from "sonner";

export type Organization = {
  id: string;
  name: string;
  companies: string[];
  roles: string[];
  logo?: string;
};

// ✅ Schema de validación con Zod
const organizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  rif: z.string().min(6, "RIF inválido").max(13, "RIF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido").max(15, "Teléfono inválido"),
});

// Tipo inferido del schema
type OrganizationForm = z.infer<typeof organizationSchema>;

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
    cell: ({ row }) => {
      const rif = row.getValue("legal_tax_id") as string | null;
      return rif ? (
        <span>{rif}</span>
      ) : (
        <span className="text-gray_l text-sm">Sin RIF</span>
      );
    },
  },
  {
    accessorKey: "contact_email",
    header: "Correo",
    cell: ({ row }) => {
      const email = row.getValue("contact_email") as string | null;
      return email ? (
        <span>{email}</span>
      ) : (
        <span className="text-gray_l text-sm">Sin correo</span>
      );
    },
  },
  {
    accessorKey: "main_phone",
    header: "Teléfono",
    cell: ({ row }) => {
      const phone = row.getValue("main_phone") as string | null;
      return phone ? (
        <span>{phone}</span>
      ) : (
        <span className="text-gray_l text-sm">Sin teléfono</span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const active = row.getValue("is_active") as boolean;
      return active ? (
        <span className="text-green-600 font-medium">Activo</span>
      ) : (
        <span className="text-red-600 font-medium">Inactivo</span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
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
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-red-500">
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

const OrganizationsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ⛏️ React Hook Form setup
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
  const onSubmit = async (values: OrganizationForm) => {
    const { name, rif, email, phone } = values;
    const newData = {
      name,
      contact_email: email,
      legal_tax_id: rif,
      main_phone: phone,
    };
    const response = await newOrganizations(newData);
    if (
      typeof response === "object" &&
      response !== null &&
      "status" in response &&
      response.status === 201
    ) {
      setModified((prev) => !prev);
      toast.success("Organización creada exitosamente");
    }

    reset();
    setIsModalOpen(false);
  };

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
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
              Organizaciones
            </h1>
            <Button
              onClick={() => setIsModalOpen(true)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva organización</DialogTitle>
          </DialogHeader>

          {/* ✅ Formulario con React Hook Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <Label htmlFor="name" className="sm:text-right">
                  Nombre
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-1">
                  <Input id="name" {...register("name")} required />
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
                  <Input id="rif" {...register("rif")} required />
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
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsPage;
