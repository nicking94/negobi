"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Search,
  Filter,
  Calendar,
  Building,
  DollarSign,
  Hash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/dataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Goal = {
  id: string;
  goal_type: "company" | "sales_person" | "zone" | "supervisor";
  period_type: "monthly" | "weekly";
  target_amount: number;
  target_quantity: number;
  start_date: Date;
  end_date: Date;
  status: "not_reached" | "reached" | "exceeded";
  assigned_to?: string;
  current_amount?: number;
  current_quantity?: number;
  progress?: number;
};

const GoalsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Datos de ejemplo
  useEffect(() => {
    setGoals([
      {
        id: "1",
        goal_type: "company",
        period_type: "monthly",
        target_amount: 100000,
        target_quantity: 500,
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-12-31"),
        status: "reached",
        current_amount: 105000,
        current_quantity: 520,
        progress: 105,
      },
      {
        id: "2",
        goal_type: "sales_person",
        period_type: "weekly",
        target_amount: 5000,
        target_quantity: 25,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-07"),
        status: "not_reached",
        assigned_to: "Juan Pérez",
        current_amount: 3500,
        current_quantity: 18,
        progress: 70,
      },
      {
        id: "3",
        goal_type: "zone",
        period_type: "monthly",
        target_amount: 50000,
        target_quantity: 250,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "exceeded",
        assigned_to: "Zona Norte",
        current_amount: 55000,
        current_quantity: 280,
        progress: 110,
      },
      {
        id: "4",
        goal_type: "supervisor",
        period_type: "monthly",
        target_amount: 75000,
        target_quantity: 375,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "not_reached",
        assigned_to: "María González",
        current_amount: 45000,
        current_quantity: 200,
        progress: 60,
      },
      {
        id: "5",
        goal_type: "sales_person",
        period_type: "monthly",
        target_amount: 8000,
        target_quantity: 40,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "reached",
        assigned_to: "Carlos Rodríguez",
        current_amount: 8200,
        current_quantity: 42,
        progress: 102,
      },
      {
        id: "6",
        goal_type: "zone",
        period_type: "weekly",
        target_amount: 15000,
        target_quantity: 75,
        start_date: new Date("2024-09-08"),
        end_date: new Date("2024-09-14"),
        status: "not_reached",
        assigned_to: "Zona Sur",
        current_amount: 10000,
        current_quantity: 50,
        progress: 67,
      },
      {
        id: "7",
        goal_type: "supervisor",
        period_type: "monthly",
        target_amount: 60000,
        target_quantity: 300,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "exceeded",
        assigned_to: "Ana Martínez",
        current_amount: 65000,
        current_quantity: 320,
        progress: 108,
      },
      {
        id: "8",
        goal_type: "company",
        period_type: "weekly",
        target_amount: 25000,
        target_quantity: 125,
        start_date: new Date("2024-09-08"),
        end_date: new Date("2024-09-14"),
        status: "not_reached",
        current_amount: 18000,
        current_quantity: 90,
        progress: 72,
      },
      {
        id: "9",
        goal_type: "sales_person",
        period_type: "monthly",
        target_amount: 12000,
        target_quantity: 60,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "reached",
        assigned_to: "Luis Hernández",
        current_amount: 12500,
        current_quantity: 63,
        progress: 104,
      },
      {
        id: "10",
        goal_type: "zone",
        period_type: "monthly",
        target_amount: 40000,
        target_quantity: 200,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-09-30"),
        status: "exceeded",
        assigned_to: "Zona Este",
        current_amount: 45000,
        current_quantity: 225,
        progress: 112,
      },
    ]);
  }, []);

  // Formulario para crear/editar metas
  const [formData, setFormData] = useState({
    goal_type: "company" as Goal["goal_type"],
    period_type: "monthly" as Goal["period_type"],
    target_amount: 0,
    target_quantity: 0,
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    assigned_to: "",
  });

  // Opciones para los selects
  const goalTypes = [
    { value: "company", label: "Empresa" },
    { value: "sales_person", label: "Vendedor" },
    { value: "zone", label: "Zona" },
    { value: "supervisor", label: "Supervisor" },
  ];

  const periodTypes = [
    { value: "monthly", label: "Mensual" },
    { value: "weekly", label: "Semanal" },
  ];

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "not_reached", label: "No alcanzado" },
    { value: "reached", label: "Alcanzado" },
    { value: "exceeded", label: "Excedido" },
  ];

  // Lista de vendedores, zonas y supervisores (datos de ejemplo)
  const salesPeople = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María González" },
    { id: "3", name: "Carlos Rodríguez" },
    { id: "4", name: "Luis Hernández" },
  ];

  const zones = [
    { id: "1", name: "Zona Norte" },
    { id: "2", name: "Zona Sur" },
    { id: "3", name: "Zona Este" },
    { id: "4", name: "Zona Oeste" },
  ];

  const supervisors = [
    { id: "1", name: "Ana Martínez" },
    { id: "2", name: "Luis Hernández" },
  ];

  // Filtrar metas según los criterios
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.goal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === "";

      const matchesType = typeFilter === "all" || goal.goal_type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || goal.status === statusFilter;

      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (goal.start_date >= dateRange.from && goal.end_date <= dateRange.to);

      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    });
  }, [goals, searchTerm, typeFilter, statusFilter, dateRange]);

  // Calcular paginación
  const totalPage = Math.ceil(filteredGoals.length / itemsPerPage);
  const paginatedGoals = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredGoals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGoals, page, itemsPerPage]);

  const handleCreateGoal = () => {
    const newGoal: Goal = {
      id: (goals.length + 1).toString(),
      ...formData,
      status: "not_reached",
      current_amount: 0,
      current_quantity: 0,
      progress: 0,
    };

    setGoals([...goals, newGoal]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("Meta creada exitosamente");
  };

  const handleEditGoal = () => {
    if (!selectedGoal) return;

    const updatedGoals = goals.map((goal) =>
      goal.id === selectedGoal.id ? { ...goal, ...formData } : goal
    );

    setGoals(updatedGoals);
    setIsEditDialogOpen(false);
    setSelectedGoal(null);
    resetForm();
    toast.success("Meta actualizada exitosamente");
  };

  const handleDeleteGoal = (goal: Goal) => {
    const updatedGoals = goals.filter((g) => g.id !== goal.id);
    setGoals(updatedGoals);
    toast.success("Meta eliminada exitosamente");
  };

  const resetForm = () => {
    setFormData({
      goal_type: "company",
      period_type: "monthly",
      target_amount: 0,
      target_quantity: 0,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      assigned_to: "",
    });
  };

  const openEditDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      goal_type: goal.goal_type,
      period_type: goal.period_type,
      target_amount: goal.target_amount,
      target_quantity: goal.target_quantity,
      start_date: goal.start_date,
      end_date: goal.end_date,
      assigned_to: goal.assigned_to || "",
    });
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  const getAssignedOptions = () => {
    switch (formData.goal_type) {
      case "sales_person":
        return salesPeople;
      case "zone":
        return zones;
      case "supervisor":
        return supervisors;
      default:
        return [];
    }
  };

  const getGoalTypeLabel = (type: string) => {
    return goalTypes.find((t) => t.value === type)?.label || type;
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.label || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_reached":
        return "bg-yellow-100 text-yellow-800";
      case "reached":
        return "bg-green_xxl text-green_b";
      case "exceeded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Columnas para la DataTable
  const columns: ColumnDef<Goal>[] = [
    {
      accessorKey: "goal_type",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="font-medium">
          {getGoalTypeLabel(row.getValue("goal_type"))}
        </div>
      ),
    },
    {
      accessorKey: "assigned_to",
      header: "Asignado a",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.assigned_to || "Empresa"}
        </div>
      ),
    },
    {
      accessorKey: "period_type",
      header: "Período",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("period_type") === "monthly" ? "Mensual" : "Semanal"}
        </div>
      ),
    },
    {
      accessorKey: "target_amount",
      header: "Meta Monto",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue("target_amount"))}
        </div>
      ),
    },
    {
      accessorKey: "target_quantity",
      header: "Meta Cantidad",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("target_quantity")}</div>
      ),
    },
    {
      id: "progress",
      header: "Progreso",
      cell: ({ row }) => {
        const goal = row.original;
        return (
          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  (goal.progress || 0) >= 100
                    ? "bg-green_b"
                    : (goal.progress || 0) >= 70
                    ? "bg-yellow-500"
                    : "bg-red_m"
                }`}
                style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs">{goal.progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "Fecha Inicio",
      cell: ({ row }) => {
        const date = row.getValue("start_date") as Date;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: "end_date",
      header: "Fecha Fin",
      cell: ({ row }) => {
        const date = row.getValue("end_date") as Date;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const goal = row.original;
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
                  onClick={() => openEditDialog(goal)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteGoal(goal)}
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
              Metas
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por tipo o asignado..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtrar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <Label htmlFor="type-filter">Tipo de Meta</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger id="type-filter" className="mt-1">
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          {goalTypes.map((type) => (
                            <SelectItem
                              key={type.value || ""}
                              value={type.value || ""}
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="px-2 py-1.5">
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger id="status-filter" className="mt-1">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="px-2 py-1.5">
                      <Label htmlFor="date-range">Período</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                  {format(dateRange.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(dateRange.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span>Seleccionar rango de fechas</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Meta
            </Button>
          </div>

          <DataTable<Goal, Goal>
            columns={columns}
            data={paginatedGoals}
            noResultsText="No se encontraron metas"
            page={page}
            setPage={setPage}
            totalPage={totalPage}
            total={filteredGoals.length}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Sidebar ilustrativo */}
            <div className="hidden sm:block w-1/3 bg-gradient-to-b from-green_xxl/10 to-gray_xxl/5 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green_xxl/20 rounded-full mb-4">
                  <Target className="h-8 w-8 text-green_b" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Crear Nueva Meta</h3>
                <p className="text-sm text-gray_m">
                  Establece objetivos claros y medibles para tu equipo de ventas
                </p>
                <div className="mt-6 space-y-3 text-left w-full">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green_xxl/20 rounded mt-0.5">
                      <Hash className="h-3 w-3 text-green_b" />
                    </div>
                    <span className="text-sm">Define cantidades objetivos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green_xxl/20 rounded mt-0.5">
                      <DollarSign className="h-3 w-3 text-green_b" />
                    </div>
                    <span className="text-sm">Establece montos metas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green_xxl/20 rounded mt-0.5">
                      <Calendar className="h-3 w-3 text-green_b" />
                    </div>
                    <span className="text-sm">
                      Configura períodos específicos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="flex-1 p-6">
              <DialogHeader className="text-left pb-4">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Crear Nueva Meta
                </DialogTitle>
                <DialogDescription>
                  Complete la información para establecer una nueva meta
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <Card className="bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Tipo de Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.goal_type}
                      onValueChange={(value: Goal["goal_type"]) =>
                        setFormData({
                          ...formData,
                          goal_type: value,
                          assigned_to: "",
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo de meta" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => {
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {formData.goal_type !== "company" && (
                  <Card className="bg-gray-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {formData.goal_type === "sales_person"
                          ? "Vendedor Asignado"
                          : formData.goal_type === "zone"
                          ? "Zona Asignada"
                          : "Supervisor Asignado"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) =>
                          setFormData({ ...formData, assigned_to: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Seleccionar ${
                              formData.goal_type === "sales_person"
                                ? "vendedor"
                                : formData.goal_type === "zone"
                                ? "zona"
                                : "supervisor"
                            }`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {getAssignedOptions().map((option) => (
                            <SelectItem key={option.id} value={option.name}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Configuración de Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Tipo de Período</Label>
                      <Select
                        value={formData.period_type}
                        onValueChange={(value: Goal["period_type"]) =>
                          setFormData({ ...formData, period_type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                          {periodTypes.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Fecha de Inicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.start_date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.start_date ? (
                                format(formData.start_date, "dd/MM/yyyy")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.start_date}
                              onSelect={(date) =>
                                date &&
                                setFormData({ ...formData, start_date: date })
                              }
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label className="text-sm">Fecha de Fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.end_date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.end_date ? (
                                format(formData.end_date, "dd/MM/yyyy")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.end_date}
                              onSelect={(date) =>
                                date &&
                                setFormData({ ...formData, end_date: date })
                              }
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Objetivos de la Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Monto Objetivo (VES)
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray_m">
                          Bs.
                        </span>
                        <Input
                          type="number"
                          value={formData.target_amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              target_amount: Number(e.target.value),
                            })
                          }
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        Cantidad Objetivo (Unidades)
                      </Label>
                      <Input
                        type="number"
                        value={formData.target_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            target_quantity: Number(e.target.value),
                          })
                        }
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="pt-6 gap-2 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateGoal}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Meta
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar meta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Editar Meta
            </DialogTitle>
            <DialogDescription>
              Modifique la información de la meta
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_goal_type">Tipo de Meta</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value: Goal["goal_type"]) =>
                  setFormData({
                    ...formData,
                    goal_type: value,
                    assigned_to: "",
                  })
                }
              >
                <SelectTrigger id="edit_goal_type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value || ""} value={type.value || ""}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.goal_type !== "company" && (
              <div className="grid gap-2">
                <Label htmlFor="edit_assigned_to">
                  {formData.goal_type === "sales_person"
                    ? "Vendedor"
                    : formData.goal_type === "zone"
                    ? "Zona"
                    : "Supervisor"}
                </Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assigned_to: value })
                  }
                >
                  <SelectTrigger id="edit_assigned_to">
                    <SelectValue
                      placeholder={`Seleccionar ${
                        formData.goal_type === "sales_person"
                          ? "vendedor"
                          : formData.goal_type === "zone"
                          ? "zona"
                          : "supervisor"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getAssignedOptions().map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit_period_type">Tipo de Período</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: Goal["period_type"]) =>
                  setFormData({ ...formData, period_type: value })
                }
              >
                <SelectTrigger id="edit_period_type">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {periodTypes.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_target_amount">Monto Objetivo</Label>
                <Input
                  id="edit_target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_amount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_target_quantity">Cantidad Objetivo</Label>
                <Input
                  id="edit_target_quantity"
                  type="number"
                  value={formData.target_quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_start_date">Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "dd/MM/yyyy")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, start_date: date })
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_end_date">Fecha de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "dd/MM/yyyy")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, end_date: date })
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditGoal}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
