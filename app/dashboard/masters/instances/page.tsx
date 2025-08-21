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
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import useAddInstance from "@/hooks/instances/useAddInstance";

const instanceSchema = z.object({
  category_code: z.string().min(1, "El código es requerido"),
  category_name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
});

type InstanceFormValues = z.infer<typeof instanceSchema>;

export type Instance = {
  category_code: string;
  category_name: string;
  description: string;
  parentCategoryId: number;
};

const columns: ColumnDef<Instance>[] = [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium min-w-[150px]">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="font-medium min-w-[150px]">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="min-w-[200px]">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "products",
    header: "Productos",
    cell: ({ row }) => {
      const productCount = row.getValue("products") as number;
      return (
        <div className="flex items-center justify-start">
          <span className="text-xs bg-green_xxl px-3 py-1 rounded-full font-medium">
            {productCount} productos
          </span>
        </div>
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

const InstancesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instanceCode, setInstanceCode] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [instanceDescription, setInstanceDescription] = useState("");
  const [instances, setInstances] = useState<Instance[]>([
    {
      category_code: "INST-001",
      category_name: "Instancia principal de producción",
      description: "Instancia principal de producción",
      parentCategoryId: 0,
    },
    {
      category_code: "INST-002",
      category_name: "Instancia de pruebas y desarrollo",
      description: "Instancia de pruebas y desarrollo",
      parentCategoryId: 0,
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      description: "",
    },
  });

  const { newInstance } = useAddInstance();

  const onSubmit = async (data: InstanceFormValues) => {
    const newInstanceData: Instance = {
      category_code: data.category_code,
      category_name: data.category_name,
      description: data.description,
      parentCategoryId: 0, // Asignar el ID de la categoría padre según sea necesario
    };
    const result = await newInstance(newInstanceData);
    if (result) {
      alert("Instancia creada exitosamente");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20">
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
              Instancias
            </h1>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva instancia</span>
            </Button>
          </div>
          {/* 
          <DataTable<Instance, Instance>
            columns={columns}
            data={instances}
            noResultsText="No hay instancias registradas"
          /> */}
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva instancia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Código */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="sm:text-right">
                  Código
                </Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="category_code"
                    placeholder="Ej: INST-001"
                    {...register("category_code")}
                  />
                  {errors.category_code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category_code.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="sm:text-right">
                  Nombre
                </Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="category_name"
                    placeholder="Nombre de la instancia"
                    {...register("category_name")}
                  />
                  {errors.category_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="sm:text-right">
                  Descripción
                </Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="description"
                    placeholder="Descripción de la instancia"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
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
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstancesPage;
