// hooks/products/useProductsForSelection.ts
import { useState, useEffect, useMemo } from "react";
import { productService, Product } from "@/services/products/products.service";
import { useUserCompany } from "@/hooks/auth/useUserCompany";

export const useProductsForSelection = () => {
  const { companyId, selectedCompanyId } = useUserCompany();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetCompanyId = selectedCompanyId || companyId;

  const loadProducts = async () => {
    if (!targetCompanyId) {
      console.warn("⚠️ No hay companyId disponible para cargar productos");
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getProducts({
        companyId: targetCompanyId,
        is_active: true,
        itemsPerPage: 1000,
      });

      setProducts(productsData.data || []);
    } catch (err) {
      console.error("❌ Error loading products:", err);
      setError("Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetCompanyId) {
      loadProducts();
    } else {
      console.warn(
        "⚠️ targetCompanyId no disponible, no se cargarán productos"
      );
      setProducts([]);
    }
  }, [targetCompanyId]);

  const productOptions = useMemo(() => {
    const options = products
      .filter((product) => product.id != null && product.is_active)
      .map((product) => ({
        value: product.id!.toString(),
        label: `${product.product_name} - ${product.code}`,
        data: product,
      }));

    return options;
  }, [products]);

  return {
    products,
    productOptions,
    loading,
    error,
    refetch: loadProducts,
  };
};
