// hooks/suppliers/useGetOneSupplier.ts - VERSIÓN MEJORADA
import { useEffect, useState, useCallback } from "react";
import { SupplierType } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const useGetOneSupplier = (id: number | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierType | null>(null);

  const getSupplierById = useCallback(async () => {
    if (!id) {
      setSupplier(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getSupplierById(id);

      if (response.success && response.data) {
        setSupplier(response.data);
      } else {
        throw new Error("No se pudo obtener el proveedor");
      }
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Error al obtener el proveedor";
      setError(errorMessage);
      console.error("Error fetching supplier:", e);
      setSupplier(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getSupplierById();
  }, [getSupplierById]);

  const refetch = () => {
    getSupplierById();
  };

  return {
    loading,
    error,
    supplier,
    refetch,
  };
};

export default useGetOneSupplier;
