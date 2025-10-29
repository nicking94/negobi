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
  Package,
  Ruler,
  Box,
  Globe,
  Barcode,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// Schema COMPLETO según Swagger
const productSchema = z.object({
  // Información básica
  product_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  sku: z.string().optional(),
  description: z.string().optional(),

  // Relaciones
  companyId: z.number().min(1, "La compañía es requerida"),
  categoryId: z.number().min(1, "La categoría es requerida"),
  brand_id: z.number().optional().nullable(),

  // Precios y costos
  base_price: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
  current_cost: z.number().min(0, "El costo actual debe ser mayor o igual a 0"),
  previous_cost: z
    .number()
    .min(0, "El costo anterior debe ser mayor o igual a 0"),
  average_cost: z
    .number()
    .min(0, "El costo promedio debe ser mayor o igual a 0"),

  // Niveles de precio
  price_level_1: z
    .number()
    .min(0, "El precio nivel 1 debe ser mayor o igual a 0"),
  price_level_2: z
    .number()
    .min(0, "El precio nivel 2 debe ser mayor o igual a 0"),
  price_level_3: z
    .number()
    .min(0, "El precio nivel 3 debe ser mayor o igual a 0"),
  price_level_4: z
    .number()
    .min(0, "El precio nivel 4 debe ser mayor o igual a 0"),
  price_level_5: z
    .number()
    .min(0, "El precio nivel 5 debe ser mayor o igual a 0"),

  // Gestión de inventario
  manages_serials: z.boolean(),
  manages_lots: z.boolean(),
  uses_decimals_in_quantity: z.boolean(),
  uses_scale_for_weight: z.boolean(),

  // Impuestos
  is_tax_exempt: z.boolean(),

  // Dimensiones y peso
  weight_value: z.number().min(0, "El peso debe ser mayor o igual a 0"),
  weight_unit: z.string(),
  volume_value: z.number().min(0, "El volumen debe ser mayor o igual a 0"),
  volume_unit: z.string(),
  length_value: z.number().min(0, "La longitud debe ser mayor o igual a 0"),
  width_value: z.number().min(0, "El ancho debe ser mayor o igual a 0"),
  height_value: z.number().min(0, "La altura debe ser mayor o igual a 0"),
  dimension_unit: z.string(),

  // Visibilidad
  show_in_ecommerce: z.boolean(),
  show_in_sales_app: z.boolean(),

  // Stock
  stock_quantity: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  total_quantity_reserved: z
    .number()
    .min(0, "La cantidad reservada debe ser mayor o igual a 0"),
  total_quantity_on_order: z
    .number()
    .min(0, "La cantidad en orden debe ser mayor o igual a 0"),

  // Estado
  is_active: z.boolean(),

  // Códigos ERP
  erp_code_inst: z.string().optional(),
  external_code: z.string().optional(),
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const activeCompanyId = 4;

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    search: debouncedSearchTerm || undefined,
    categoryId:
      selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    is_active: true,
  });

  // Obtener categorías
  const {
    productCategories: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useProductCategories({
    is_active: true,
    page: 1,
    itemsPerPage: 100,
  });

  // Obtener marcas
  const { brands, loading: brandsLoading } = useBrands({
    is_active: true,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      // Información básica
      product_name: "",
      code: "",
      sku: "",
      description: "",

      // Relaciones
      companyId: activeCompanyId,
      categoryId: 0,
      brand_id: undefined,

      // Precios y costos
      base_price: 0,
      current_cost: 0,
      previous_cost: 0,
      average_cost: 0,

      // Niveles de precio
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      price_level_4: 0,
      price_level_5: 0,

      // Gestión de inventario
      manages_serials: false,
      manages_lots: false,
      uses_decimals_in_quantity: false,
      uses_scale_for_weight: false,

      // Impuestos
      is_tax_exempt: false,

      // Dimensiones y peso
      weight_value: 0,
      weight_unit: "kg",
      volume_value: 0,
      volume_unit: "m³",
      length_value: 0,
      width_value: 0,
      height_value: 0,
      dimension_unit: "cm",

      // Visibilidad
      show_in_ecommerce: false,
      show_in_sales_app: false,

      // Stock
      stock_quantity: 0,
      total_quantity_reserved: 0,
      total_quantity_on_order: 0,

      // Estado
      is_active: true,

      // Códigos ERP
      erp_code_inst: "",
      external_code: "",
    },
  });

  // Filtrar productos por stock
  const displayProducts = inStockOnly
    ? products.filter((product) => product.stock_quantity > 0)
    : products;

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

      // Preparar datos COMPLETOS según Swagger
      const productData: CreateProductData | UpdateProductData = {
        // Información básica
        product_name: data.product_name,
        code: data.code,
        sku: data.sku,
        description: data.description || "",

        // Relaciones
        companyId: activeCompanyId,
        categoryId: data.categoryId,
        brand_id: data.brand_id || null,

        // Precios y costos
        base_price: data.base_price,
        current_cost: data.current_cost,
        previous_cost: data.previous_cost,
        average_cost: data.average_cost,

        // Niveles de precio
        price_level_1: data.price_level_1,
        price_level_2: data.price_level_2,
        price_level_3: data.price_level_3,
        price_level_4: data.price_level_4,
        price_level_5: data.price_level_5,

        // Gestión de inventario
        manages_serials: data.manages_serials,
        manages_lots: data.manages_lots,
        uses_decimals_in_quantity: data.uses_decimals_in_quantity,
        uses_scale_for_weight: data.uses_scale_for_weight,

        // Impuestos
        is_tax_exempt: data.is_tax_exempt,

        // Dimensiones y peso
        weight_value: data.weight_value,
        weight_unit: data.weight_unit,
        volume_value: data.volume_value,
        volume_unit: data.volume_unit,
        length_value: data.length_value,
        width_value: data.width_value,
        height_value: data.height_value,
        dimension_unit: data.dimension_unit,

        // Visibilidad
        show_in_ecommerce: data.show_in_ecommerce,
        show_in_sales_app: data.show_in_sales_app,

        // Stock
        stock_quantity: data.stock_quantity,
        total_quantity_reserved: data.total_quantity_reserved,
        total_quantity_on_order: data.total_quantity_on_order,

        // Estado
        is_active: data.is_active,

        // Códigos ERP
        erp_code_inst: data.erp_code_inst || "",
        external_code: data.external_code || "",
      };

      if (editingProduct && editingProduct.id) {
        // Actualizar producto existente
        const result = await updateProduct(
          editingProduct.id.toString(),
          productData
        );
        if (result) {
          toast.success("Producto actualizado exitosamente");
        }
      } else {
        // Crear nuevo producto
        const result = await createProduct(productData as CreateProductData);
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
    setSelectedCategory(categoryId);
    setPage(1);
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
            {`¿Estás seguro de que quieres eliminar "${product.product_name}"? Esta acción no se puede deshacer.`}
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
      { duration: 10000 }
    );
  };

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    const categoryId = product.categoryId || product.category?.id;

    form.reset({
      // Información básica
      product_name: product.product_name,
      code: product.code || product.sku,
      sku: product.sku,
      description: product.description || "",

      // Relaciones
      companyId: product.companyId || activeCompanyId,
      categoryId: categoryId || 0,
      brand_id: product.brand_id || undefined,

      // Precios y costos
      base_price: product.base_price,
      current_cost: product.current_cost,
      previous_cost: product.previous_cost,
      average_cost: product.average_cost,

      // Niveles de precio
      price_level_1: product.price_level_1,
      price_level_2: product.price_level_2,
      price_level_3: product.price_level_3,
      price_level_4: product.price_level_4,
      price_level_5: product.price_level_5,

      // Gestión de inventario
      manages_serials: product.manages_serials,
      manages_lots: product.manages_lots,
      uses_decimals_in_quantity: product.uses_decimals_in_quantity,
      uses_scale_for_weight: product.uses_scale_for_weight,

      // Impuestos
      is_tax_exempt: product.is_tax_exempt,

      // Dimensiones y peso
      weight_value: product.weight_value,
      weight_unit: product.weight_unit || "kg",
      volume_value: product.volume_value,
      volume_unit: product.volume_unit || "m³",
      length_value: product.length_value,
      width_value: product.width_value,
      height_value: product.height_value,
      dimension_unit: product.dimension_unit || "cm",

      // Visibilidad
      show_in_ecommerce: product.show_in_ecommerce,
      show_in_sales_app: product.show_in_sales_app,

      // Stock
      stock_quantity: product.stock_quantity,
      total_quantity_reserved: product.total_quantity_reserved,
      total_quantity_on_order: product.total_quantity_on_order,

      // Estado
      is_active: product.is_active,

      // Códigos ERP
      erp_code_inst: product.erp_code_inst || "",
      external_code: product.external_code || "",
    });

    setIsModalOpen(true);
    setActiveTab("basic");
  };

  const resetForm = () => {
    form.reset({
      product_name: "",
      code: "",
      sku: "",
      description: "",
      companyId: activeCompanyId,
      categoryId: 0,
      brand_id: undefined,
      base_price: 0,
      current_cost: 0,
      previous_cost: 0,
      average_cost: 0,
      price_level_1: 0,
      price_level_2: 0,
      price_level_3: 0,
      price_level_4: 0,
      price_level_5: 0,
      manages_serials: false,
      manages_lots: false,
      uses_decimals_in_quantity: false,
      uses_scale_for_weight: false,
      is_tax_exempt: false,
      weight_value: 0,
      weight_unit: "kg",
      volume_value: 0,
      volume_unit: "m³",
      length_value: 0,
      width_value: 0,
      height_value: 0,
      dimension_unit: "cm",
      show_in_ecommerce: false,
      show_in_sales_app: false,
      stock_quantity: 0,
      total_quantity_reserved: 0,
      total_quantity_on_order: 0,
      is_active: true,
      erp_code_inst: "",
      external_code: "",
    });
    setEditingProduct(null);
    setActiveTab("basic");
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
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <div
            className={`font-medium ${
              isActive ? "text-green-600" : "text-red_m"
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

  if (productsError || categoriesError) {
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
              <p>Error: {productsError || categoriesError}</p>
              <Button onClick={() => refetchProducts()} className="mt-4">
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

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

      {/* Modal para crear/editar producto - COMPLETO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-white shadow grid w-full grid-cols-5">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Básico</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="flex items-center gap-2"
                  >
                    <Barcode className="h-4 w-4" />
                    <span className="hidden sm:inline">Precios</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="inventory"
                    className="flex items-center gap-2"
                  >
                    <Box className="h-4 w-4" />
                    <span className="hidden sm:inline">Inventario</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="dimensions"
                    className="flex items-center gap-2"
                  >
                    <Ruler className="h-4 w-4" />
                    <span className="hidden sm:inline">Medidas</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="visibility"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">Visibilidad</span>
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña: Información Básica */}
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Información Básica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="product_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Producto *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nombre del producto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Código interno"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="SKU del producto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                placeholder="Descripción del producto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoría *</FormLabel>
                              <FormControl>
                                <SelectSearchable
                                  value={
                                    field.value ? field.value.toString() : ""
                                  }
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

                        <FormField
                          control={form.control}
                          name="brand_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marca</FormLabel>
                              <FormControl>
                                <SelectSearchable
                                  value={field.value?.toString()}
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value ? parseInt(value) : undefined
                                    )
                                  }
                                  placeholder="Selecciona una marca"
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
                          name="erp_code_inst"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código ERP</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Código del ERP"
                                />
                              </FormControl>
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
                                  placeholder="Código externo"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña: Precios y Costos */}
                <TabsContent value="pricing" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Precios y Costos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="base_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio Base *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
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
                          name="previous_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo Anterior</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="average_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo Promedio</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <FormField
                            key={level}
                            control={form.control}
                            name={
                              `price_level_${level}` as `price_level_${
                                | 1
                                | 2
                                | 3
                                | 4
                                | 5}`
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Precio {level}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña: Gestión de Inventario */}
                <TabsContent value="inventory" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Gestión de Inventario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="stock_quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Inicial</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="total_quantity_reserved"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad Reservada</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="total_quantity_on_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad en Orden</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="manages_serials"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Gestiona Seriales</FormLabel>
                                <FormDescription>
                                  El producto requiere números de serie
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="manages_lots"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Gestiona Lotes</FormLabel>
                                <FormDescription>
                                  El producto requiere control por lotes
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="uses_decimals_in_quantity"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Usa Decimales</FormLabel>
                                <FormDescription>
                                  Permite cantidades decimales
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="uses_scale_for_weight"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Usa Báscula</FormLabel>
                                <FormDescription>
                                  Se pesa al momento de la venta
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="is_tax_exempt"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Exento de Impuestos</FormLabel>
                              <FormDescription>
                                El producto no paga impuestos
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña: Dimensiones y Peso */}
                <TabsContent value="dimensions" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Dimensiones y Peso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Peso</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight_unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidad de Peso</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona unidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kg">
                                    Kilogramos (kg)
                                  </SelectItem>
                                  <SelectItem value="g">Gramos (g)</SelectItem>
                                  <SelectItem value="lb">
                                    Libras (lb)
                                  </SelectItem>
                                  <SelectItem value="oz">Onzas (oz)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="volume_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Volumen</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="volume_unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidad de Volumen</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona unidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="m³">
                                    Metros cúbicos (m³)
                                  </SelectItem>
                                  <SelectItem value="cm³">
                                    Centímetros cúbicos (cm³)
                                  </SelectItem>
                                  <SelectItem value="l">Litros (l)</SelectItem>
                                  <SelectItem value="ml">
                                    Mililitros (ml)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="length_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="width_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ancho</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="height_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Altura</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="dimension_unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad de Dimensión</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona unidad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cm">
                                  Centímetros (cm)
                                </SelectItem>
                                <SelectItem value="m">Metros (m)</SelectItem>
                                <SelectItem value="in">
                                  Pulgadas (in)
                                </SelectItem>
                                <SelectItem value="ft">Pies (ft)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña: Visibilidad y Estado */}
                <TabsContent value="visibility" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Visibilidad y Estado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="show_in_ecommerce"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Mostrar en E-commerce</FormLabel>
                                <FormDescription>
                                  Visible en tienda online
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="show_in_sales_app"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Mostrar en App de Ventas</FormLabel>
                                <FormDescription>
                                  Visible en aplicación móvil
                                </FormDescription>
                              </div>
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
                              <FormLabel>Producto Activo</FormLabel>
                              <FormDescription>
                                El producto está disponible para venta
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  {activeTab !== "basic" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tabs = [
                          "basic",
                          "pricing",
                          "inventory",
                          "dimensions",
                          "visibility",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                    >
                      Anterior
                    </Button>
                  )}
                  {activeTab !== "visibility" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tabs = [
                          "basic",
                          "pricing",
                          "inventory",
                          "dimensions",
                          "visibility",
                        ];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Siguiente
                    </Button>
                  )}
                  {activeTab === "visibility" && (
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? "Guardando..."
                        : editingProduct
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
