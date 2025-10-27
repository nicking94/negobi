"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
} from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { usePendingAccounts } from "@/hooks/pendingAccounts/usePendingAccounts";
import {
  PendingAccount,
  AccountType,
  AccountStatus,
} from "@/services/pendingAccounts/pendingAccounts.service";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const pendingAccountFormSchema = z.object({
  account_type: z.enum(["receivable", "payable"]),
  companyId: z.number().min(1, "La empresa es requerida"),
  clientId: z.number().optional(),
  supplierId: z.number().optional(),
  documentId: z.number().optional(),
  amount_due: z
    .string()
    .min(1, "El monto es requerido")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "El monto debe ser mayor a 0"
    ),
  balance_due: z
    .string()
    .min(1, "El saldo es requerido")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "El saldo no puede ser negativo"
    ),
  currencyId: z.number().optional(),
  due_date: z.string().min(1, "La fecha de vencimiento es requerida"),
  status: z.enum([
    "Outstanding",
    "Partially Paid",
    "Paid",
    "Overdue",
    "Cancelled",
  ]),
  notes: z.string().optional(),
  external_code: z.string().optional(),
});

type PendingAccountFormInput = z.infer<typeof pendingAccountFormSchema>;

// Tipo para la API (con números)
type PendingAccountFormAPI = Omit<
  PendingAccountFormInput,
  "amount_due" | "balance_due"
> & {
  amount_due: number;
  balance_due: number;
};

// Traducciones para los estados
const statusTranslations: Record<AccountStatus, string> = {
  Outstanding: "Pendiente",
  "Partially Paid": "Parcialmente Pagado",
  Paid: "Pagado",
  Overdue: "Vencido",
  Cancelled: "Cancelado",
};

const accountTypeTranslations: Record<AccountType, string> = {
  receivable: "Por Cobrar",
  payable: "Por Pagar",
};

// Colores para los badges de estado
const getStatusBadgeVariant = (status: AccountStatus) => {
  switch (status) {
    case "Paid":
      return "default";
    case "Partially Paid":
      return "secondary";
    case "Overdue":
      return "destructive";
    case "Cancelled":
      return "outline";
    default:
      return "default";
  }
};

const PendingAccountsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PendingAccount | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Usar el hook de cuentas pendientes
  const {
    pendingAccounts,
    loading,
    error,
    createPendingAccount,
    updatePendingAccount,
    deletePendingAccount,
    refetch,
  } = usePendingAccounts({
    search: searchTerm,
    account_type:
      selectedType !== "all" ? (selectedType as AccountType) : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const form = useForm<PendingAccountFormInput>({
    resolver: zodResolver(pendingAccountFormSchema),
    defaultValues: {
      account_type: "receivable",
      companyId: undefined,
      clientId: undefined,
      supplierId: undefined,
      documentId: undefined,
      amount_due: "0",
      balance_due: "0",
      currencyId: undefined,
      due_date: "",
      status: "Outstanding",
      notes: "",
      external_code: "",
    },
  });

  // Efecto para resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isModalOpen) {
      resetForm();
    }
  }, [isModalOpen]);

  const onSubmit = async (values: PendingAccountFormInput) => {
    try {
      // Convertir a tipo API
      const apiData: PendingAccountFormAPI = {
        ...values,
        amount_due: parseFloat(values.amount_due),
        balance_due: parseFloat(values.balance_due),
      };

      if (editingAccount && editingAccount.id) {
        await updatePendingAccount(editingAccount.id.toString(), apiData);
        setIsModalOpen(false);
      } else {
        await createPendingAccount(apiData);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = (account: PendingAccount) => {
    if (!account.id) {
      toast.error("No se puede eliminar: Cuenta sin ID válido");
      return;
    }

    toast.error(
      `¿Eliminar la cuenta "${account.external_code || `ID: ${account.id}`}"?`,
      {
        description: "Esta acción no se puede deshacer.",
        action: {
          label: "Eliminar",
          onClick: async () => {
            try {
              await deletePendingAccount(account.id.toString());
            } catch {
              // El error ya se maneja en el callback del hook
            }
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {
            toast.info("Eliminación cancelada");
          },
        },
      }
    );
  };

  const handleEdit = (account: PendingAccount) => {
    setEditingAccount(account);

    form.reset({
      account_type: account.account_type,
      companyId: account.companyId,
      clientId: account.clientId,
      supplierId: account.supplierId,
      documentId: account.documentId,
      amount_due: account.amount_due.toString(),
      balance_due: account.balance_due.toString(),
      currencyId: account.currencyId,
      due_date: account.due_date.split("T")[0],
      status: account.status,
      notes: account.notes || "",
      external_code: account.external_code || "",
    });

    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      account_type: "receivable",
      companyId: undefined,
      clientId: undefined,
      supplierId: undefined,
      documentId: undefined,
      amount_due: "0",
      balance_due: "0",
      currencyId: undefined,
      due_date: "",
      status: "Outstanding",
      notes: "",
      external_code: "",
    });
    setEditingAccount(null);
  };

  // Columnas para la tabla
  const columns: ColumnDef<PendingAccount>[] = [
    {
      accessorKey: "external_code",
      header: "Código Externo",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("external_code") || `ID: ${row.original.id}`}
        </div>
      ),
    },
    {
      accessorKey: "account_type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("account_type") === "receivable"
              ? "default"
              : "secondary"
          }
        >
          {accountTypeTranslations[row.getValue("account_type") as AccountType]}
        </Badge>
      ),
    },
    {
      accessorKey: "amount_due",
      header: "Monto Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount_due"));
        return (
          <div className="font-medium text-right">
            $
            {amount.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "balance_due",
      header: "Saldo Pendiente",
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue("balance_due"));
        const isOverdue = row.original.status === "Overdue";
        return (
          <div
            className={`font-medium text-right ${
              isOverdue ? "text-red-600 font-bold" : ""
            }`}
          >
            $
            {balance.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: "Fecha Vencimiento",
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue("due_date"));
        const isOverdue = dueDate < new Date() && row.original.balance_due > 0;
        return (
          <div className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
            {format(dueDate, "dd/MM/yyyy")}
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-600 inline ml-1" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge
          variant={getStatusBadgeVariant(
            row.getValue("status") as AccountStatus
          )}
        >
          {statusTranslations[row.getValue("status") as AccountStatus]}
        </Badge>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.getValue("notes") || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const account = row.original;
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
                  onClick={() => handleEdit(account)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(account)}
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

  // Calcular estadísticas
  const stats = {
    totalReceivable: pendingAccounts
      .filter((account) => account.account_type === "receivable")
      .reduce((sum, account) => sum + account.balance_due, 0),
    totalPayable: pendingAccounts
      .filter((account) => account.account_type === "payable")
      .reduce((sum, account) => sum + account.balance_due, 0),
    overdueCount: pendingAccounts.filter((account) => {
      const dueDate = new Date(account.due_date);
      return dueDate < new Date() && account.balance_due > 0;
    }).length,
    totalAccounts: pendingAccounts.length,
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      {/* Contenedor principal sin margen lateral */}
      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray-50 to-gray-100/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Cobranzas
              </h1>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Por Cobrar
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    $
                    {stats.totalReceivable.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Por Pagar</p>
                  <p className="text-2xl font-bold text-orange-600">
                    $
                    {stats.totalPayable.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overdueCount}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Cuentas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalAccounts}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar por código, notas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={loading}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[18rem]">
                  <div className="px-2 py-1.5">
                    <Label htmlFor="type-filter">Tipo de Cuenta</Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                      disabled={loading}
                    >
                      <SelectTrigger id="type-filter" className="mt-1">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="receivable">Por Cobrar</SelectItem>
                        <SelectItem value="payable">Por Pagar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="px-2 py-1.5">
                    <Label htmlFor="status-filter">Estado</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      disabled={loading}
                    >
                      <SelectTrigger id="status-filter" className="mt-1">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Outstanding">Pendiente</SelectItem>
                        <SelectItem value="Partially Paid">
                          Parcialmente Pagado
                        </SelectItem>
                        <SelectItem value="Paid">Pagado</SelectItem>
                        <SelectItem value="Overdue">Vencido</SelectItem>
                        <SelectItem value="Cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="gap-2 w-full sm:w-auto"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Cuenta</span>
              </Button>
            </div>
          </div>

          {/* Tabla de cuentas pendientes */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">
                  Cargando cuentas pendientes...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error al cargar las cuentas pendientes</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <DataTable<PendingAccount, PendingAccount>
              columns={columns}
              data={pendingAccounts || []}
              noResultsText="No se encontraron cuentas pendientes"
              page={1}
              setPage={() => {}}
              totalPage={1}
              total={pendingAccounts.length}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
            />
          )}
        </main>
      </div>

      {/* Modal para crear/editar cuenta pendiente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingAccount
                ? "Editar Cuenta Pendiente"
                : "Crear Nueva Cuenta Pendiente"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Modifica la información de la cuenta pendiente"
                : "Completa la información para crear una nueva cuenta pendiente"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información Básica</h3>

                    <FormField
                      control={form.control}
                      name="account_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cuenta *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo de cuenta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="receivable">
                                Por Cobrar
                              </SelectItem>
                              <SelectItem value="payable">Por Pagar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Empresa *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="1"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto Total *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="balance_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo Pendiente *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Información Adicional</h3>

                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Vencimiento *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Outstanding">
                                Pendiente
                              </SelectItem>
                              <SelectItem value="Partially Paid">
                                Parcialmente Pagado
                              </SelectItem>
                              <SelectItem value="Paid">Pagado</SelectItem>
                              <SelectItem value="Overdue">Vencido</SelectItem>
                              <SelectItem value="Cancelled">
                                Cancelado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="external_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Externo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Código externo de referencia"
                              className="w-full"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Campos opcionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Cliente</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="ID del cliente"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proveedor</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="ID del proveedor"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Documento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="ID del documento relacionado"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currencyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Moneda</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="ID de la moneda"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            className="w-full"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notas */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Información adicional sobre la cuenta pendiente..."
                          className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingAccount
                    ? "Actualizar"
                    : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingAccountsPage;
