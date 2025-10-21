// hooks/suppliers/useDeleteSupplier.ts - VERSIÓN MEJORADA
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

      console.log("Eliminando proveedor:", id); // Debug

      const response = await supplierService.deleteSupplier(id);

      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error("No se pudo eliminar el proveedor");
      }
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Error al eliminar el proveedor";
      setError(errorMessage);
      console.error("Error deleting supplier:", e);
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
