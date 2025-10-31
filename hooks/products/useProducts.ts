import { useState, useEffect } from "react";
import {
  productService,
  Product,
  CreateProductData,
  UpdateProductData,
  GetProductsParams,
  ProductUnit,
} from "../../services/products/products.service";
import { toast } from "sonner";

export interface UseProductsFilters {
  page?: number;
  itemsPerPage?: number;
  companyId?: number;
  product_name?: string;
  sku?: string;
  categoryId?: number;
  brand_id?: number;
  unit_id?: number;
  default_warehouse_id?: number;
  manages_serials?: boolean;
  manages_lots?: boolean;
  is_tax_exempt?: boolean;
  show_in_ecommerce?: boolean;
  show_in_sales_app?: boolean;
  is_active?: boolean;
  search?: string;
}

export const useProducts = (filters: UseProductsFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(filters.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(filters.itemsPerPage || 10);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [modified, setModified] = useState(false);

  const safeNumber = (value: any): number | undefined => {
    if (value === undefined || value === null || value === "") return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const loadProducts = async (customFilters?: Partial<UseProductsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetProductsParams = {
        ...filters,
        ...customFilters,
        page: customFilters?.page || page,
        itemsPerPage: customFilters?.itemsPerPage || itemsPerPage,

        category_id:
          safeNumber(customFilters?.categoryId) ||
          safeNumber(filters.categoryId),
      };

      Object.keys(combinedFilters).forEach((key) => {
        if (combinedFilters[key as keyof GetProductsParams] === undefined) {
          delete combinedFilters[key as keyof GetProductsParams];
        }
      });

      const productsData = await productService.getProducts(combinedFilters);

      if (
        productsData &&
        typeof productsData === "object" &&
        "data" in productsData
      ) {
        setProducts(productsData.data);
        setTotal(productsData.total);
        setTotalPage(productsData.totalPages);
      } else {
        console.warn("Estructura inesperada:", productsData);
        setProducts([]);
        setTotal(0);
        setTotalPage(0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar productos";
      setError(errorMessage);
      setProducts([]);
      setTotal(0);
      setTotalPage(0);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (
    productData: CreateProductData
  ): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productService.createProduct(productData);
      toast.success("Producto creado exitosamente");
      setModified((prev) => !prev);
      return newProduct;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear producto";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    updates: UpdateProductData
  ): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(id, updates);
      toast.success("Producto actualizado exitosamente");
      setModified((prev) => !prev);
      return updatedProduct;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar producto";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      toast.success("Producto eliminado exitosamente");
      setModified((prev) => !prev);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar producto";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.companyId) {
      loadProducts();
    }
  }, [
    filters.companyId,
    filters.search,
    filters.categoryId,
    filters.brand_id,
    filters.is_active,
    page,
    itemsPerPage,
    modified,
  ]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    total,
    totalPage,
    setModified,
    refetch: loadProducts,
  };
};

export const useProductUnits = () => {
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const productUnits = await productService.getProductUnits();
      setUnits(productUnits);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar unidades de productos"
      );
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductUnits();
  }, []);

  return {
    units,
    loading,
    error,
    refetch: loadProductUnits,
  };
};

export const useProductsByCompany = (companyId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductsByCompany = async (id?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyProducts = await productService.getProductsByCompany(
        targetCompanyId
      );
      setProducts(companyProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar productos de la compañía"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadProductsByCompany();
    }
  }, [companyId]);

  return {
    products,
    loading,
    error,
    refetch: loadProductsByCompany,
  };
};

export const useActiveProducts = (companyId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveProducts = async (id?: number) => {
    const targetCompanyId = id || companyId;
    if (!targetCompanyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const activeProducts = await productService.getActiveProducts(
        targetCompanyId
      );
      setProducts(activeProducts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos activos"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadActiveProducts();
    }
  }, [companyId]);

  return {
    products,
    loading,
    error,
    refetch: loadActiveProducts,
  };
};

export const useProductSearch = (companyId?: number) => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (searchTerm: string) => {
    if (!companyId) {
      setError("companyId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await productService.searchProducts(
        companyId,
        searchTerm
      );
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al buscar productos"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    searchProducts,
  };
};

export const useProductsByCategory = (
  companyId?: number,
  categoryId?: number
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductsByCategory = async (compId?: number, catId?: number) => {
    const targetCompanyId = compId || companyId;
    const targetCategoryId = catId || categoryId;

    if (!targetCompanyId || !targetCategoryId) {
      setError("companyId y categoryId son requeridos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const categoryProducts = await productService.getProductsByCategory(
        targetCompanyId,
        targetCategoryId
      );
      setProducts(categoryProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar productos por categoría"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && categoryId) {
      loadProductsByCategory();
    }
  }, [companyId, categoryId]);

  return {
    products,
    loading,
    error,
    refetch: loadProductsByCategory,
  };
};

export const useProductManager = (companyId?: number) => {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  } = useProducts({ companyId });

  const getProductBySku = (sku: string): Product | undefined => {
    return products.find((product) => product.sku === sku);
  };

  const getProductByCode = (code: string): Product | undefined => {
    return products.find((product) => product.code === code);
  };

  const skuExists = (sku: string): boolean => {
    return products.some((product) => product.sku === sku);
  };

  const codeExists = (code: string): boolean => {
    return products.some((product) => product.code === code);
  };

  const getLowStockProducts = (threshold: number = 10): Product[] => {
    return products.filter((product) => product.stock_quantity <= threshold);
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySku,
    getProductByCode,
    skuExists,
    codeExists,
    getLowStockProducts,
    refetch,
  };
};
