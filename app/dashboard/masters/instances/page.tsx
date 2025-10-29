"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  Edit,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import {
  ProductCategory,
  CreateProductCategoryData,
  UpdateProductCategoryData,
} from "@/services/productCategories/productCategories.service";
import { useProductCategories } from "@/hooks/productCategories/useProductCategories";
import useUserCompany from "@/hooks/auth/useUserCompany";

// Esquema sin is_active (se manejará desde las acciones)
const categorySchema = z.object({
  category_code: z.string().min(1, "El código es requerido"),
  category_name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  prefix: z.string().min(1, "El prefijo es requerido"),
  correlative_length: z
    .number()
    .min(1, "La longitud debe ser al menos 1")
    .max(10, "La longitud no puede ser mayor a 10"),
  show_in_ecommerce: z.boolean(),
  show_in_sales_app: z.boolean(),
});

type CategoryFormInputs = z.infer<typeof categorySchema>;

const InstancesPage = () => {
  const { companyId } = useUserCompany();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);

  const {
    productCategories,
    loading,
    error,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    page,
    itemsPerPage,
    total,
    totalPage,
    setPage,
    setItemsPerPage,
    setModified,
  } = useProductCategories({
    page: 1,
    itemsPerPage: 10,
    companyId: companyId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormInputs>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      description: "",
      prefix: "",
      correlative_length: 5,
      show_in_ecommerce: true,
      show_in_sales_app: true,
    },
  });

  useEffect(() => {
    if (editingCategory) {
      // Cuando hay una instancia para editar, llena el formulario con sus datos
      reset({
        category_code: editingCategory.category_code || "",
        category_name: editingCategory.category_name || "",
        description: editingCategory.description || "",
        prefix: editingCategory.prefix || "",
        correlative_length: editingCategory.correlative_length || 5,
        show_in_ecommerce: editingCategory.show_in_ecommerce ?? true,
        show_in_sales_app: editingCategory.show_in_sales_app ?? true,
      });
    } else {
      // Cuando no hay instancia para editar, resetea a los valores por defecto
      reset({
        category_code: "",
        category_name: "",
        description: "",
        prefix: "",
        correlative_length: 5,
        show_in_ecommerce: true,
        show_in_sales_app: true,
      });
    }
  }, [editingCategory, reset]);

  const showInEcommerce = watch("show_in_ecommerce");
  const showInSalesApp = watch("show_in_sales_app");

  // Tipo para los datos procesados
  type CategoryFormValues = {
    category_code: string;
    category_name: string;
    description: string;
    prefix: string;
    correlative_length: number;
    show_in_ecommerce: boolean;
    show_in_sales_app: boolean;
  };

  const onSubmit = async (formData: CategoryFormInputs) => {
    try {
      const processedData: CategoryFormValues = {
        ...formData,
        correlative_length: Number(formData.correlative_length),
      };

      if (editingCategory) {
        const updateData: UpdateProductCategoryData = {
          category_name: processedData.category_name,
          category_code: processedData.category_code,
          description: processedData.description,
          prefix: processedData.prefix,
          correlative_length: processedData.correlative_length,
          is_active: editingCategory.is_active ?? true,
          show_in_ecommerce: processedData.show_in_ecommerce,
          show_in_sales_app: processedData.show_in_sales_app,
        };

        const result = await updateProductCategory(
          editingCategory.id.toString(),
          updateData
        );

        if (result) {
          setModified((prev) => !prev);
          resetForm();
          setIsModalOpen(false);
        } else {
          toast.error("Error al actualizar la Instancia");
          return;
        }
      } else {
        // ✅ Asegurar que companyId esté disponible
        if (!companyId) {
          toast.error("No se pudo determinar la empresa del usuario");
          return;
        }

        const createData: CreateProductCategoryData = {
          companyId: companyId, // ✅ Usar el companyId real del usuario
          category_name: processedData.category_name,
          category_code: processedData.category_code,
          description: processedData.description,
          prefix: processedData.prefix,
          correlative_length: processedData.correlative_length,
          is_active: true,
          show_in_ecommerce: processedData.show_in_ecommerce,
          show_in_sales_app: processedData.show_in_sales_app,
        };

        const result = await createProductCategory(createData);

        if (result) {
          toast.success("Instancia creada exitosamente");
          setModified((prev) => !prev);
        } else {
          toast.error("Error al crear la instancia");
          return;
        }
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar instancia:", error);
      toast.error("Error al guardar la instancia");
    }
  };

  // Función para cambiar el estado de la categoría (activar/desactivar)
  const handleToggleStatus = async (category: ProductCategory) => {
    if (!category.id) {
      toast.error("No se puede cambiar el estado: ID no disponible");
      return;
    }

    try {
      // Preparar datos para la actualización - solo enviar campos esenciales
      const updateData: UpdateProductCategoryData = {
        category_name: category.category_name,
        category_code: category.category_code,
        description: category.description,
        prefix: category.prefix,
        correlative_length: category.correlative_length,
        is_active: !category.is_active,
        show_in_ecommerce: category.show_in_ecommerce,
        show_in_sales_app: category.show_in_sales_app,
      };

      const result = await updateProductCategory(
        category.id.toString(),
        updateData
      );

      if (result) {
        setModified((prev) => !prev);
      } else {
        toast.error("Error al cambiar el estado de la instancia");
      }
    } catch (error) {
      console.error("🔴 Error cambiando estado de instancia:", error);
      toast.error("Error al cambiar el estado de la instancia");
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    if (!category.id) {
      toast.error("Instancia no encontrada");
      return;
    }

    toast.error(`¿Eliminar la instancia "${category.category_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const success = await deleteProductCategory(category.id.toString());
          if (success) {
            toast.success("Instancia eliminada exitosamente");
            setModified((prev) => !prev);
          } else {
            toast.error("Error al eliminar la instancia");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
          toast.info("Eliminación cancelada");
        },
      },
    });
  };

  const resetForm = () => {
    reset({
      category_code: "",
      category_name: "",
      description: "",
      prefix: "",
      correlative_length: 5,
      show_in_ecommerce: true,
      show_in_sales_app: true,
    });
    setEditingCategory(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (
    field: keyof CategoryFormValues,
    checked: boolean
  ) => {
    setValue(field, checked, { shouldValidate: true });
  };

  const columns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: "category_code",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("category_code")}</div>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("category_name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-[200px] truncate">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "prefix",
      header: "Prefijo",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("prefix")}</div>
      ),
    },
    {
      accessorKey: "correlative_length",
      header: "Long. Correlativa",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("correlative_length")}</div>
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
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const category = row.original;
        const hasValidId = !!category.id;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Editar */}
                <DropdownMenuItem
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    setEditingCategory(category);
                    setIsModalOpen(true);
                  }}
                  disabled={!hasValidId}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>

                {/* Activar/Desactivar */}
                <DropdownMenuItem
                  className={`cursor-pointer flex items-center gap-2 ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleToggleStatus(category)}
                  disabled={!hasValidId}
                >
                  {category.is_active ? (
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

                {/* Eliminar */}
                <DropdownMenuItem
                  className={`cursor-pointer flex items-center gap-2 text-red_m ${
                    !hasValidId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleDelete(category)}
                  disabled={!hasValidId}
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

  // Mostrar estados de carga y error
  if (loading && productCategories.length === 0) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando instancias...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center text-red_m">
              <p>Error: {error}</p>
              <Button
                onClick={() => setModified((prev) => !prev)}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
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
              Instancias
            </h1>
            <Button
              onClick={handleOpenCreateModal}
              className="gap-2 w-full sm:w-auto"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span>Nueva instancia</span>
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <DataTable<ProductCategory, ColumnDef<ProductCategory>[]>
              columns={columns}
              data={productCategories}
              noResultsText="No hay instancias registradas"
              page={page}
              setPage={setPage}
              totalPage={totalPage}
              total={total}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </div>
        </main>
      </div>

      {/* Modal para crear/editar instancia */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar instancia" : "Nueva instancia"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Nombre de la instancia */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="category_name">Nombre *</Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="category_name"
                    placeholder="Nombre de la instancia"
                    {...register("category_name")}
                  />
                  {errors.category_name && (
                    <p className="text-red_m text-sm mt-1">
                      {errors.category_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Código de la instancia */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="category_code">Código *</Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="category_code"
                    placeholder="Código único"
                    {...register("category_code")}
                    disabled={!!editingCategory}
                  />
                  {errors.category_code && (
                    <p className="text-red_m text-sm mt-1">
                      {errors.category_code.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="description">Descripción *</Label>
                <div className="col-span-1 sm:col-span-3">
                  <textarea
                    id="description"
                    placeholder="Descripción de la instancia"
                    {...register("description")}
                    className="bg-white flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red_m text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Prefijo */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="prefix">Prefijo *</Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="prefix"
                    placeholder="Prefijo para códigos"
                    {...register("prefix")}
                  />
                  {errors.prefix && (
                    <p className="text-red_m text-sm mt-1">
                      {errors.prefix.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Longitud correlativa */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="correlative_length">Long. Correlativa *</Label>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    id="correlative_length"
                    type="number"
                    min="1"
                    max="10"
                    {...register("correlative_length", { valueAsNumber: true })}
                  />
                  {errors.correlative_length && (
                    <p className="text-red_m text-sm mt-1">
                      {errors.correlative_length.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Checkboxes para opciones - SIN is_active */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                <div className="col-span-1 sm:col-span-3 space-y-4">
                  {/* Checkbox eliminado: is_active */}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show_in_ecommerce"
                      checked={showInEcommerce}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "show_in_ecommerce",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="show_in_ecommerce" className="text-sm">
                      Mostrar en e-commerce
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show_in_sales_app"
                      checked={showInSalesApp}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "show_in_sales_app",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="show_in_sales_app" className="text-sm">
                      Mostrar en app de ventas
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : editingCategory
                  ? "Actualizar"
                  : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstancesPage;
