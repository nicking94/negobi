"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  BadgeCheck,
  XCircle,
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
import { useSidebar } from "@/context/SidebarContext";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { DataTable } from "@/components/ui/dataTable";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import useGetPaymentTerms from "@/hooks/paymentTerms/useGetPaymentTerms";
import { useCreatePaymentTerm } from "@/hooks/paymentTerms/useCreatePaymentTerm";
import { useDeletePaymentTerms } from "@/hooks/paymentTerms/useDeletePaymentTerms";
import { usePatchPaymentTerms } from "@/hooks/paymentTerms/usePatchPaymentTerms";
import { PaymentTermType } from "@/types";

const paymentTermSchema = z.object({
  term_name: z.string().min(1, "El nombre es requerido"),
  term_description: z.string().optional(),
  number_of_days: z.number().min(0, "Los días deben ser un número positivo"),
});

type PaymentTermFormValues = z.infer<typeof paymentTermSchema>;

const PaymentTermsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [selectedPaymentTerm, setSelectedPaymentTerm] =
    useState<PaymentTermType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paymentTermToDelete, setPaymentTermToDelete] =
    useState<PaymentTermType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    paymentTerms,
    totalPage: totalPages,
    total: totalItems,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    setSearch,
    statusFilter,
    setStatusFilter,
    error,
    refetch,
  } = useGetPaymentTerms();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearch, setPage]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, setPage]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const {
    createPaymentTerm: createPaymentTermAction,
    loading: isCreateLoading,
  } = useCreatePaymentTerm({
    onSuccess: () => {
      toast.success("Término de pago creado exitosamente");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el término de pago");
    },
    refetch,
  });

  const {
    updatePaymentTerm: updatePaymentTermAction,
    loading: isUpdateLoading,
  } = usePatchPaymentTerms({
    onSuccess: () => {
      toast.success("Término de pago actualizado exitosamente");
      setIsEditDialogOpen(false);
      setSelectedPaymentTerm(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el término de pago");
    },
    refetch,
  });

  const {
    deletePaymentTerm: deletePaymentTermAction,
    loading: isDeleteLoading,
  } = useDeletePaymentTerms({
    onSuccess: () => {
      toast.success("Término de pago eliminado exitosamente");
      setDeleteConfirmOpen(false);
      setPaymentTermToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el término de pago");
    },
    refetch,
  });

  const form = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: {
      term_name: "",
      term_description: "",
      number_of_days: 0,
    },
  });

  const onSubmit = async (data: PaymentTermFormValues) => {
    try {
      const formData = {
        ...data,
        term_description: data.term_description || "",
      };

      if (selectedPaymentTerm) {
        await updatePaymentTermAction({
          id: selectedPaymentTerm.id.toString(),
          data: {
            ...formData,
            is_active: selectedPaymentTerm.is_active,
          },
        });
      } else {
        await createPaymentTermAction({
          ...formData,
          is_active: true,
        });
      }
    } catch (error) {
      console.error("Error en onSubmit:", error);
    }
  };

  const handleEditPaymentTerm = (paymentTerm: PaymentTermType) => {
    setSelectedPaymentTerm(paymentTerm);
    form.reset({
      term_name: paymentTerm.term_name,
      term_description: paymentTerm.term_description || "",
      number_of_days: paymentTerm.number_of_days,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedPaymentTerm(null);
    form.reset({
      term_name: "",
      term_description: "",
      number_of_days: 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteClick = (paymentTerm: PaymentTermType) => {
    setPaymentTermToDelete(paymentTerm);
    setDeleteConfirmOpen(true);
  };

  const handleDeletePaymentTerm = async () => {
    if (!paymentTermToDelete?.id) {
      toast.error("No se pudo identificar el término de pago a eliminar");
      return;
    }

    try {
      await deletePaymentTermAction(paymentTermToDelete.id.toString());
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleToggleStatus = async (paymentTerm: PaymentTermType) => {
    if (!paymentTerm.id) {
      toast.error("No se puede cambiar el estado: ID no disponible");
      return;
    }

    try {
      await updatePaymentTermAction({
        id: paymentTerm.id.toString(),
        data: {
          term_name: paymentTerm.term_name,
          term_description: paymentTerm.term_description || "",
          number_of_days: paymentTerm.number_of_days,
          is_active: !paymentTerm.is_active,
        },
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada";
    try {
      return format(new Date(dateString), "dd/MM/yyyy hh:mm a");
    } catch {
      return "Fecha inválida";
    }
  };

  const isActionLoading = isCreateLoading || isUpdateLoading || isDeleteLoading;

  const columns: ColumnDef<PaymentTermType>[] = [
    {
      accessorKey: "term_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("term_name")}</div>
          <div className="text-xs text-gray_m">
            {row.original.number_of_days === 0
              ? "Contado"
              : `${row.original.number_of_days} días`}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "term_description",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("term_description") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "number_of_days",
      header: "Días",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("number_of_days") === 0
            ? "Contado"
            : `${row.getValue("number_of_days")} días`}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive ? "bg-green_xxl text-green_b" : "bg-red_xxl text-red_b"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div className="font-medium">{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const paymentTerm = row.original;
        const hasValidId = !!paymentTerm.id;

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
                  onClick={() => handleEditPaymentTerm(paymentTerm)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId || isActionLoading}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(paymentTerm)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId || isActionLoading}
                >
                  {paymentTerm.is_active ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Desactivar</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4 w-4" />
                      <span>Activar</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(paymentTerm)}
                  className={`cursor-pointer flex items-center gap-2 text-red_b ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasValidId || isActionLoading}
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

  const statusOptions = [
    { id: "1", name: "active", label: "Activo" },
    { id: "2", name: "inactive", label: "Inactivo" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Términos de Pago
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray_m" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o descripción..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Filtros de Términos de Pago
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Ajusta los filtros para encontrar los términos de pago
                        que necesitas.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.id} value={status.name}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.dispatchEvent(
                            new KeyboardEvent("keydown", { key: "Escape" })
                          );
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleCreateClick}
              className="flex items-center gap-2"
              disabled={isActionLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Crear Término</span>
            </Button>
          </div>

          {error && (
            <div className="bg-red_xxl border border-red_b text-red_b px-4 py-3 rounded-lg mb-4">
              Error al cargar los términos de pago: {error}
            </div>
          )}
          <DataTable<PaymentTermType, PaymentTermType>
            columns={columns}
            data={paymentTerms}
            noResultsText="No se encontraron términos de pago"
            page={page}
            setPage={setPage}
            totalPage={totalPages}
            total={totalItems}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </main>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="w-full bg-white sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el término de pago{" "}
              <strong>{paymentTermToDelete?.term_name}</strong>? <br /> Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPaymentTermToDelete(null);
              }}
              className="w-full sm:w-auto"
              disabled={isDeleteLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeletePaymentTerm}
              disabled={isDeleteLoading || !paymentTermToDelete?.id}
              className="w-full sm:w-auto"
            >
              {isDeleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Término
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen || isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsCreateDialogOpen(false);
            setSelectedPaymentTerm(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="w-full bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedPaymentTerm
                ? "Editar Término de Pago"
                : "Crear Nuevo Término de Pago"}
            </DialogTitle>
            <DialogDescription>
              {selectedPaymentTerm
                ? "Modifica la información del término de pago seleccionado"
                : "Completa la información para crear un nuevo término de pago"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="term_name">Nombre *</Label>
              <Input
                id="term_name"
                {...form.register("term_name")}
                placeholder="Contado, 30 Días, etc."
                disabled={isActionLoading}
              />
              {form.formState.errors.term_name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.term_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="term_description">Descripción</Label>
              <Input
                id="term_description"
                {...form.register("term_description")}
                placeholder="Descripción del término de pago (opcional)"
                disabled={isActionLoading}
              />
              {form.formState.errors.term_description && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.term_description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_days">Días de Plazo *</Label>
              <Input
                id="number_of_days"
                type="number"
                {...form.register("number_of_days", { valueAsNumber: true })}
                placeholder="0 para contado"
                min="0"
                disabled={isActionLoading}
              />
              {form.formState.errors.number_of_days && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.number_of_days.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setIsCreateDialogOpen(false);
                  setSelectedPaymentTerm(null);
                  form.reset();
                }}
                disabled={isActionLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isActionLoading}>
                {isActionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedPaymentTerm ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>{selectedPaymentTerm ? "Actualizar" : "Crear"} Término</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTermsPage;
