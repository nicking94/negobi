import { useState, useEffect } from "react";
import {
  productSerialService,
  ProductSerial,
  CreateProductSerialData,
  UpdateProductSerialData,
  ProductSerialStatus,
  GetProductSerialsParams,
} from "../../services/productSerials/productSerials.service";

export interface UseProductSerialsFilters {
  productId?: number;
  serialNumber?: string;
  currentWarehouseId?: number;
  status?: ProductSerialStatus;
  search?: string;
}

export const useProductSerials = (filters: UseProductSerialsFilters = {}) => {
  const [productSerials, setProductSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductSerials = async (
    customFilters?: Partial<UseProductSerialsFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetProductSerialsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      const productSerialsData = await productSerialService.getProductSerials(
        combinedFilters
      );

      if (Array.isArray(productSerialsData)) {
        setProductSerials(productSerialsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", productSerialsData);
        setProductSerials([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar seriales de productos"
      );
      setProductSerials([]);
    } finally {
      setLoading(false);
    }
  };

  const createProductSerial = async (
    productSerialData: CreateProductSerialData
  ): Promise<ProductSerial | null> => {
    try {
      setLoading(true);
      setError(null);
      const newProductSerial = await productSerialService.createProductSerial(
        productSerialData
      );
      setProductSerials((prev) => [...prev, newProductSerial]);
      return newProductSerial;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear serial de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProductSerial = async (
    id: string,
    updates: UpdateProductSerialData
  ): Promise<ProductSerial | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProductSerial =
        await productSerialService.updateProductSerial(id, updates);
      setProductSerials((prev) =>
        prev.map((serial) =>
          serial.id.toString() === id ? updatedProductSerial : serial
        )
      );
      return updatedProductSerial;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar serial de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductSerial = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await productSerialService.deleteProductSerial(id);
      setProductSerials((prev) =>
        prev.filter((serial) => serial.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al eliminar serial de producto"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProductSerialById = async (
    id: string
  ): Promise<ProductSerial | null> => {
    try {
      setLoading(true);
      setError(null);
      const productSerial = await productSerialService.getProductSerialById(id);
      return productSerial;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener serial de producto"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMultipleProductSerials = async (
    productSerialsData: CreateProductSerialData[]
  ): Promise<ProductSerial[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const createdSerials =
        await productSerialService.createMultipleProductSerials(
          productSerialsData
        );
      setProductSerials((prev) => [...prev, ...createdSerials]);
      return createdSerials;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear múltiples seriales de productos"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const changeSerialStatus = async (
    id: string,
    newStatus: ProductSerialStatus
  ): Promise<ProductSerial | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedSerial = await productSerialService.changeSerialStatus(
        id,
        newStatus
      );
      setProductSerials((prev) =>
        prev.map((serial) =>
          serial.id.toString() === id ? updatedSerial : serial
        )
      );
      return updatedSerial;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del serial"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const transferSerialToWarehouse = async (
    id: string,
    warehouseId: number
  ): Promise<ProductSerial | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedSerial =
        await productSerialService.transferSerialToWarehouse(id, warehouseId);
      setProductSerials((prev) =>
        prev.map((serial) =>
          serial.id.toString() === id ? updatedSerial : serial
        )
      );
      return updatedSerial;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al transferir serial"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const isSerialAvailable = async (serialNumber: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const isAvailable = await productSerialService.isSerialAvailable(
        serialNumber
      );
      return isAvailable;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar disponibilidad del serial"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductSerials();
  }, [
    filters.productId,
    filters.serialNumber,
    filters.currentWarehouseId,
    filters.status,
    filters.search,
  ]);

  return {
    productSerials,
    loading,
    error,
    createProductSerial,
    updateProductSerial,
    deleteProductSerial,
    getProductSerialById,
    createMultipleProductSerials,
    changeSerialStatus,
    transferSerialToWarehouse,
    isSerialAvailable,
    refetch: loadProductSerials,
  };
};

export const useProductSerialsByProduct = (productId?: number) => {
  const [productSerials, setProductSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductSerialsByProduct = async (id?: number) => {
    const targetProductId = id || productId;
    if (!targetProductId) {
      setError("productId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const serials = await productSerialService.getProductSerialsByProduct(
        targetProductId
      );
      setProductSerials(serials);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar seriales del producto"
      );
      setProductSerials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductSerialsByProduct();
    }
  }, [productId]);

  return {
    productSerials,
    loading,
    error,
    refetch: loadProductSerialsByProduct,
  };
};

export const useAvailableProductSerials = (productId?: number) => {
  const [availableSerials, setAvailableSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableSerials = async (id?: number) => {
    const targetProductId = id || productId;

    try {
      setLoading(true);
      setError(null);
      const serials = await productSerialService.getAvailableProductSerials(
        targetProductId
      );
      setAvailableSerials(serials);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar seriales disponibles"
      );
      setAvailableSerials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableSerials();
  }, [productId]);

  return {
    availableSerials,
    loading,
    error,
    refetch: loadAvailableSerials,
  };
};

export const useProductSerialsByWarehouse = (warehouseId?: number) => {
  const [warehouseSerials, setWarehouseSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouseSerials = async (id?: number) => {
    const targetWarehouseId = id || warehouseId;
    if (!targetWarehouseId) {
      setError("warehouseId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const serials = await productSerialService.getProductSerialsByWarehouse(
        targetWarehouseId
      );
      setWarehouseSerials(serials);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar seriales del warehouse"
      );
      setWarehouseSerials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) {
      loadWarehouseSerials();
    }
  }, [warehouseId]);

  return {
    warehouseSerials,
    loading,
    error,
    refetch: loadWarehouseSerials,
  };
};

export const useProductSerialsByStatus = (status?: ProductSerialStatus) => {
  const [statusSerials, setStatusSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatusSerials = async (statusParam?: ProductSerialStatus) => {
    const targetStatus = statusParam || status;
    if (!targetStatus) {
      setError("status es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const serials = await productSerialService.getProductSerialsByStatus(
        targetStatus
      );
      setStatusSerials(serials);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar seriales por estado"
      );
      setStatusSerials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      loadStatusSerials();
    }
  }, [status]);

  return {
    statusSerials,
    loading,
    error,
    refetch: loadStatusSerials,
  };
};

export const useSerializedInventory = (productId?: number) => {
  const {
    productSerials,
    loading,
    error,
    refetch,
    createProductSerial,
    updateProductSerial,
    changeSerialStatus,
  } = useProductSerials({ productId });

  const inventoryStats = {
    total: productSerials.length,
    available: productSerials.filter((s) => s.status === "Available").length,
    sold: productSerials.filter((s) => s.status === "Sold").length,
    reserved: productSerials.filter((s) => s.status === "Reserved").length,
    inTransit: productSerials.filter((s) => s.status === "In Transit").length,
    defective: productSerials.filter((s) => s.status === "Defective").length,
  };

  const addSerial = async (
    serialNumber: string,
    warehouseId?: number,
    purchasePrice?: number
  ) => {
    if (!productId) {
      throw new Error("productId es requerido");
    }

    const serialData: CreateProductSerialData = {
      product_id: productId,
      serial_number: serialNumber,
      currentWarehouseId: warehouseId,
      purchase_price: purchasePrice,
      status: "Available",
    };

    return await createProductSerial(serialData);
  };

  const sellSerial = async (serialId: string) => {
    return await changeSerialStatus(serialId, "Sold");
  };

  const reserveSerial = async (serialId: string) => {
    return await changeSerialStatus(serialId, "Reserved");
  };

  const markAsDefective = async (serialId: string) => {
    return await changeSerialStatus(serialId, "Defective");
  };

  const releaseSerial = async (serialId: string) => {
    return await changeSerialStatus(serialId, "Available");
  };

  const getSerialByNumber = (
    serialNumber: string
  ): ProductSerial | undefined => {
    return productSerials.find(
      (serial) => serial.serial_number === serialNumber
    );
  };

  const serialExists = (serialNumber: string): boolean => {
    return productSerials.some(
      (serial) => serial.serial_number === serialNumber
    );
  };

  const getAvailableSerials = (): ProductSerial[] => {
    return productSerials.filter((serial) => serial.status === "Available");
  };

  return {
    productSerials,
    inventoryStats,
    loading,
    error,
    addSerial,
    sellSerial,
    reserveSerial,
    markAsDefective,
    releaseSerial,
    getSerialByNumber,
    serialExists,
    getAvailableSerials,
    refetch,
  };
};

export const useSerialSearch = () => {
  const [searchResults, setSearchResults] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSerials = async (searchTerm: string, productId?: number) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters: GetProductSerialsParams = {
        search: searchTerm,
        itemsPerPage: 10,
      };

      if (productId) {
        filters.productId = productId;
      }

      const results = await productSerialService.getProductSerials(filters);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar seriales");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const validateSerial = async (
    serialNumber: string,
    productId?: number
  ): Promise<{
    isValid: boolean;
    serial?: ProductSerial;
    message: string;
  }> => {
    try {
      setLoading(true);
      setError(null);

      const serial = await productSerialService.getProductSerialBySerialNumber(
        serialNumber
      );

      if (!serial) {
        return {
          isValid: false,
          message: "Serial no encontrado",
        };
      }

      if (productId && serial.product_id !== productId) {
        return {
          isValid: false,
          serial,
          message: "Serial no pertenece al producto especificado",
        };
      }

      if (serial.status !== "Available") {
        return {
          isValid: false,
          serial,
          message: `Serial no disponible. Estado actual: ${serial.status}`,
        };
      }

      return {
        isValid: true,
        serial,
        message: "Serial válido y disponible",
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al validar serial";
      setError(errorMessage);
      return {
        isValid: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    searchSerials,
    validateSerial,
  };
};
