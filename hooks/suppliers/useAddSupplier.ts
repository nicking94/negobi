import { useState } from "react";
import { SupplierCreatePayload, SupplierType } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const useAddSupplier = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SupplierType | null>(null);

  const createSupplier = async (supplierData: SupplierCreatePayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.createSupplier(supplierData);
      setData(response.data);
      return response.data;
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Error al crear el proveedor";
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSupplier,
    loading,
    error,
    data,
  };
};

export default useAddSupplier;
