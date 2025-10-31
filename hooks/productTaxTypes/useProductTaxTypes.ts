import { useState, useEffect } from "react";
import {
  productTaxTypeService,
  ProductTaxType,
  CreateProductTaxTypeData,
  UpdateProductTaxTypeData,
  GetProductTaxTypesParams,
  SyncProductTaxTypesPayload,
  SyncResponse,
} from "../../services/productTaxTypes/productTaxTypes.service";

export interface UseProductTaxTypesFilters {
  productId?: number;
  taxTypeId?: number;
  is_active?: boolean;
  search?: string;
}

export const useProductTaxTypes = (filters: UseProductTaxTypesFilters = {}) => {
  const [productTaxTypes, setProductTaxTypes] = useState<ProductTaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductTaxTypes = async (
    customFilters?: Partial<UseProductTaxTypesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetProductTaxTypesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const productTaxTypesData =
        await productTaxTypeService.getProductTaxTypes(combinedFilters);

      if (Array.isArray(productTaxTypesData)) {
        setProductTaxTypes(productTaxTypesData);
      } else {
        console.warn("⚠️ Estructura inesperada:", productTaxTypesData);
        setProductTaxTypes([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar relaciones producto-impuesto"
      );
      setProductTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const createProductTaxType = async (
    productTaxTypeData: CreateProductTaxTypeData
  ): Promise<ProductTaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const newProductTaxType =
        await productTaxTypeService.createProductTaxType(productTaxTypeData);
      setProductTaxTypes((prev) => [...prev, newProductTaxType]);
      return newProductTaxType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear relación producto-impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProductTaxType = async (
    id: string,
    updates: UpdateProductTaxTypeData
  ): Promise<ProductTaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProductTaxType =
        await productTaxTypeService.updateProductTaxType(id, updates);
      setProductTaxTypes((prev) =>
        prev.map((relation) =>
          relation.id.toString() === id ? updatedProductTaxType : relation
        )
      );
      return updatedProductTaxType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar relación producto-impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductTaxType = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productTaxTypeService.deleteProductTaxType(id);
      setProductTaxTypes((prev) =>
        prev.filter((relation) => relation.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar relación producto-impuesto"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProductTaxTypeById = async (
    id: string
  ): Promise<ProductTaxType | null> => {
    try {
      setLoading(true);
      setError(null);
      const productTaxType = await productTaxTypeService.getProductTaxTypeById(
        id
      );
      return productTaxType;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener relación producto-impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncProductTaxTypes = async (
    syncData: SyncProductTaxTypesPayload
  ): Promise<SyncResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await productTaxTypeService.syncProductTaxTypes(
        syncData
      );

      await loadProductTaxTypes();
      return response;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al sincronizar relaciones producto-impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTaxRateForProduct = async (
    productId: number,
    taxTypeId: number
  ): Promise<number | null> => {
    try {
      setLoading(true);
      setError(null);
      const taxRate = await productTaxTypeService.getTaxRateForProduct(
        productId,
        taxTypeId
      );
      return taxRate;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener tasa de impuesto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignTaxTypesToProduct = async (
    productId: number,
    taxTypeIds: number[],
    taxRates?: { [taxTypeId: number]: number }
  ): Promise<ProductTaxType[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdRelations =
        await productTaxTypeService.assignTaxTypesToProduct(
          productId,
          taxTypeIds,
          taxRates
        );
      setProductTaxTypes((prev) => [...prev, ...createdRelations]);
      return createdRelations;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al asignar impuestos al producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeAllTaxTypesFromProduct = async (
    productId: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productTaxTypeService.removeAllTaxTypesFromProduct(productId);

      setProductTaxTypes((prev) =>
        prev.filter((relation) => relation.productId !== productId)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al remover impuestos del producto"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductTaxTypes();
  }, [filters.productId, filters.taxTypeId, filters.is_active, filters.search]);

  return {
    productTaxTypes,
    loading,
    error,
    createProductTaxType,
    updateProductTaxType,
    deleteProductTaxType,
    getProductTaxTypeById,
    syncProductTaxTypes,
    getTaxRateForProduct,
    assignTaxTypesToProduct,
    removeAllTaxTypesFromProduct,
    refetch: loadProductTaxTypes,
  };
};

export const useProductTaxTypesByProduct = (productId?: number) => {
  const [productTaxTypes, setProductTaxTypes] = useState<ProductTaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductTaxTypesByProduct = async (id?: number) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taxTypes = await productTaxTypeService.getProductTaxTypesByProduct(
        targetProductId
      );
      setProductTaxTypes(taxTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar impuestos del producto"
      );
      setProductTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductTaxTypesByProduct();
    }
  }, [productId]);

  return {
    productTaxTypes,
    loading,
    error,
    refetch: loadProductTaxTypesByProduct,
  };
};

export const useProductTaxTypesByTaxType = (taxTypeId?: number) => {
  const [productTaxTypes, setProductTaxTypes] = useState<ProductTaxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductTaxTypesByTaxType = async (id?: number) => {
    const targetTaxTypeId = id || taxTypeId;
    if (!targetTaxTypeId) {
      setError("taxTypeId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taxTypes = await productTaxTypeService.getProductTaxTypesByTaxType(
        targetTaxTypeId
      );
      setProductTaxTypes(taxTypes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar productos del tipo de impuesto"
      );
      setProductTaxTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taxTypeId) {
      loadProductTaxTypesByTaxType();
    }
  }, [taxTypeId]);

  return {
    productTaxTypes,
    loading,
    error,
    refetch: loadProductTaxTypesByTaxType,
  };
};

export const useProductTaxManager = (productId?: number) => {
  const {
    productTaxTypes,
    loading,
    error,
    refetch,
    createProductTaxType,
    deleteProductTaxType,
    assignTaxTypesToProduct,
    removeAllTaxTypesFromProduct,
  } = useProductTaxTypes({ productId });

  const addTaxType = async (taxTypeId: number, taxRate?: number) => {
    if (!productId) {
      throw new Error("productId es requerido");
    }

    const relationData: CreateProductTaxTypeData = {
      productId,
      taxTypeId,
      tax_rate_override: taxRate,
    };

    return await createProductTaxType(relationData);
  };

  const removeTaxType = async (relationId: string) => {
    return await deleteProductTaxType(relationId);
  };

  const replaceAllTaxTypes = async (
    taxTypeIds: number[],
    taxRates?: { [taxTypeId: number]: number }
  ) => {
    if (!productId) {
      throw new Error("productId es requerido");
    }

    await removeAllTaxTypesFromProduct(productId);

    return await assignTaxTypesToProduct(productId, taxTypeIds, taxRates);
  };

  const hasTaxType = (taxTypeId: number): boolean => {
    return productTaxTypes.some((relation) => relation.taxTypeId === taxTypeId);
  };

  const getTaxRate = (taxTypeId: number): number | null => {
    const relation = productTaxTypes.find((rel) => rel.taxTypeId === taxTypeId);
    return relation ? relation.tax_rate : null;
  };

  return {
    productTaxTypes,
    loading,
    error,
    addTaxType,
    removeTaxType,
    replaceAllTaxTypes,
    hasTaxType,
    getTaxRate,
    refetch,
  };
};

export const useProductTaxCalculator = (productId?: number) => {
  const { productTaxTypes, loading, error } =
    useProductTaxTypesByProduct(productId);

  const calculateTaxes = (
    amount: number
  ): {
    taxTypeId: number;
    taxAmount: number;
    totalWithTax: number;
  }[] => {
    if (!productTaxTypes.length) return [];

    return productTaxTypes.map((relation) => {
      const taxAmount = amount * (relation.tax_rate / 100);
      const totalWithTax = amount + taxAmount;

      return {
        taxTypeId: relation.taxTypeId!,
        taxAmount,
        totalWithTax,
      };
    });
  };

  const calculateTotalWithTaxes = (amount: number): number => {
    const taxes = calculateTaxes(amount);
    return taxes.reduce((total, tax) => total + tax.taxAmount, amount);
  };

  const getTotalTaxRate = (): number => {
    return productTaxTypes.reduce(
      (total, relation) => total + relation.tax_rate,
      0
    );
  };

  return {
    calculateTaxes,
    calculateTotalWithTaxes,
    getTotalTaxRate,
    productTaxTypes,
    loading,
    error,
  };
};
