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

export type Instance = {
  id: string;
  code: string;
  description: string;
  products: number;
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
  const [instanceDescription, setInstanceDescription] = useState("");
  const [instances, setInstances] = useState<Instance[]>([
    {
      id: "1",
      code: "INST-001",
      description: "Instancia principal de producción",
      products: 42,
    },
    {
      id: "2",
      code: "INST-002",
      description: "Instancia de pruebas y desarrollo",
      products: 15,
    },
    {
      id: "3",
      code: "INST-003",
      description: "Instancia de demostración para clientes",
      products: 8,
    },
    {
      id: "4",
      code: "INST-004",
      description: "Instancia de backup",
      products: 42,
    },
    {
      id: "5",
      code: "INST-005",
      description: "Instancia de staging",
      products: 25,
    },
    {
      id: "6",
      code: "INST-006",
      description: "Instancia de QA",
      products: 18,
    },
    {
      id: "7",
      code: "INST-007",
      description: "Instancia de desarrollo móvil",
      products: 12,
    },
    {
      id: "8",
      code: "INST-008",
      description: "Instancia de integración continua",
      products: 7,
    },
    {
      id: "9",
      code: "INST-009",
      description: "Instancia de pre-producción",
      products: 35,
    },
    {
      id: "10",
      code: "INST-010",
      description: "Instancia de análisis de datos",
      products: 22,
    },
    {
      id: "11",
      code: "INST-011",
      description: "Instancia de inteligencia artificial",
      products: 15,
    },
    {
      id: "12",
      code: "INST-012",
      description: "Instancia de machine learning",
      products: 9,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInstance: Instance = {
      id: (instances.length + 1).toString(),
      code: instanceCode,
      description: instanceDescription,
      products: 0,
    };

    setInstances([...instances, newInstance]);
    setInstanceCode("");
    setInstanceDescription("");
    setIsModalOpen(false);
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

          <DataTable<Instance, Instance>
            columns={columns}
            data={instances}
            noResultsText="No hay instancias registradas"
          />
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva instancia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="sm:text-right">
                  Código
                </Label>
                <Input
                  id="code"
                  value={instanceCode}
                  onChange={(e) => setInstanceCode(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  required
                  placeholder="Ej: INST-001"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="sm:text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  value={instanceDescription}
                  onChange={(e) => setInstanceDescription(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  required
                  placeholder="Descripción de la instancia"
                />
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
