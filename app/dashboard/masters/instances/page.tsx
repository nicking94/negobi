"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Table,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function DataTablePagination({ table }: { table: Table<Instance> }) {
  const firstItem =
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1;
  const lastItem = Math.min(
    (table.getState().pagination.pageIndex + 1) *
      table.getState().pagination.pageSize,
    table.getFilteredRowModel().rows.length
  );
  const totalItems = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 mt-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Filas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {firstItem}-{lastItem} de {totalItems} resultados
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          title="Primera página"
        >
          <span className="sr-only">Primera página</span>
          <ChevronsLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          title="Página anterior"
        >
          <span className="sr-only">Página anterior</span>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          title="Próxima página"
        >
          <span className="sr-only">Página siguiente</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          title="Última página"
        >
          <span className="sr-only">Última página</span>
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function DataTable({ data }: { data: Instance[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="bg-white  backdrop-blur-sm  shadow-xl rounded-md flex-1 overflow-hidden flex flex-col">
      <div className="rounded-md overflow-hidden flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-green_m shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-white font-semibold whitespace-nowrap text-left px-4 py-3 border-b border-green_d"
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-green_xxl/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3 px-4 text-left"
                        style={{ width: `${cell.column.getSize()}px` }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay instancias registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

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

          <DataTable data={instances} />
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
