import { supplierService } from "@/services/suppliers/suppliers.service";
import { useState } from "react";

const useDeleteSupplier = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ message: string } | null>(null);

  const deleteSupplier = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.deleteSupplier(id);
      setData(response.data);
      return response.data;
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Error al eliminar el proveedor";
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteSupplier,
    loading,
    error,
    data,
  };
};

export default useDeleteSupplier;
