import { useEffect, useState, useCallback } from "react";

import { SupplierType } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const useGetOneSupplier = (id: number | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<SupplierType | null>(null);
  const [modified, setModified] = useState(false);

  const getSupplierById = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getSupplierById(id);
      setSupplier(response.data);
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Error al obtener el proveedor";
      setError(errorMessage);
      console.error("Error fetching supplier:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getSupplierById();
  }, [id, modified, getSupplierById]);

  return {
    loading,
    error,
    supplier,
    setModified,
    refetch: getSupplierById,
  };
};

export default useGetOneSupplier;
