// app/dashboard/collections/page.tsx
"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";
import { Toaster } from "sonner";
import { usePendingAccounts } from "@/hooks/pendingAccounts/usePendingAccounts";
import {
  PendingAccount,
  AccountType,
  AccountStatus,
} from "@/services/pendingAccounts/pendingAccounts.service";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import useUserCompany from "@/hooks/auth/useUserCompany";

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

const formatDecimal = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0,00";

  return num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
};

const PendingAccountsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { companyId, selectedCompanyId } = useUserCompany();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { pendingAccounts, loading, error, refetch } = usePendingAccounts({
    search: searchTerm,
    account_type:
      selectedType !== "all" ? (selectedType as AccountType) : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    companyId: selectedCompanyId || companyId,
  });

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
        return <div className="font-medium">${formatDecimal(amount)}</div>;
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
              isOverdue ? "text-red_m font-bold" : ""
            }`}
          >
            ${formatDecimal(balance)}
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
          <div className={`font-medium ${isOverdue ? "text-red_m" : ""}`}>
            {format(dueDate, "dd/MM/yyyy")}
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red_m inline ml-1" />
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
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

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
              <p className="text-sm text-gray-600 mt-1">
                Vista de solo lectura - Consulta de cuentas pendientes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Por Cobrar
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${formatDecimal(stats.totalReceivable)}{" "}
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
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red_m">
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
          </div>

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
              <div className="text-center text-red_m">
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
    </div>
  );
};

export default PendingAccountsPage;
