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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
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
import Image from "next/image";

import { useProducts } from "@/hooks/products/useProducts";
import {
  Product as ProductType,
  CreateProductData,
  UpdateProductData,
} from "@/services/products/products.service";
import { useProductCategories } from "@/hooks/productCategories/useProductCategories";
import { ProductCategory } from "@/services/productCategories/productCategories.service";
import { useBrands } from "@/hooks/brands/useBrands";
import { Brand } from "@/services/brands/brands.service";

// Componentes para los selects searchables
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Esquema de validación actualizado
const productSchema = z.object({
  product_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  sku: z.string().min(1, "El SKU es requerido"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  base_price: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  companyId: z.number().min(1, "La compañía es requerida"),
  categoryId: z.number().min(1, "La categoría es requerida"),
  brand_id: z.number().min(1, "La marca es requerida"),
  current_cost: z.number().min(0, "El costo actual debe ser mayor o igual a 0"),
  price_level_1: z
    .number()
    .min(0, "El precio nivel 1 debe ser mayor o igual a 0"),
  price_level_2: z
    .number()
    .min(0, "El precio nivel 2 debe ser mayor o igual a 0"),
  price_level_3: z
    .number()
    .min(0, "El precio nivel 3 debe ser mayor o igual a 0"),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Interfaces para datos locales
type Unit = {
  id: number;
  name: string;
};

const ProductsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [brandSearchOpen, setBrandSearchOpen] = useState(false);
  const [categorySearchOpen, setCategorySearchOpen] = useState(false); // Estado para el popover de categorías

  // Asumimos que la primera instancia es la compañía activa
  const activeCompanyId = 4;

  const {
    products,
    loading: productsLoading,
    error: productsError,
    createProduct,
    updateProduct,
    deleteProduct,
    page,
    itemsPerPage,
    total,
    totalPage,
    setPage,
    setItemsPerPage,
    refetch: refetchProducts,
  } = useProducts({
    companyId: activeCompanyId,
    search: searchTerm || undefined,
    category_id:
      selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    is_active: true,
  });

  // Obtener categorías reales usando el hook useProductCategories
  const {
    productCategories: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useProductCategories({
    is_active: true,
    page: 1,
    itemsPerPage: 100,
  });

  // Obtener marcas usando el hook useBrands
  const {
    brands,
    loading: brandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useBrands({
    is_active: true, // Solo marcas activas
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: "",
      sku: "",
      description: "",
      base_price: 0,
      categoryId: 0,
      brand_id: 0,
      current_cost: 0,
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      is_active: true,
    },
  });

  // Simular carga de datos de unidades
  useEffect(() => {
    setUnits([
      { id: 1, name: "Unidad" },
      { id: 2, name: "Kilogramo" },
      { id: 3, name: "Litro" },
    ]);
  }, []);

  const displayProducts = products;

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!activeCompanyId) {
        toast.error("No se ha seleccionado una compañía");
        return;
      }

      if (editingProduct && editingProduct.id) {
        // Actualizar producto existente
        const updateData: UpdateProductData = {
          product_name: data.product_name,
          sku: data.sku,
          description: data.description,
          base_price: data.base_price,
          categoryId: data.categoryId,
          brand_id: data.brand_id,
          current_cost: data.current_cost,
          price_level_1: data.price_level_1,
          price_level_2: data.price_level_2,
          price_level_3: data.price_level_3,
          is_active: data.is_active,
        };

        const result = await updateProduct(
          editingProduct.id.toString(),
          updateData
        );
        if (result) {
          toast.success("Producto actualizado exitosamente");
        } else {
          toast.error("Error al actualizar el producto");
        }
      } else {
        // Crear nuevo producto
        const createData: CreateProductData = {
          ...data,
          companyId: activeCompanyId,
          // Campos requeridos con valores por defecto
          code: data.sku, // Usar SKU como código por defecto
          manages_serials: false,
          manages_lots: false,
          uses_decimals_in_quantity: false,
          uses_scale_for_weight: false,
          is_tax_exempt: false,
          weight_value: 0,
          weight_unit: "kg",
          volume_value: 0,
          volume_unit: "m3",
          length_value: 0,
          width_value: 0,
          height_value: 0,
          dimension_unit: "cm",
          show_in_ecommerce: true,
          show_in_sales_app: true,
          stock_quantity: 0,
          total_quantity_reserved: 0,
          total_quantity_on_order: 0,
          erp_code_inst: "",
        };

        const result = await createProduct(createData);
        if (result) {
          toast.success("Producto creado exitosamente");
        } else {
          toast.error("Error al crear el producto");
        }
      }

      resetForm();
      setIsModalOpen(false);
      refetchProducts(); // Recargar productos después de guardar
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast.error("Error al guardar el producto");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1); // Resetear a la primera página cuando cambia el filtro
  };

  const handleDelete = async (product: ProductType) => {
    if (!product.id) {
      toast.error("Producto no encontrado");
      return;
    }

    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="font-semibold mb-2">¿Eliminar producto?</h3>
          <p className="text-sm text-gray-600 mb-4">
            {`¿Estás seguro de que quieres eliminar "${product.product_name}"? Esta
            acción no se puede deshacer.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                toast.dismiss(t);
                const success = await deleteProduct(product.id!.toString());
                if (success) {
                  toast.success("Producto eliminado exitosamente");
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    form.reset({
      product_name: product.product_name,
      sku: product.sku,
      description: product.description || "",
      base_price: product.base_price,
      categoryId: product.categoryId || 0,
      brand_id: product.brand_id || 0,
      current_cost: product.current_cost,
      price_level_1: product.price_level_1,
      price_level_2: product.price_level_2,
      price_level_3: product.price_level_3,
      is_active: product.is_active,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      product_name: "",
      sku: "",
      description: "",
      base_price: 0,
      categoryId: 0,
      brand_id: 0,
      current_cost: 0,
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      is_active: true,
    });
    setEditingProduct(null);
  };

  const handleBulkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return extension === "jpg" || extension === "jpeg" || extension === "png";
    });

    setBulkUploadFiles(validFiles);
  };

  const processBulkUpload = () => {
    if (bulkUploadFiles.length === 0) {
      toast.error("No hay imágenes válidas para procesar");
      return;
    }

    toast.info("Funcionalidad de carga masiva en desarrollo");
    setBulkUploadFiles([]);
    setIsBulkUploadModalOpen(false);
  };

  // Función para obtener el nombre de la marca por ID
  const getBrandName = (brandId: number) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand?.brand_name || "Sin marca";
  };

  // Función para obtener el nombre de la categoría por ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.category_name || "Sin categoría";
  };

  // Configuración de columnas para la tabla
  const columns: ColumnDef<ProductType>[] = [
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[150px]">
          <div className="font-medium">{row.getValue("product_name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("sku")}</div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Categoría",
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as number;
        return <div className="font-medium">{getCategoryName(categoryId)}</div>;
      },
    },
    {
      accessorKey: "brand_id",
      header: "Marca",
      cell: ({ row }) => {
        const brandId = row.getValue("brand_id") as number;
        return <div className="font-medium">{getBrandName(brandId)}</div>;
      },
    },
    {
      accessorKey: "stock_quantity",
      header: "Existencia",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("stock_quantity")}</div>
      ),
    },
    {
      accessorKey: "current_cost",
      header: "Costo",
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("current_cost"));
        const formatted = new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "USD",
        }).format(cost);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "base_price",
      header: "Precio Base",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("base_price"));
        const formatted = new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "USD",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "price_level_1",
      header: "Precio 1",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price_level_1"));
        const formatted = new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: "USD",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <div
            className={`font-medium ${
              isActive ? "text-green-600" : "text-red-600"
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
        const product = row.original;
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
                  onClick={() => handleEdit(product)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(product)}
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

  // Mostrar estado de carga o error
  if (
    (productsLoading && products.length === 0) ||
    categoriesLoading ||
    brandsLoading
  ) {
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
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (productsError || categoriesError || brandsError) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p>Error: {productsError || categoriesError || brandsError}</p>
              <Button
                onClick={() => {
                  refetchProducts();
                  refetchCategories();
                  refetchBrands();
                }}
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
              Productos {total > 0 && `(${total})`}{" "}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 w-full max-w-[30rem]">
              <div className="w-full max-w-[30rem] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[18rem]">
                  <div className="flex items-center space-x-2 p-2">
                    <Checkbox
                      id="in-stock-only"
                      checked={inStockOnly}
                      onCheckedChange={(checked) =>
                        setInStockOnly(checked === true)
                      }
                    />
                    <label
                      htmlFor="in-stock-only"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Solo con existencias
                    </label>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <Label htmlFor="category-filter">Categoría</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="category-filter" className="mt-1">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas las categorías
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="gap-2 w-full sm:w-auto"
                  disabled={productsLoading}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo producto</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <DataTable<ProductType, ColumnDef<ProductType>[]>
              columns={columns}
              data={displayProducts}
              noResultsText="No se encontraron productos"
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

      {/* Modal para crear/editar producto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 py-2 sm:py-4">
                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Nombre
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">SKU</FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input {...field} className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Descripción
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <textarea
                            {...field}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Searchable para Categorías */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Categoría *</FormLabel>
                        <Popover
                          open={categorySearchOpen}
                          onOpenChange={setCategorySearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={categorySearchOpen}
                                className="w-full justify-between"
                                disabled={categoriesLoading}
                              >
                                {field.value
                                  ? getCategoryName(field.value)
                                  : "Selecciona una categoría"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar categoría..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron categorías.
                                </CommandEmpty>
                                <CommandGroup>
                                  {categories.map((category) => (
                                    <CommandItem
                                      key={category.id}
                                      value={category.category_name}
                                      onSelect={() => {
                                        field.onChange(category.id);
                                        setCategorySearchOpen(false);
                                      }}
                                    >
                                      {category.category_name}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === category.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Searchable para Marcas */}
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Marca *</FormLabel>
                        <Popover
                          open={brandSearchOpen}
                          onOpenChange={setBrandSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={brandSearchOpen}
                                className="w-full justify-between"
                                disabled={brandsLoading}
                              >
                                {field.value
                                  ? getBrandName(field.value)
                                  : "Selecciona una marca"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar marca..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron marcas.
                                </CommandEmpty>
                                <CommandGroup>
                                  {brands.map((brand) => (
                                    <CommandItem
                                      key={brand.id}
                                      value={brand.brand_name}
                                      onSelect={() => {
                                        field.onChange(brand.id);
                                        setBrandSearchOpen(false);
                                      }}
                                    >
                                      {brand.brand_name}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === brand.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="current_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Actual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="base_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Base</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price_level_1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio N1</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_level_2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio N2</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_level_3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio N3</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Producto activo</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Los productos inactivos no estarán disponibles para la
                          venta
                        </FormDescription>
                      </div>
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
                >
                  Cerrar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Guardando..."
                    : editingProduct
                    ? "Actualizar"
                    : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para carga masiva de imágenes */}
      <Dialog
        open={isBulkUploadModalOpen}
        onOpenChange={setIsBulkUploadModalOpen}
      >
        <DialogContent className="w-[95%] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Carga masiva de imágenes</DialogTitle>
            <DialogDescription>
              Seleccione las imágenes para cargar. El nombre debe seguir el
              formato: SKU-NÚMERO (ej: SKU001-1.jpg)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-2">
              <Input
                id="bulk-images"
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={handleBulkImageUpload}
                className="cursor-pointer"
              />
            </div>

            {bulkUploadFiles.length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Archivos a procesar:</h3>
                <ul className="max-h-40 overflow-y-auto">
                  {bulkUploadFiles.map((file, index) => (
                    <li key={index} className="text-sm py-1">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBulkUploadModalOpen(false);
                setBulkUploadFiles([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={processBulkUpload}
              disabled={bulkUploadFiles.length === 0}
            >
              Procesar imágenes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
