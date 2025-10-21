// hooks/suppliers/usePutSupplier.ts - VERSIÓN MEJORADA
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

      console.log("Actualizando proveedor:", { id, supplierData }); // Debug

      const response = await supplierService.updateSupplier(id, supplierData);

      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error("No se pudo actualizar el proveedor");
      }
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Error al actualizar el proveedor";
      setError(errorMessage);
      console.error("Error updating supplier:", e);
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
