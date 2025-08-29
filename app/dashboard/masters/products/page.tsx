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
  Upload,
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
import { ProductsService } from "@/services/products/products.service";
import useGetInstances from "@/hooks/instances/useGetInstance";

type Category = {
  id: number;
  category_name: string;
};

export type Product = {
  product_name: string;
  companyId: number;
  sku: string;
  description: string;
  base_price: number;
  categoryId: number;
  brand_id: number;
  default_warehouse_id: number;
  current_cost: number;
  previous_cost: number;
  average_cost: number;
  manages_serials: boolean;
  manages_lots: boolean;
  uses_decimals_in_quantity: boolean;
  uses_scale_for_weight: boolean;
  is_tax_exempt: boolean;
  min_stock_level: number;
  max_stock_level: number;
  weight_value: number;
  weight_unit: string;
  volume_value: number;
  volume_unit: string;
  length_value: number;
  width_value: number;
  height_value: number;
  dimension_unit: string;
  show_in_ecommerce: boolean;
  show_in_sales_app: boolean;
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  price_level_4: number;
  price_level_5: number;
  stock_quantity: number;
  total_quantity_reserved: number;
  total_quantity_on_order: number;
  is_active: boolean;
  image?: string;
};

const productSchema = z.object({
  product_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  sku: z.string().min(1, "El SKU es requerido"),
  description: z.string().optional(),
  base_price: z.number().min(0, "El precio base debe ser mayor o igual a 0"),
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

type ProductForm = z.infer<typeof productSchema>;

const ProductsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const {
    instancesResponse,
    page,
    setItemsPerPage,
    itemsPerPage,
    setPage,
    total,
    totalPage,
    setModified,
  } = useGetInstances();
  console.log("instancesResponse", instancesResponse);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);

  const [products, setProducts] = useState<Product[]>([
    {
      product_name: "Producto Ejemplo",
      companyId: 1,
      sku: "SKU001",
      description: "Descripción del producto ejemplo",
      base_price: 15.99,
      categoryId: 1,
      brand_id: 1,
      default_warehouse_id: 1,
      current_cost: 10.5,
      previous_cost: 10.0,
      average_cost: 10.25,
      manages_serials: false,
      manages_lots: false,
      uses_decimals_in_quantity: false,
      uses_scale_for_weight: false,
      is_tax_exempt: false,
      min_stock_level: 10,
      max_stock_level: 100,
      weight_value: 0.5,
      weight_unit: "kg",
      volume_value: 0.2,
      volume_unit: "m3",
      length_value: 10,
      width_value: 5,
      height_value: 3,
      dimension_unit: "cm",
      show_in_ecommerce: true,
      show_in_sales_app: true,
      price_level_1: 15.99,
      price_level_2: 14.99,
      price_level_3: 13.99,
      price_level_4: 12.99,
      price_level_5: 11.99,
      stock_quantity: 100,
      total_quantity_reserved: 5,
      total_quantity_on_order: 15,
      is_active: true,
    },
    {
      product_name: "Otro Producto",
      companyId: 1,
      sku: "SKU002",
      description: "Descripción de otro producto",
      base_price: 12.99,
      categoryId: 2,
      brand_id: 2,
      default_warehouse_id: 1,
      current_cost: 8.5,
      previous_cost: 8.0,
      average_cost: 8.25,
      manages_serials: false,
      manages_lots: false,
      uses_decimals_in_quantity: false,
      uses_scale_for_weight: false,
      is_tax_exempt: false,
      min_stock_level: 5,
      max_stock_level: 50,
      weight_value: 0.3,
      weight_unit: "kg",
      volume_value: 0.1,
      volume_unit: "m3",
      length_value: 8,
      width_value: 4,
      height_value: 2,
      dimension_unit: "cm",
      show_in_ecommerce: true,
      show_in_sales_app: true,
      price_level_1: 12.99,
      price_level_2: 11.99,
      price_level_3: 10.99,
      price_level_4: 9.99,
      price_level_5: 8.99,
      stock_quantity: 0,
      total_quantity_reserved: 0,
      total_quantity_on_order: 0,
      is_active: true,
    },
  ]);

  // Obtener categorías únicas de los productos
  const productCategories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.categoryId))
    );
    return uniqueCategories;
  }, [products]);

  // Simular carga de datos de categorías, marcas y unidades
  useEffect(() => {
    setCategories([
      { id: 1, name: "Electrónicos" },
      { id: 2, name: "Ropa" },
      { id: 3, name: "Hogar" },
    ]);

    setBrands([
      { id: 1, name: "Marca Ejemplo" },
      { id: 2, name: "Otra Marca" },
      { id: 3, name: "Marca Premium" },
    ]);

    setUnits([
      { id: 1, name: "Unidad" },
      { id: 2, name: "Kilogramo" },
      { id: 3, name: "Litro" },
    ]);
  }, []);

  // Filtrar productos según los criterios
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filtrar por existencia
      const matchesStock = !inStockOnly || product.stock_quantity > 0;

      // Filtrar por categoría
      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId.toString() === selectedCategory;

      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [products, searchTerm, inStockOnly, selectedCategory]);

  const form = useForm<z.infer<typeof productSchema>>({
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

  const onSubmit = async (values: ProductForm) => {
    try {
      if (editingProduct) {
        toast.success("Producto actualizado exitosamente");
      } else {
        const newProduct: Product = {
          ...values,
          description: values.description || "",
          companyId: 4,
          previous_cost: 0,
          average_cost: values.current_cost,
          price_level_4: 0,
          price_level_5: 0,
          default_warehouse_id: 1,
          manages_serials: false,
          manages_lots: false,
          uses_decimals_in_quantity: false,
          uses_scale_for_weight: false,
          is_tax_exempt: false,
          min_stock_level: 0,
          max_stock_level: 0,
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
        };
        const result = await ProductsService.createProduct(newProduct);
        toast.success("Producto creado exitosamente");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al guardar el producto");
    }
  };

  const handleDelete = (product: Product) => {
    toast.error(`¿Eliminar el producto "${product.product_name}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          toast.success("Producto eliminado exitosamente");
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      product_name: product.product_name,
      sku: product.sku,
      description: product.description || "",
      base_price: product.base_price,
      categoryId: product.categoryId,
      brand_id: product.brand_id,
      current_cost: product.current_cost,
      price_level_1: product.price_level_1,
      price_level_2: product.price_level_2,
      price_level_3: product.price_level_3,
      is_active: product.is_active,
    });

    setIsModalOpen(true);
  };

  const resetForm = () => {
    form.reset();
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

    let processedCount = 0;
    let errorCount = 0;

    bulkUploadFiles.forEach((file) => {
      const fileName = file.name;
      const match = fileName.match(/^([A-Za-z0-9]+)-(\d+)\.(jpg|jpeg|png)$/i);

      if (!match) {
        errorCount++;
        return;
      }

      const productSKU = match[1];

      const productIndex = products.findIndex((p) => p.sku === productSKU);

      if (productIndex !== -1) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageDataUrl = reader.result as string;
          setProducts((prev) =>
            prev.map((p, idx) =>
              idx === productIndex ? { ...p, image: imageDataUrl } : p
            )
          );
        };
        reader.readAsDataURL(file);
        processedCount++;
      } else {
        errorCount++;
      }
    });

    toast.success(
      `Carga masiva completada: ${processedCount} imágenes procesadas, ${errorCount} errores`
    );

    setBulkUploadFiles([]);
    setIsBulkUploadModalOpen(false);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[150px]">
          {row.original.image && (
            <Image
              src={row.original.image}
              alt={row.getValue("product_name")}
              width={40}
              height={40}
              className="h-10 w-10 object-cover rounded-md"
            />
          )}
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
        const category = categories.find((c) => c.id === categoryId);
        return (
          <div className="font-medium">{category?.name || categoryId}</div>
        );
      },
    },
    {
      accessorKey: "brand_id",
      header: "Marca",
      cell: ({ row }) => {
        const brandId = row.getValue("brand_id") as number;
        const brand = brands.find((b) => b.id === brandId);
        return <div className="font-medium">{brand?.name || brandId}</div>;
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Productos
            </h1>
          </div>
          <div className="flex  justify-between">
            <div className=" w-full max-w-[30rem] flex flex-col md:flex-row gap-4 mb-6">
              <div className=" relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre de producto..."
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
                <DropdownMenuContent align="end" className="w-56">
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
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger id="category-filter" className="mt-1">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas las categorías
                        </SelectItem>
                        {instancesResponse.map((category: Category) => (
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
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo producto</span>
                </Button>
              </div>
            </div>
          </div>
          <DataTable<Product, Product>
            columns={columns}
            data={filteredProducts || []}
            noResultsText="No se encontraron productos"
            page={1}
            setPage={() => {}}
            totalPage={1}
            total={filteredProducts.length}
            itemsPerPage={10}
            setItemsPerPage={() => {}}
          />
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
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
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {instancesResponse.map((category: Category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id.toString()}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}
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

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 ">
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
                <Button type="submit" className="w-full sm:w-auto">
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
