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

import { useProducts } from "@/hooks/products/useProducts";
import {
  Product as ProductType,
  CreateProductData,
  UpdateProductData,
} from "@/services/products/products.service";
import { useProductCategories } from "@/hooks/productCategories/useProductCategories";
import { useBrands } from "@/hooks/brands/useBrands";

import { SelectSearchable } from "@/components/ui/select-searchable";
import { useCurrency } from "@/context/CurrencyContext";

const productSchema = z.object({
  product_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  sku: z.string().min(1, "El SKU es requerido"),
  code: z.string().min(1, "El código es requerido"), // AÑADIDO
  description: z.string().optional(),
  base_price: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  companyId: z.number().min(1, "La compañía es requerida"),
  categoryId: z.number().min(1, "La categoría es requerida"),
  brand_id: z.number().optional().nullable(),
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

const ProductsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { formatPrice } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
    categoryId:
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
      brand_id: undefined,
      current_cost: 0,
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      is_active: true,
    },
  });

  const displayProducts = products;

  const brandOptions = brands.map((brand) => ({
    value: brand.id.toString(),
    label: brand.brand_name,
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id.toString(),
    label: category.category_name,
  }));

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!activeCompanyId) {
        toast.error("No se ha seleccionado una compañía");
        return;
      }
      const commonData = {
        product_name: data.product_name,
        sku: data.sku,
        code: data.code,
        description: data.description || "",
        base_price: data.base_price,
        companyId: activeCompanyId,
        categoryId: data.categoryId,
        brand_id: data.brand_id || null,
        current_cost: data.current_cost,
        price_level_1: data.price_level_1,
        price_level_2: data.price_level_2,
        price_level_3: data.price_level_3,
        is_active: data.is_active,
      };

      if (editingProduct && editingProduct.id) {
        // Actualizar producto existente
        const updateData: UpdateProductData = {
          ...commonData,
        };

        const result = await updateProduct(
          editingProduct.id.toString(),
          updateData
        );
        if (result) {
          toast.success("Producto actualizado exitosamente");
        }
      } else {
        // Crear nuevo producto
        const createData: CreateProductData = {
          ...commonData,
          // Campos con valores por defecto
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
          external_code: "",
          previous_cost: 0,
          average_cost: 0,
          price_level_4: 0,
          price_level_5: 0,
        };

        const result = await createProduct(createData);
        if (result) {
          toast.success("Producto creado exitosamente");
        }
      }

      resetForm();
      setIsModalOpen(false);
      refetchProducts();
    } catch (error) {
      console.error("❌ Error al guardar el producto:", error);
      toast.error("Error al guardar el producto");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    // Convertir a número si no es "all"
    const categoryIdNum = categoryId !== "all" ? Number(categoryId) : undefined;
    setSelectedCategory(categoryId);
    setPage(1);

    // Actualizar el filtro con el número
    if (categoryIdNum !== undefined && !isNaN(categoryIdNum)) {
      // Aquí deberías actualizar el filtro que se pasa al hook useProducts
      // Depende de cómo tengas implementada la actualización de filtros
    }
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

    // OBTENER categoryId CONSISTENTEMENTE
    const categoryId = product.categoryId || product.category?.id;

    form.reset({
      product_name: product.product_name,
      sku: product.sku,
      code: product.code || product.sku,
      description: product.description || "",
      base_price: product.base_price,
      companyId: product.companyId || activeCompanyId,
      categoryId: categoryId || 0,
      brand_id: product.brand_id || undefined,
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
      code: "", // AÑADIDO
      description: "",
      base_price: 0,
      companyId: activeCompanyId, // INCLUIR companyId
      categoryId: 0,
      brand_id: undefined,
      current_cost: 0,
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      is_active: true,
    });
    setEditingProduct(null);
  };

  const getBrandName = (brandId: number | undefined) => {
    if (!brandId) return "Sin marca";
    const brand = brands.find((b) => b.id === brandId);
    return brand?.brand_name || "Sin marca";
  };

  const getCategoryName = (product: ProductType) => {
    if (product.category?.category_name) {
      return product.category.category_name;
    }
    const categoryId = product.categoryId || product.category?.id;
    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        return category.category_name;
      } else {
        console.log(
          `❌ Categoría ID ${categoryId} no encontrada en categorías globales`
        );
      }
    }

    return "Sin categoría";
  };

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
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const product = row.original;
        return <div className="font-medium">{getCategoryName(product)}</div>;
      },
    },
    {
      accessorKey: "brand_id",
      header: "Marca",
      cell: ({ row }) => {
        const brandId = row.getValue("brand_id") as number | undefined;
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
        return <div className="font-medium">{formatPrice(cost)}</div>;
      },
    },
    {
      accessorKey: "base_price",
      header: "Precio Base",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("base_price"));
        return <div className="font-medium">{formatPrice(price)}</div>;
      },
    },
    {
      accessorKey: "price_level_1",
      header: "Precio 1",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price_level_1"));
        return <div className="font-medium">{formatPrice(price)}</div>;
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
              Productos
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

          <div className="bg-white rounded-lg shadow-sm">
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
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Arroz"
                          />
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
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="BEB-COC-4821"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2">
                      <FormLabel className="pt-2 sm:text-right">
                        Código
                      </FormLabel>
                      <div className="w-full col-span-1 sm:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder="Código interno"
                          />
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
                            className="bg-white flex w-full rounded-md border border-input  px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
                            placeholder="Escribe aquí..."
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
                        <FormControl>
                          <SelectSearchable
                            value={field.value ? field.value.toString() : ""}
                            onValueChange={(value) =>
                              field.onChange(value ? parseInt(value) : 0)
                            }
                            placeholder="Selecciona una categoría"
                            options={categoryOptions}
                            searchPlaceholder="Buscar categoría..."
                            emptyMessage="No se encontraron categorías."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Select Searchable para Marcas - CORREGIDO */}
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Marca</FormLabel>{" "}
                        {/* Removido el asterisco */}
                        <FormControl>
                          <SelectSearchable
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(
                                value ? parseInt(value) : undefined
                              )
                            }
                            placeholder="Selecciona una marca (opcional)"
                            options={brandOptions}
                            searchPlaceholder="Buscar marca..."
                            emptyMessage="No se encontraron marcas."
                          />
                        </FormControl>
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
    </div>
  );
};

export default ProductsPage;
