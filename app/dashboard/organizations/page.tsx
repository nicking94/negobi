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

export type Organization = {
  id: string;
  name: string;
  companies: string[];
  roles: string[];
  logo?: string;
};

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Organización",
    cell: ({ row }) => (
      <div className="font-medium min-w-[150px]">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "companies",
    header: "Empresas",
    cell: ({ row }) => {
      const companies = row.getValue("companies") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {companies.map((company, index) => (
            <span
              key={index}
              className="text-xs bg-gray_xxl px-2 py-1 rounded whitespace-nowrap"
            >
              {company}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <span
              key={index}
              className="text-xs bg-green_xxl px-2 py-1 rounded whitespace-nowrap"
            >
              {role}
            </span>
          ))}
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

function DataTablePagination({ table }: { table: Table<Organization> }) {
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

function DataTable({ data }: { data: Organization[] }) {
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
    <div className="bg-white h-[80vh] max-h-[80vh] backdrop-blur-sm  shadow-xl rounded-md flex-1 overflow-hidden flex flex-col">
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
                    No hay organizaciones registradas
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

const OrganizationsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: "1",
      name: "Tech Solutions Inc.",
      companies: ["Tech Solutions USA", "Tech Solutions Europe"],
      roles: ["Administrador", "Desarrollador", "QA"],
      logo: "/logos/tech-solutions.png",
    },
    {
      id: "2",
      name: "Global Finance Group",
      companies: ["GFG Investments", "GFG Bank", "GFG Insurance"],
      roles: ["Analista Financiero", "Gerente", "Asesor"],
      logo: "/logos/global-finance.png",
    },
    {
      id: "3",
      name: "HealthPlus Systems",
      companies: ["HealthPlus Clinics", "HealthPlus Pharma"],
      roles: ["Médico", "Enfermero", "Administrativo"],
      logo: "/logos/healthplus.png",
    },
    {
      id: "4",
      name: "EduFuture",
      companies: ["EduFuture Schools", "EduFuture Online"],
      roles: ["Profesor", "Coordinador", "Tutor"],
      logo: "/logos/edufuture.png",
    },
    {
      id: "5",
      name: "GreenEnergy Corp",
      companies: ["GreenEnergy Solar", "GreenEnergy Wind"],
      roles: ["Ingeniero", "Técnico", "Ventas"],
      logo: "/logos/greenenergy.png",
    },
    {
      id: "6",
      name: "AutoMasters",
      companies: ["AutoMasters Dealership", "AutoMasters Parts"],
      roles: ["Vendedor", "Mecánico", "Gerente"],
      logo: "/logos/automasters.png",
    },
    {
      id: "7",
      name: "BuildRight",
      companies: ["BuildRight Construction", "BuildRight Materials"],
      roles: ["Arquitecto", "Ingeniero Civil", "Obrero"],
      logo: "/logos/buildright.png",
    },
    {
      id: "8",
      name: "FashionHub",
      companies: ["FashionHub Retail", "FashionHub Design"],
      roles: ["Diseñador", "Vendedor", "Marketing"],
      logo: "/logos/fashionhub.png",
    },
    {
      id: "9",
      name: "LogiTrans",
      companies: ["LogiTrans Shipping", "LogiTrans Warehousing"],
      roles: ["Coordinador", "Conductor", "Almacenista"],
      logo: "/logos/logitrans.png",
    },
    {
      id: "10",
      name: "MediaSphere",
      companies: ["MediaSphere Productions", "MediaSphere Digital"],
      roles: ["Editor", "Diseñador Gráfico", "Productor"],
      logo: "/logos/mediasphere.png",
    },
    {
      id: "11",
      name: "AgroViva",
      companies: ["AgroViva Farms", "AgroViva Exports"],
      roles: ["Agrónomo", "Supervisor", "Técnico Agrícola"],
      logo: "/logos/agroviva.png",
    },
    {
      id: "12",
      name: "Tourismo",
      companies: ["Tourismo Travel", "Tourismo Hotels"],
      roles: ["Guía", "Recepcionista", "Gerente"],
      logo: "/logos/tourismo.png",
    },
    {
      id: "13",
      name: "LegalTrust",
      companies: ["LegalTrust Law Firm", "LegalTrust Consulting"],
      roles: ["Abogado", "Asistente Legal", "Paralegal"],
      logo: "/logos/legaltrust.png",
    },
    {
      id: "14",
      name: "TechNova",
      companies: ["TechNova Software", "TechNova Cloud"],
      roles: ["Desarrollador", "QA Tester", "DevOps"],
      logo: "/logos/technova.png",
    },
    {
      id: "15",
      name: "BeautyCare",
      companies: ["BeautyCare Salons", "BeautyCare Products"],
      roles: ["Estilista", "Cosmetólogo", "Vendedor"],
      logo: "/logos/beautycare.png",
    },
    {
      id: "16",
      name: "SportLife",
      companies: ["SportLife Gyms", "SportLife Nutrition"],
      roles: ["Entrenador", "Nutricionista", "Recepcionista"],
      logo: "/logos/sportlife.png",
    },
    {
      id: "17",
      name: "HomeSweet",
      companies: ["HomeSweet Realty", "HomeSweet Property Management"],
      roles: ["Agente", "Administrador", "Corredor"],
      logo: "/logos/homesweet.png",
    },
    {
      id: "18",
      name: "PetFriends",
      companies: ["PetFriends Clinics", "PetFriends Stores"],
      roles: ["Veterinario", "Asistente", "Vendedor"],
      logo: "/logos/petfriends.png",
    },
    {
      id: "19",
      name: "CreativeMinds",
      companies: ["CreativeMinds Advertising", "CreativeMinds PR"],
      roles: ["Diseñador", "Copywriter", "Estratega"],
      logo: "/logos/creativeminds.png",
    },
    {
      id: "20",
      name: "SecureNet",
      companies: ["SecureNet Cybersecurity", "SecureNet IT"],
      roles: ["Analista de Seguridad", "Soporte Técnico", "Consultor"],
      logo: "/logos/securenet.png",
    },
    {
      id: "21",
      name: "OceanBlue",
      companies: ["OceanBlue Shipping", "OceanBlue Logistics"],
      roles: ["Operador", "Planificador", "Agente"],
      logo: "/logos/oceanblue.png",
    },
    {
      id: "22",
      name: "EduTech",
      companies: ["EduTech Solutions", "EduTech Labs"],
      roles: [
        "Desarrollador Educativo",
        "Diseñador Instruccional",
        "Consultor",
      ],
      logo: "/logos/edutech.png",
    },
    {
      id: "23",
      name: "GreenLife",
      companies: ["GreenLife Organic", "GreenLife Markets"],
      roles: ["Gerente de Tienda", "Comprador", "Vendedor"],
      logo: "/logos/greenlife.png",
    },
    {
      id: "24",
      name: "FoodExpress",
      companies: ["FoodExpress Delivery", "FoodExpress Kitchens"],
      roles: ["Repartidor", "Cocinero", "Operador"],
      logo: "/logos/foodexpress.png",
    },
    {
      id: "25",
      name: "SmartHome",
      companies: ["SmartHome Devices", "SmartHome Installations"],
      roles: ["Técnico", "Vendedor", "Diseñador"],
      logo: "/logos/smarthome.png",
    },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrganization: Organization = {
      id: (organizations.length + 1).toString(),
      name: organizationName,
      companies: [],
      roles: [],
      logo: logoFile ? URL.createObjectURL(logoFile) : undefined,
    };

    setOrganizations([...organizations, newOrganization]);
    setOrganizationName("");
    setLogoFile(null);
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

        <main className="bg-gradient-to-br from-gray_xxl  to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
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

          <DataTable data={organizations} />
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva organización</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="sm:text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="logo" className="sm:text-right">
                  Logo
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="col-span-1 sm:col-span-3"
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

export default OrganizationsPage;
