"use client";

import { useState, useEffect } from "react";
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
import { InstanceType } from "@/services/instances/types";

const instanceSchema = z.object({
  category_code: z.string().min(1, "El código es requerido"),
  category_name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  prefix: z.string().min(1, "El prefijo es requerido"),
  correlative_length: z.number().optional(),
});

type InstanceFormValues = z.infer<typeof instanceSchema>;

const STORAGE_KEY = "instances_list";

const InstancesPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 👉 Estado local de instancias
  const [instances, setInstances] = useState<InstanceType[]>([]);

  // 👉 Estado para edición
  const [editingInstance, setEditingInstance] = useState<InstanceType | null>(
    null
  );

  // 👉 Estados para paginación
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // calcular datos de paginación
  const total = instances.length;
  const totalPage = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginatedData = instances.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      description: "",
      prefix: "",
      correlative_length: 0,
    },
  });

  // 🔹 Cargar desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setInstances(JSON.parse(stored));
      } catch {
        console.error("Error leyendo localStorage");
      }
    }
  }, []);

  // 🔹 Guardar en localStorage cada vez que cambien las instancias
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
  }, [instances]);

  // Cargar datos al editar
  useEffect(() => {
    if (editingInstance) {
      reset(editingInstance);
    } else {
      reset({
        category_code: "",
        category_name: "",
        description: "",
        prefix: "",
        correlative_length: 0,
      });
    }
  }, [editingInstance, reset]);

  const onSubmit = (data: InstanceFormValues) => {
    if (editingInstance) {
      // Editar
      setInstances((prev) =>
        prev.map((item) =>
          item.category_code === editingInstance.category_code
            ? { ...item, ...data }
            : item
        )
      );
    } else {
      // Crear
      const newInstance: InstanceType = {
        category_code: data.category_code,
        category_name: data.category_name,
        description: data.description,
        prefix: data.prefix,
        correlative_length: data.correlative_length || 0,
      };

      setInstances((prev) => [...prev, newInstance]);
      reset({
        category_code: "",
        category_name: "",
        description: "",
        prefix: "",
        correlative_length: 0,
      });

      // Si estás en la última página y se llena, mover a la nueva
      const newTotal = total + 1;
      const newTotalPage = Math.ceil(newTotal / itemsPerPage);
      if (newTotalPage > totalPage) {
        setPage(newTotalPage);
      }
    }

    setIsModalOpen(false);
    setEditingInstance(null);
  };

  // 👉 Columnas con acciones
  const columns: ColumnDef<InstanceType>[] = [
    {
      accessorKey: "category_code",
      header: "Código",
    },
    {
      accessorKey: "category_name",
      header: "Nombre",
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "products",
      header: "Productos",
      cell: ({ row }) => {
        const productCount = (row.getValue("products") as number) || 0;
        return (
          <span className="text-xs bg-green_xxl px-3 py-1 rounded-full font-medium">
            {productCount} productos
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const instance = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Editar */}
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setEditingInstance(instance);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>

                {/* Eliminar */}
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-red-500"
                  onClick={() => {
                    setInstances((prev) =>
                      prev.filter(
                        (item) => item.category_code !== instance.category_code
                      )
                    );
                  }}
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
              onClick={() => {
                setEditingInstance(null);
                setIsModalOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva instancia</span>
            </Button>
          </div>

          {/* DataTable con paginación controlada */}
          <DataTable<InstanceType, InstanceType>
            columns={columns}
            data={paginatedData}
            noResultsText="No hay instancias registradas"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={total}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>

      {/* Modal para crear/editar instancia */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingInstance ? "Editar instancia" : "Nueva instancia"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Código */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="category_code" className="sm:text-right">
                  Código
                </Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="category_code"
                    placeholder="Ej: INST-001"
                    {...register("category_code")}
                    disabled={!!editingInstance} // 👈 no editable en modo edición
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
                <Label htmlFor="category_name" className="sm:text-right">
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

              {/* Prefijo */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="prefix" className="sm:text-right">
                  Prefijo
                </Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="prefix"
                    placeholder="Prefijo"
                    {...register("prefix")}
                  />
                  {errors.prefix && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.prefix.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingInstance(null);
                }}
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
