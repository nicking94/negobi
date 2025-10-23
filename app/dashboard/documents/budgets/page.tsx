"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Send,
  Search,
  Filter,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBudgets, useCreateBudget } from "@/hooks/documents/useBudgets";
import { useDocumentDetails } from "@/hooks/documents/useDocumentDetails";
import { es } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import { useUserCompany } from "@/hooks/auth/useUserCompany";
import useGetAllCompanies from "@/hooks/companies/useGetAllCompanies";

import {
  Document,
  DocumentStatus,
  CreateDocumentData,
  documentService,
} from "@/services/documents/documents.service";

import useGetClients from "@/hooks/clients/useGetClients";
import { SelectSearchable } from "@/components/ui/select-searchable";

const esLocale = {
  ...es,
  options: {
    weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
    firstWeekContainsDate: 1,
  },
};
registerLocale("es", esLocale);

export type Budget = Document & {
  clientName?: string;
  sellerName?: string;
  validity_days?: number;
};

const BudgetsPage = () => {
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    isLoading: companyLoading,
  } = useUserCompany();

  const { createBudget, loading: creating } = useCreateBudget();
  const { getDocumentDetails } = useDocumentDetails();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isClientBudgetsDialogOpen, setIsClientBudgetsDialogOpen] =
    useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Estados para el formulario de crear/editar
  const [formData, setFormData] = useState({
    document_number: "",
    document_date: new Date().toISOString().split("T")[0],
    clientId: "",
    notes: "",
    status: "draft" as DocumentStatus,
    control_number: "",
    salesperson_external_code: "",
    amount: 0,
    taxable_base: 0,
    tax: 0,
    total_amount: 0,
    due_date: "",
  });

  const { budgets, error, refetch, updateDocument, deleteDocument } =
    useBudgets({
      companyId: companyId || 0,
    });

  const { clientsResponse: clients } = useGetClients({
    companyId: companyId || undefined,
    itemsPerPage: 100,
  });
  const { companies } = useGetAllCompanies();

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (companyId && !companyLoading) {
      refetch();
    }
  }, [companyId, companyLoading]);
  useEffect(() => {
    if (selectedCompanyId && !companyLoading) {
      refetch();
    }
  }, [selectedCompanyId, companyLoading]);

  const companyOptions = useMemo(() => {
    const options = companies
      .filter((company) => company.id != null)
      .map((company) => ({
        value: company.id!.toString(),
        label: `${company.name || "Empresa sin nombre"}`,
      }));

    return options;
  }, [companies]);

  const clientOptions = useMemo(() => {
    const options = clients
      .filter((client) => client.id != null)
      .map((client) => ({
        value: client.id!.toString(),
        label: `${client.legal_name || "Cliente sin nombre"}`,
      }));
    return options;
  }, [clients]);

  // Mapear documentos a formato Budget
  const mappedBudgets: Budget[] = useMemo(() => {
    return budgets.map((doc) => ({
      ...doc,
      clientName: doc.client?.legal_name || "Cliente no especificado",
      sellerName: doc.salesperson_external_code || "Vendedor no especificado",
      validity_days: 30,
    }));
  }, [budgets]);

  const sellers = useMemo(() => {
    const uniqueSellers = Array.from(
      new Set(
        mappedBudgets.map((budget) => budget.sellerName || "").filter(Boolean)
      )
    );
    return uniqueSellers.map((seller, index) => ({
      id: (index + 1).toString(),
      name: seller,
    }));
  }, [mappedBudgets]);

  const clientFilterOptions = useMemo(() => {
    const uniqueClients = Array.from(
      new Set(
        mappedBudgets.map((budget) => budget.clientName || "").filter(Boolean)
      )
    );
    return uniqueClients.map((client, index) => ({
      id: (index + 1).toString(),
      name: client,
    }));
  }, [mappedBudgets]);

  // Obtener presupuestos de un cliente específico
  const getClientBudgets = (clientName: string) => {
    return mappedBudgets.filter((budget) => budget.clientName === clientName);
  };

  // Filtrar presupuestos según los criterios
  const filteredBudgets = useMemo(() => {
    return mappedBudgets.filter((budget) => {
      const matchesSearch =
        (budget.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        budget.document_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (budget.control_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      const matchesSeller =
        sellerFilter === "all" || budget.sellerName === sellerFilter;

      const matchesClient =
        clientFilter === "all" || budget.clientName === clientFilter;

      const matchesStatus =
        statusFilter === "all" || budget.status === statusFilter;

      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (new Date(budget.document_date) >= dateRange.from &&
          new Date(budget.document_date) <= dateRange.to);

      return (
        matchesSearch &&
        matchesSeller &&
        matchesClient &&
        matchesStatus &&
        matchesDateRange
      );
    });
  }, [
    mappedBudgets,
    searchTerm,
    sellerFilter,
    clientFilter,
    statusFilter,
    dateRange,
  ]);

  const handleCreateBudget = () => {
    // Obtener la fecha actual sin problemas de zona horaria
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayFormatted = `${year}-${month}-${day}`;

    setFormData({
      document_number: `BGT-${Date.now()}`,
      document_date: todayFormatted,
      clientId: "",
      notes: "",
      status: "draft",
      control_number: "",
      salesperson_external_code: "",
      amount: 0,
      taxable_base: 0,
      tax: 0,
      total_amount: 0,
      due_date: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      document_number: budget.document_number,
      document_date: budget.document_date.split("T")[0],
      clientId: budget.clientId?.toString() || "",
      notes: budget.notes || "",
      status: budget.status,
      control_number: budget.control_number || "",
      salesperson_external_code: budget.salesperson_external_code || "",
      amount: budget.amount || 0,
      taxable_base: budget.taxable_base || 0,
      tax: budget.tax || 0,
      total_amount: budget.total_amount || 0,
      due_date: budget.due_date ? budget.due_date.split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCompanyChange = (value: string) => {
    const newCompanyId = parseInt(value);
    setSelectedCompanyId(newCompanyId);

    // Recargar los datos con la nueva empresa
    refetch();
  };

  // Función para manejar cambio de cliente
  const handleClientChange = (value: string) => {
    setFormData({
      ...formData,
      clientId: value,
    });
  };

  const handleDeleteBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const handleViewBudget = async (budget: Budget) => {
    try {
      const budgetDetails = await getDocumentDetails(budget.id.toString());
      if (budgetDetails) {
        setSelectedBudget({
          ...budgetDetails,
          clientName: budgetDetails.client?.legal_name,
          sellerName: budgetDetails.salesperson_external_code,
          validity_days: 30,
        });
        setIsViewDialogOpen(true);
      }
    } catch (err) {
      toast.error("Error al cargar los detalles del presupuesto");
    }
  };

  const handleResendBudget = (budget: Budget) => {
    // Lógica para reenviar presupuesto
    toast.success(
      `Presupuesto ${budget.document_number} reenviado exitosamente`
    );
  };

  const handleViewClientBudgets = (client: string) => {
    setSelectedClient(client);
    setIsClientBudgetsDialogOpen(true);
  };

  const handleUpdateStatus = async (
    budgetId: string,
    status: DocumentStatus
  ) => {
    try {
      await updateDocument(budgetId, { status });
      toast.success(
        `Estado del presupuesto actualizado a ${getStatusText(status)}`
      );
      refetch();
    } catch (err) {
      toast.error("Error al actualizar el estado del presupuesto");
    }
  };

  const handleCreateSubmit = async () => {
    // Verificar que tenemos companyId seleccionado
    if (!selectedCompanyId) {
      toast.error("No se puede crear el presupuesto: Empresa no seleccionada");
      return;
    }

    if (!formData.clientId) {
      toast.error("No se puede crear el presupuesto: Cliente no seleccionado");
      return;
    }

    try {
      const budgetData: Omit<CreateDocumentData, "document_type"> = {
        document_number: formData.document_number,
        document_date: new Date(
          formData.document_date + "T00:00:00"
        ).toISOString(),
        companyId: selectedCompanyId,
        clientId: parseInt(formData.clientId),
        notes: formData.notes,
        status: formData.status,
        control_number: formData.control_number || undefined,
        salesperson_external_code:
          formData.salesperson_external_code || undefined,
        amount: formData.amount,
        taxable_base: formData.taxable_base,
        tax: formData.tax,
        total_amount: formData.total_amount,
        due_date: formData.due_date
          ? new Date(formData.due_date + "T00:00:00").toISOString()
          : undefined,
      };

      const validation = documentService.validateDocumentData({
        ...budgetData,
        document_type: "quote",
      });

      if (!validation.isValid) {
        console.error("❌ Validación falló:", validation.errors);
        toast.error(`Errores de validación: ${validation.errors.join(", ")}`);
        return;
      }
      const result = await createBudget(budgetData);

      if (result) {
        toast.success("Presupuesto creado exitosamente");
        setIsCreateDialogOpen(false);
        refetch();
      } else {
        console.error("❌ createBudget retornó null/undefined");
        toast.error("Error al crear el presupuesto: resultado vacío");
      }
    } catch (err) {
      console.error("🚨 Error en handleCreateSubmit:", err);
      toast.error(
        err instanceof Error
          ? `Error al crear presupuesto: ${err.message}`
          : "Error desconocido al crear presupuesto"
      );
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedBudget) return;

    try {
      const updates = {
        document_number: formData.document_number,
        document_date: new Date(formData.document_date).toISOString(),
        clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
        notes: formData.notes,
        status: formData.status,
        control_number: formData.control_number || undefined,
        salesperson_external_code:
          formData.salesperson_external_code || undefined,
        amount: formData.amount,
        taxable_base: formData.taxable_base,
        tax: formData.tax,
        total_amount: formData.total_amount,
        due_date: formData.due_date
          ? new Date(formData.due_date).toISOString()
          : undefined,
      };

      const result = await updateDocument(
        selectedBudget.id.toString(),
        updates
      );
      if (result) {
        toast.success("Presupuesto actualizado exitosamente");
        setIsEditDialogOpen(false);
        refetch();
      }
    } catch (err) {
      toast.error("Error al actualizar el presupuesto");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBudget) return;

    try {
      const success = await deleteDocument(selectedBudget.id.toString());
      if (success) {
        toast.success("Presupuesto eliminado exitosamente");
        setIsDeleteDialogOpen(false);
        refetch();
      }
    } catch (err) {
      toast.error("Error al eliminar el presupuesto");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy hh:mm a");
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green_xxl text-green_b",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red_xxl text-red_b",
      closed: "bg-purple-100 text-purple-800",
    };

    const statusText = {
      draft: "Borrador",
      pending: "Pendiente",
      approved: "Aprobado",
      completed: "Completado",
      cancelled: "Cancelado",
      closed: "Cerrado",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getStatusText = (status: string) => {
    const statusText = {
      draft: "Borrador",
      pending: "Pendiente",
      approved: "Aprobado",
      completed: "Completado",
      cancelled: "Cancelado",
      closed: "Cerrado",
    };
    return statusText[status as keyof typeof statusText] || status;
  };

  const columns: ColumnDef<Budget>[] = [
    {
      accessorKey: "clientName",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("clientName")}</div>
          <div className="text-xs text-gray_m">{row.original.sellerName}</div>
        </div>
      ),
    },
    {
      accessorKey: "document_number",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("document_number")}</div>
      ),
    },
    {
      accessorKey: "control_number",
      header: "Número de Control",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.control_number || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "document_date",
      header: "Emitido",
      cell: ({ row }) => {
        const date = row.getValue("document_date") as string;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total_amount") || "0");
        return <div className="font-medium">{formatCurrency(total)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return getStatusBadge(status);
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const budget = row.original;
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
                  onClick={() => handleViewBudget(budget)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditBudget(budget)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleViewClientBudgets(budget.clientName || "")
                  }
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver Presupuestos del Cliente</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleResendBudget(budget)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Reenviar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteBudget(budget)}
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

  if (error) {
    toast.error(error);
  }

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
              Presupuestos
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, número o control..."
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
                  <DropdownMenuContent align="end" className="w-[18rem]">
                    <div className="px-2 py-1.5">
                      <Label htmlFor="seller-filter">Vendedor</Label>
                      <Select
                        value={sellerFilter}
                        onValueChange={setSellerFilter}
                      >
                        <SelectTrigger id="seller-filter" className="mt-1">
                          <SelectValue placeholder="Todos los vendedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los vendedores
                          </SelectItem>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.id} value={seller.name}>
                              {seller.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="client-filter">Cliente</Label>
                      <Select
                        value={clientFilter}
                        onValueChange={setClientFilter}
                      >
                        <SelectTrigger id="client-filter" className="mt-1">
                          <SelectValue placeholder="Todos los clientes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los clientes
                          </SelectItem>
                          {clientFilterOptions.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

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
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="closed">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1.5">
                      <Label htmlFor="date-range">Período</Label>
                      <div className="mt-1">
                        <DatePicker
                          selected={dateRange?.from}
                          onChange={(dates: [Date | null, Date | null]) => {
                            const [start, end] = dates;
                            setDateRange({
                              from: start || undefined,
                              to: end || undefined,
                            });
                          }}
                          startDate={dateRange?.from}
                          endDate={dateRange?.to}
                          selectsRange
                          isClearable
                          placeholderText="Seleccionar rango de fechas"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          dateFormat="dd/MM/yyyy"
                          locale="es"
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={handleCreateBudget}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Presupuesto</span>
            </Button>
          </div>

          <DataTable<Budget, Budget>
            columns={columns}
            data={filteredBudgets}
            noResultsText="No se encontraron presupuestos"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredBudgets.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      {/* Modal de detalles del presupuesto */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Detalle de Presupuesto {selectedBudget?.document_number}
            </DialogTitle>
            <DialogDescription>
              Información completa del presupuesto seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedBudget && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between border-b gap-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Información del Cliente
                  </h3>
                  <p className="text-sm">{selectedBudget.clientName}</p>
                  <p className="text-sm text-gray_m">
                    {selectedBudget.client?.tax_id || "N/A"}{" "}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información de Venta</h3>
                  <p className="text-sm">
                    <span className="font-medium">Vendedor:</span>{" "}
                    {selectedBudget.sellerName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Estado:</span>{" "}
                    {getStatusBadge(selectedBudget.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Número de Documento</h3>
                  <p className="text-sm">{selectedBudget.document_number}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Número de Control</h3>
                  <p className="text-sm">
                    {selectedBudget.control_number || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Referencia Externa</h3>
                  <p className="text-sm">
                    {selectedBudget.external_reference || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Emisión</h3>
                  <p className="text-sm">
                    {formatDate(selectedBudget.document_date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fecha de Vencimiento</h3>
                  <p className="text-sm">
                    {selectedBudget.due_date
                      ? formatDate(selectedBudget.due_date)
                      : "No especificada"}
                  </p>
                </div>
              </div>

              {selectedBudget.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <div className="border rounded-md p-4">
                    <p className="text-sm">{selectedBudget.notes}</p>
                  </div>
                </div>
              )}

              {selectedBudget.observations &&
                selectedBudget.observations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Observaciones</h3>
                    <div className="border rounded-md p-4">
                      {selectedBudget.observations.map((obs, index) => (
                        <div key={index} className="text-sm mb-2 last:mb-0">
                          <span className="font-medium">{obs.campo}:</span>{" "}
                          {obs.valor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Base Imponible:</span>
                    <span>
                      {formatCurrency(selectedBudget.taxable_base || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">IVA:</span>
                    <span>{formatCurrency(selectedBudget.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Descuentos:</span>
                    <span>
                      {formatCurrency(
                        (selectedBudget.discount_1 || 0) +
                          (selectedBudget.discount_2 || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedBudget.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Select
                  value={selectedBudget.status}
                  onValueChange={(value: DocumentStatus) =>
                    handleUpdateStatus(selectedBudget.id.toString(), value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver presupuestos del cliente */}
      <Dialog
        open={isClientBudgetsDialogOpen}
        onOpenChange={setIsClientBudgetsDialogOpen}
      >
        <DialogContent className="w-full bg-white sm:max-w-[800px] md:max-w-[75vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Presupuestos de {selectedClient}
            </DialogTitle>
            <DialogDescription>
              Lista de presupuestos del cliente seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-green_m">
                  <thead>
                    <tr className="bg-green_m text-white">
                      <th className="px-4 py-2 text-left">Número</th>
                      <th className="px-4 py-2 text-left">Control</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClientBudgets(selectedClient).map((budget) => (
                      <tr key={budget.id}>
                        <td className="border border-gray_l px-4 py-2">
                          {budget.document_number}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {budget.control_number || "N/A"}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatDate(budget.document_date)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {formatCurrency(budget.total_amount || 0)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          {getStatusBadge(budget.status)}
                        </td>
                        <td className="border border-gray_l px-4 py-2">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBudget(budget)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendBudget(budget)}
                              className="flex items-center gap-1"
                            >
                              <Send className="h-4 w-4" />
                              <span>Reenviar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClientBudgetsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para crear presupuesto - ACTUALIZADO CON SELECTSEARCHABLE */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-full bg-gray_xxl sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Crear Nuevo Presupuesto
            </DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo presupuesto
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_number">Número de Documento</Label>
                <Input
                  id="document_number"
                  value={formData.document_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_number: e.target.value,
                    })
                  }
                  placeholder="Ej: BGT-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_date">Fecha de Emisión</Label>
                <div className="w-full">
                  <DatePicker
                    selected={
                      formData.document_date
                        ? new Date(formData.document_date + "T00:00:00")
                        : new Date()
                    }
                    onChange={(date: Date | null) => {
                      if (date) {
                        const utcDate = new Date(
                          Date.UTC(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          )
                        );
                        setFormData({
                          ...formData,
                          document_date: utcDate.toISOString().split("T")[0],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          document_date: "",
                        });
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholderText="Seleccionar fecha"
                    showPopperArrow={false}
                    wrapperClassName="w-full"
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className=" space-y-2">
                <Label htmlFor="company-select">Empresa *</Label>
                <SelectSearchable
                  value={selectedCompanyId?.toString() || ""}
                  onValueChange={handleCompanyChange}
                  placeholder="Seleccionar empresa..."
                  options={companyOptions}
                  emptyMessage="No se encontraron empresas."
                  searchPlaceholder="Buscar empresa..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2 w-full">
                {" "}
                {/* Añade w-full aquí también */}
                <Label htmlFor="client-select">Cliente *</Label>
                <SelectSearchable
                  value={formData.clientId}
                  onValueChange={handleClientChange}
                  placeholder="Seleccionar cliente..."
                  options={clientOptions}
                  emptyMessage="No se encontraron clientes."
                  searchPlaceholder="Buscar..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="control_number">Número de Control</Label>
                <Input
                  id="control_number"
                  value={formData.control_number}
                  onChange={(e) =>
                    setFormData({ ...formData, control_number: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesperson_external_code">
                  Código de Vendedor
                </Label>
                <Input
                  id="salesperson_external_code"
                  value={formData.salesperson_external_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salesperson_external_code: e.target.value,
                    })
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: DocumentStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxable_base">Base Imponible</Label>
                <Input
                  id="taxable_base"
                  type="number"
                  value={formData.taxable_base}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxable_base: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">IVA</Label>
                <Input
                  id="tax"
                  type="number"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de Vencimiento</Label>
              <DatePicker
                selected={
                  formData.due_date ? new Date(formData.due_date) : null
                }
                onChange={(date: Date | null) =>
                  setFormData({
                    ...formData,
                    due_date: date ? date.toISOString().split("T")[0] : "",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholderText="Seleccionar fecha"
                showPopperArrow={false}
                isClearable
                wrapperClassName="w-full"
                dateFormat="dd/MM/yyyy"
                locale="es"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notas adicionales..."
                rows={3}
                className="bg-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubmit}
              disabled={creating || !formData.clientId}
            >
              {creating ? "Creando..." : "Crear Presupuesto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar presupuesto - ACTUALIZADO CON SELECTSEARCHABLE */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Editar Presupuesto {selectedBudget?.document_number}
            </DialogTitle>
            <DialogDescription>
              Modifique la información del presupuesto seleccionado
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_document_number">
                  Número de Documento
                </Label>
                <Input
                  id="edit_document_number"
                  value={formData.document_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_document_date">Fecha de Emisión</Label>
                <DatePicker
                  selected={
                    formData.document_date
                      ? new Date(formData.document_date + "T00:00:00")
                      : new Date()
                  }
                  onChange={(date: Date | null) =>
                    setFormData({
                      ...formData,
                      document_date: date
                        ? date.toISOString().split("T")[0]
                        : "",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="Seleccionar fecha"
                  showPopperArrow={false}
                  wrapperClassName="w-full"
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                />
              </div>
            </div>
            <div className=" space-y-2 w-full">
              {" "}
              <Label htmlFor="company-select">Empresa *</Label>
              <SelectSearchable
                value={selectedCompanyId?.toString() || ""}
                onValueChange={handleCompanyChange}
                placeholder="Seleccionar empresa..."
                options={companyOptions}
                emptyMessage="No se encontraron empresas."
                searchPlaceholder="Buscar empresa..."
                className="w-full"
              />
            </div>
            {/* SELECTOR DE CLIENTES CON SELECTSEARCHABLE PARA EDITAR */}
            <div className="space-y-2">
              <Label htmlFor="edit-client-select">Cliente *</Label>
              <SelectSearchable
                value={formData.clientId}
                onValueChange={handleClientChange}
                placeholder="Seleccionar cliente..."
                options={clientOptions}
                emptyMessage="No se encontraron clientes."
                searchPlaceholder="Buscar cliente por nombre, RIF o email..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_control_number">Número de Control</Label>
                <Input
                  id="edit_control_number"
                  value={formData.control_number}
                  onChange={(e) =>
                    setFormData({ ...formData, control_number: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_salesperson_external_code">
                  Código de Vendedor
                </Label>
                <Input
                  id="edit_salesperson_external_code"
                  value={formData.salesperson_external_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salesperson_external_code: e.target.value,
                    })
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: DocumentStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_amount">Monto</Label>
                <Input
                  id="edit_amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_taxable_base">Base Imponible</Label>
                <Input
                  id="edit_taxable_base"
                  type="number"
                  value={formData.taxable_base}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxable_base: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_tax">IVA</Label>
                <Input
                  id="edit_tax"
                  type="number"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_total_amount">Total</Label>
              <Input
                id="edit_total_amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_due_date">Fecha de Vencimiento</Label>
              <DatePicker
                selected={
                  formData.due_date ? new Date(formData.due_date) : null
                }
                onChange={(date: Date | null) =>
                  setFormData({
                    ...formData,
                    due_date: date ? date.toISOString().split("T")[0] : "",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholderText="Seleccionar fecha"
                showPopperArrow={false}
                isClearable
                wrapperClassName="w-full"
                dateFormat="dd/MM/yyyy"
                locale="es"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notas</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notas adicionales..."
                rows={3}
              />
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
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={!formData.clientId}
            >
              Actualizar Presupuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para eliminar presupuesto */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl text-red-600">
              Eliminar Presupuesto
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el presupuesto{" "}
              {selectedBudget?.document_number}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Cliente: {selectedBudget?.clientName}
            </p>
            <p className="text-sm text-gray-600">
              Total:{" "}
              {selectedBudget
                ? formatCurrency(selectedBudget.total_amount || 0)
                : "0.00"}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
            >
              Eliminar Presupuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetsPage;
