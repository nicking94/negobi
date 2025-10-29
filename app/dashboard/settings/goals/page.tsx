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
import { DataTable } from "@/components/ui/dataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useGoals,
  UseGoalsFilters,
  useGoalsForSelect,
} from "@/hooks/goals/useGoals";

import {
  CreateGoalData,
  UpdateGoalData,
  GoalType,
  PeriodType,
  GoalStatus,
  GOAL_TYPES,
  PERIOD_TYPES,
  GOAL_STATUSES,
} from "@/services/goals/goals.service";

// Importar React Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Tipo basado en la API real
type Goal = {
  id: number;
  goal_type: GoalType;
  period_type: PeriodType;
  target_amount: number;
  target_quantity: number;
  start_date: string;
  end_date: string;
  status: GoalStatus;
  companyId?: number;
  userId?: number;
  zoneId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const GoalsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  // Estado para filtros
  const [filters, setFilters] = useState({
    search: "",
    goal_type: "" as GoalType | "",
    status: "" as GoalStatus | "",
    start_date_from: "",
    start_date_to: "",
    end_date_from: "",
    end_date_to: "",
  });
  const cleanFilters = useMemo((): UseGoalsFilters => {
    const clean: UseGoalsFilters = {};

    if (filters.search) clean.search = filters.search;
    if (filters.goal_type) clean.goal_type = filters.goal_type;
    if (filters.status) clean.status = filters.status;
    if (filters.start_date_from)
      clean.start_date_from = filters.start_date_from;
    if (filters.start_date_to) clean.start_date_to = filters.start_date_to;
    if (filters.end_date_from) clean.end_date_from = filters.end_date_from;
    if (filters.end_date_to) clean.end_date_to = filters.end_date_to;

    return clean;
  }, [filters]);

  const {
    goals,
    loading,
    error,
    pagination,
    createGoal,
    updateGoal,
    deleteGoal,
    setPage,
    setItemsPerPage,
  } = useGoals(cleanFilters);

  const { options: goalOptions } = useGoalsForSelect();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState<CreateGoalData>({
    goal_type: GOAL_TYPES.COMPANY,
    period_type: PERIOD_TYPES.MONTHLY,
    target_amount: 0,
    target_quantity: 0,
    start_date: new Date().toISOString(),
    end_date: new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    ).toISOString(),
    status: GOAL_STATUSES.NOT_REACHED,
    companyId: 1, // Esto debería venir del contexto de la empresa
  });

  // Opciones para los selects
  const goalTypes = [
    { value: GOAL_TYPES.COMPANY, label: "Empresa" },
    { value: GOAL_TYPES.SALES_PERSON, label: "Vendedor" },
    { value: GOAL_TYPES.ZONE, label: "Zona" },
    { value: GOAL_TYPES.SUPERVISOR, label: "Supervisor" },
  ];

  const periodTypes = [
    { value: PERIOD_TYPES.MONTHLY, label: "Mensual" },
    { value: PERIOD_TYPES.WEEKLY, label: "Semanal" },
  ];

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: GOAL_STATUSES.NOT_REACHED, label: "No alcanzado" },
    { value: GOAL_STATUSES.REACHED, label: "Alcanzado" },
  ];

  const handleCreateGoal = async () => {
    try {
      const goalData: CreateGoalData = {
        goal_type: formData.goal_type,
        period_type: formData.period_type,
        target_amount: formData.target_amount,
        target_quantity: formData.target_quantity,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        companyId: formData.companyId || 1,

        ...(formData.goal_type === GOAL_TYPES.SALES_PERSON &&
          formData.userId && {
            userId: formData.userId,
          }),
        ...(formData.goal_type === GOAL_TYPES.ZONE &&
          formData.zoneId && {
            zoneId: formData.zoneId,
          }),
        // No enviar external_code si es null o undefined
        ...(formData.external_code && {
          external_code: formData.external_code,
        }),
      };

      const result = await createGoal(goalData);
      if (result) {
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("❌ Error en handleCreateGoal:", error);
      // El toast ya se maneja en el hook
    }
  };

  // Manejar actualización de meta
  const handleEditGoal = async () => {
    if (!selectedGoal) return;

    try {
      const updateData: UpdateGoalData = {
        goal_type: formData.goal_type,
        period_type: formData.period_type,
        target_amount: formData.target_amount,
        target_quantity: formData.target_quantity,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        companyId: formData.companyId,
      };

      const result = await updateGoal(selectedGoal.id.toString(), updateData);
      if (result) {
        setIsEditDialogOpen(false);
        setSelectedGoal(null);
        resetForm();
        toast.success("Meta actualizada exitosamente");
      } else {
        toast.error("Error al actualizar la meta");
      }
    } catch (error) {
      toast.error("Error al actualizar la meta");
    }
  };

  // Manejar eliminación de meta
  const handleDeleteGoal = async (goal: Goal) => {
    try {
      const success = await deleteGoal(goal.id.toString());
      if (success) {
        toast.success("Meta eliminada exitosamente");
      } else {
        toast.error("Error al eliminar la meta");
      }
    } catch (error) {
      toast.error("Error al eliminar la meta");
    }
  };
  const resetForm = () => {
    setFormData({
      goal_type: GOAL_TYPES.COMPANY,
      period_type: PERIOD_TYPES.MONTHLY,
      target_amount: 0,
      target_quantity: 0,
      start_date: new Date().toISOString(),
      end_date: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ).toISOString(),
      status: GOAL_STATUSES.NOT_REACHED,
      companyId: 1,
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
      status: goal.status,
      companyId: goal.companyId,
      userId: goal.userId,
      zoneId: goal.zoneId,
    });
    setIsEditDialogOpen(true);
  };

  // Funciones de formato
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getGoalTypeLabel = (type: GoalType) => {
    return goalTypes.find((t) => t.value === type)?.label || type;
  };

  const getStatusLabel = (status: GoalStatus) => {
    return statusOptions.find((s) => s.value === status)?.label || status;
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GOAL_STATUSES.NOT_REACHED:
        return "bg-yellow-100 text-yellow-800";
      case GOAL_STATUSES.REACHED:
        return "bg-green_xxl text-green_b";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      accessorKey: "period_type",
      header: "Período",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("period_type") === PERIOD_TYPES.MONTHLY
            ? "Mensual"
            : "Semanal"}
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
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as GoalStatus;
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
        const date = row.getValue("start_date") as string;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: "end_date",
      header: "Fecha Fin",
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string;
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

          {/* Filtros */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
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
                  <DropdownMenuContent align="end" className="w-[18rem]">
                    <div className="px-2 py-1.5">
                      <Label htmlFor="type-filter">Tipo de Meta</Label>
                      <Select
                        value={filters.goal_type}
                        onValueChange={(value: GoalType | "") =>
                          handleFilterChange("goal_type", value)
                        }
                      >
                        <SelectTrigger id="type-filter" className="mt-1">
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los tipos</SelectItem>
                          {goalTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="px-2 py-1.5">
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value: GoalStatus | "") =>
                          handleFilterChange("status", value)
                        }
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Meta
            </Button>
          </div>

          {/* Tabla de metas */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <DataTable<Goal, Goal>
            columns={columns}
            data={goals}
            noResultsText="No se encontraron metas"
            page={pagination.page}
            setPage={setPage}
            totalPage={pagination.totalPages}
            total={pagination.total}
            itemsPerPage={pagination.itemsPerPage}
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
                      onValueChange={(value: GoalType) =>
                        setFormData({
                          ...formData,
                          goal_type: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo de meta" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Configuración de Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full">
                      <Label className="text-sm">Tipo de Período</Label>
                      <Select
                        value={formData.period_type}
                        onValueChange={(value: PeriodType) =>
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
                        <DatePicker
                          selected={new Date(formData.start_date)}
                          onChange={(date) =>
                            date &&
                            setFormData({
                              ...formData,
                              start_date: date.toISOString(),
                            })
                          }
                          minDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          className="w-full p-2 border rounded-md text-sm mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Fecha de Fin</Label>
                        <DatePicker
                          selected={new Date(formData.end_date)}
                          onChange={(date) =>
                            date &&
                            setFormData({
                              ...formData,
                              end_date: date.toISOString(),
                            })
                          }
                          dateFormat="dd/MM/yyyy"
                          className="w-full p-2 border rounded-md text-sm mt-1"
                          minDate={new Date(formData.start_date)}
                        />
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
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Creando..." : "Crear Meta"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar meta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                onValueChange={(value: GoalType) =>
                  setFormData({
                    ...formData,
                    goal_type: value,
                  })
                }
              >
                <SelectTrigger id="edit_goal_type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_period_type">Tipo de Período</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: PeriodType) =>
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
                <DatePicker
                  selected={new Date(formData.start_date)}
                  onChange={(date) =>
                    date &&
                    setFormData({
                      ...formData,
                      start_date: date.toISOString(),
                    })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md text-sm"
                  minDate={new Date()}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_end_date">Fecha de Fin</Label>
                <DatePicker
                  selected={new Date(formData.end_date)}
                  onChange={(date) =>
                    date &&
                    setFormData({
                      ...formData,
                      end_date: date.toISOString(),
                    })
                  }
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md text-sm"
                  minDate={new Date(formData.start_date)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: GoalStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit_status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((status) => (
                      <SelectItem
                        key={status.value}
                        value={status.value as GoalStatus}
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
            <Button type="button" onClick={handleEditGoal} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
