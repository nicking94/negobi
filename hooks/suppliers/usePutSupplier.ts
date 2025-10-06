import { useState } from "react";
import { SupplierUpdatePayload, SupplierType } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const usePutSupplier = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SupplierType | null>(null);

  const updateSupplier = async (
    id: number,
    supplierData: SupplierUpdatePayload
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.updateSupplier(id, supplierData);
      setData(response.data);
      return response.data;
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Error al actualizar el proveedor";
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateSupplier,
    loading,
    error,
    data,
  };
};

export default usePutSupplier;
