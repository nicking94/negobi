"use client";

import { useState, useEffect, useMemo } from "react";
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
import useUserCompany from "@/hooks/auth/useUserCompany";
import useGetClients from "@/hooks/clients/useGetClients";
import { SelectSearchable } from "@/components/ui/select-searchable";

// ✅ SCHEMA ACTUALIZADO - Incluye currencyId
const pendingAccountFormSchema = z.object({
  account_type: z.enum(["receivable", "payable"]),
  clientId: z.number().optional(),
  supplierId: z.number().optional(),
  documentId: z.number().optional(),
  amount_due: z.string().min(1, "El monto es requerido"),
  balance_due: z.string().min(1, "El saldo es requerido"),
  currencyId: z.number().min(1, "La moneda es requerida"), // ✅ REQUERIDO
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

// Tipo para la API (con números decimales)
type PendingAccountFormAPI = Omit<
  PendingAccountFormInput,
  "amount_due" | "balance_due"
> & {
  amount_due: number;
  balance_due: number;
  companyId: number;
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

// ✅ Función para formatear números a decimales con coma
const formatDecimal = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0,00";

  return num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false, // No usar separadores de miles
  });
};
// ✅ Función mejorada para convertir string con coma a número
const parseDecimal = (value: string): number => {
  if (!value || value.trim() === "") return 0;

  // Reemplazar coma por punto y eliminar espacios
  const normalizedValue = value.replace(",", ".").replace(/\s/g, "");
  const parsed = parseFloat(normalizedValue);

  // Verificar que es un número válido y no NaN
  return isNaN(parsed) ? 0 : parsed;
};

const PendingAccountsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { companyId, selectedCompanyId } = useUserCompany();
  const { clientsResponse: clients } = useGetClients({
    companyId: selectedCompanyId || companyId,
    itemsPerPage: 1000,
  });

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientPendingBalance, setClientPendingBalance] = useState<number>(0);
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
    companyId: selectedCompanyId || companyId,
  });

  const form = useForm<PendingAccountFormInput>({
    resolver: zodResolver(pendingAccountFormSchema),
    defaultValues: {
      account_type: "receivable",
      clientId: undefined,
      supplierId: undefined,
      documentId: undefined,
      amount_due: "",
      balance_due: "",
      currencyId: 1, // ✅ VALOR POR DEFECTO (1 = USD o la moneda principal)
      due_date: "",
      status: "Outstanding",
      notes: "",
      external_code: "",
    },
    mode: "onChange",
  });

  const clientOptions = useMemo(() => {
    if (!clients || clients.length === 0) {
      return [];
    }

    const filteredClients = clients.filter((client) => {
      const belongsToCompany =
        !client.companyId || client.companyId === companyId;
      return belongsToCompany;
    });

    const options = filteredClients
      .filter((client) => client.id != null)
      .map((client) => ({
        value: client.id!.toString(),
        label: `${client.legal_name || "Cliente sin nombre"}`,
      }));

    return options;
  }, [clients, companyId]);

  // Calcular saldo pendiente del cliente cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClientId) {
      const clientIdNum = parseInt(selectedClientId);
      const clientAccounts = pendingAccounts.filter(
        (account) =>
          account.clientId === clientIdNum &&
          account.account_type === "receivable"
      );

      const totalPendingBalance = clientAccounts.reduce(
        (sum, account) => sum + account.balance_due,
        0
      );

      setClientPendingBalance(totalPendingBalance);

      // ✅ ACTUALIZAR AUTOMÁTICAMENTE EL VALOR EN EL FORMULARIO CON FORMATO DECIMAL
      form.setValue("balance_due", formatDecimal(totalPendingBalance));
    } else {
      setClientPendingBalance(0);
      form.setValue("balance_due", "");
    }
  }, [selectedClientId, pendingAccounts, form]);

  // Efecto para resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isModalOpen) {
      resetForm();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (editingAccount && editingAccount.clientId) {
      const clientIdString = editingAccount.clientId.toString();
      if (selectedClientId !== clientIdString) {
        console.log("🔄 Sincronizando cliente en edición:", clientIdString);
        setSelectedClientId(clientIdString);
      }
    }
  }, [editingAccount, selectedClientId]);

  useEffect(() => {
    // Recargar cuentas cuando se cree, actualice o elimine una
    if (!isModalOpen && form.formState.isSubmitSuccessful) {
      console.log("🔄 Recargando cuentas después de operación...");
      refetch();
    }
  }, [isModalOpen, form.formState.isSubmitSuccessful, refetch]);

  const onSubmit = async (values: PendingAccountFormInput) => {
    try {
      const targetCompanyId = selectedCompanyId || companyId;

      if (!targetCompanyId) {
        toast.error("No se puede crear la cobranza: Empresa no configurada");
        return;
      }

      if (!values.amount_due || parseDecimal(values.amount_due) <= 0) {
        toast.error("El monto debe ser mayor a 0");
        return;
      }

      if (!values.due_date) {
        toast.error("La fecha de vencimiento es requerida");
        return;
      }

      if (values.account_type === "receivable" && !values.clientId) {
        toast.error("El cliente es requerido para cuentas por cobrar");
        return;
      }

      if (!values.currencyId) {
        toast.error("La moneda es requerida");
        return;
      }

      const amountDue = parseDecimal(values.amount_due);
      const balanceDue = parseDecimal(values.balance_due);

      if (isNaN(amountDue) || isNaN(balanceDue)) {
        toast.error("Los montos deben ser números válidos");
        return;
      }

      const apiData: PendingAccountFormAPI = {
        ...values,
        companyId: targetCompanyId,
        amount_due: amountDue,
        balance_due: balanceDue,
      };

      console.log("📤 Datos a enviar a la API:", apiData);
      console.log("🔍 Tipos de datos:", {
        amount_due_type: typeof apiData.amount_due,
        amount_due_value: apiData.amount_due,
        balance_due_type: typeof apiData.balance_due,
        balance_due_value: apiData.balance_due,
        currencyId_type: typeof apiData.currencyId,
        currencyId_value: apiData.currencyId,
      });

      if (editingAccount && editingAccount.id) {
        console.log("🔄 Actualizando cuenta existente...");
        const result = await updatePendingAccount(
          editingAccount.id.toString(),
          apiData
        );
        console.log("✅ Resultado de actualización:", result);
        setIsModalOpen(false);
        toast.success("Cuenta pendiente actualizada exitosamente");
      } else {
        console.log("🆕 Creando nueva cuenta...");
        const result = await createPendingAccount(apiData);
        console.log("✅ Resultado de creación:", result);
        setIsModalOpen(false);
        toast.success("Cuenta pendiente creada exitosamente");
      }
    } catch (error) {
      console.error("❌ Error en onSubmit:", error);
      toast.error("Error al guardar la cuenta pendiente");
    }
  };

  const handleClientChange = (value: string) => {
    console.log("👤 Cliente seleccionado:", value);
    setSelectedClientId(value);

    // ✅ Convertir a número solo si hay un valor, de lo contrario establecer como undefined
    const clientIdNumber = value ? parseInt(value) : undefined;
    form.setValue("clientId", clientIdNumber);

    console.log("📝 Formulario actualizado con clientId:", clientIdNumber);
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
              toast.success("Cuenta pendiente eliminada exitosamente");
            } catch {
              toast.error("Error al eliminar la cuenta pendiente");
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
    console.log("✏️ Editando cuenta:", account);

    // ✅ ESTABLECER EL CLIENTE PRIMERO - Esto es crucial
    const clientIdString = account.clientId?.toString() || "";
    setSelectedClientId(clientIdString);

    setEditingAccount(account);

    // ✅ RESET DEL FORMULARIO CON LOS VALORES CORRECTOS
    form.reset({
      account_type: account.account_type,
      clientId: account.clientId,
      supplierId: account.supplierId,
      documentId: account.documentId,
      amount_due: formatDecimal(account.amount_due),
      balance_due: formatDecimal(account.balance_due),
      currencyId: account.currencyId || 1,
      due_date: account.due_date.split("T")[0],
      status: account.status,
      notes: account.notes || "",
      external_code: account.external_code || "",
    });

    setIsModalOpen(true);
  };
  const resetForm = () => {
    console.log("🔄 Reseteando formulario...");
    form.reset({
      account_type: "receivable",
      clientId: undefined,
      supplierId: undefined,
      documentId: undefined,
      amount_due: "",
      balance_due: "",
      currencyId: 1,
      due_date: "",
      status: "Outstanding",
      notes: "",
      external_code: "",
    });
    setSelectedClientId("");
    setClientPendingBalance(0);
    setEditingAccount(null);
  };

  // ✅ Función para formatear input en tiempo real
  const handleAmountInput = (field: any, value: string) => {
    // Permitir solo números y coma
    const cleanedValue = value.replace(/[^\d,]/g, "");

    // Validar que solo haya una coma
    const commaCount = (cleanedValue.match(/,/g) || []).length;
    if (commaCount > 1) return;

    // Validar que después de la coma solo haya hasta 2 dígitos
    if (cleanedValue.includes(",")) {
      const parts = cleanedValue.split(",");
      if (parts[1].length > 2) return;
    }

    field.onChange(cleanedValue);
  };

  const columns: ColumnDef<PendingAccount>[] = [
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
          <div className="font-medium">
            ${formatDecimal(amount)} {/* ✅ FORMATO DECIMAL */}
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
            ${formatDecimal(balance)} {/* ✅ FORMATO DECIMAL */}
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

  // Calcular estadísticas (CON FORMATO DECIMAL EN LAS TARJETAS)
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
  const formIsValid = form.formState.isValid;

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
                    ${formatDecimal(stats.totalReceivable)}{" "}
                    {/* ✅ FORMATO DECIMAL */}
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
                    ${formatDecimal(stats.totalPayable)}{" "}
                    {/* ✅ FORMATO DECIMAL */}
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
                <span>Nueva Cobranza</span>
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
              noResultsText="No se encontraron cobranzas"
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

      {/* Modal para crear/editar cobranza */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingAccount ? "Editar Cobranza" : "Crear Nueva Cobranza"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Modifica la información de la cobranza"
                : "Completa la información para crear una nueva cobranza"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente *</FormLabel>
                          <SelectSearchable
                            value={selectedClientId}
                            onValueChange={handleClientChange}
                            placeholder="Seleccionar cliente..."
                            options={clientOptions}
                            emptyMessage="No se encontraron clientes."
                            searchPlaceholder="Buscar cliente..."
                            className="w-full"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      name="amount_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto Total *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text" // ✅ Cambiado a text para permitir coma
                              placeholder="0,00"
                              className="w-full"
                              disabled={isSubmitting}
                              onChange={(e) =>
                                handleAmountInput(field, e.target.value)
                              }
                              onBlur={(e) => {
                                // Formatear al perder el foco
                                const value = e.target.value;
                                if (value && !value.includes(",")) {
                                  field.onChange(value + ",00");
                                } else if (value.includes(",")) {
                                  const parts = value.split(",");
                                  if (parts[1].length === 1) {
                                    field.onChange(
                                      parts[0] + "," + parts[1] + "0"
                                    );
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-4">
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
                              onChange={(e) => {
                                field.onChange(e);
                                setTimeout(() => form.trigger("due_date"), 100);
                              }}
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

                    {/* ✅ CAMPO DE SALDO PENDIENTE COMO SOLO LECTURA */}
                    <FormField
                      control={form.control}
                      name="balance_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo Pendiente *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="0,00"
                              className="w-full bg-gray-100 cursor-not-allowed"
                              readOnly
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                          placeholder="Información adicional sobre la cobranza..."
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
                  disabled={isSubmitting || !formIsValid}
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
