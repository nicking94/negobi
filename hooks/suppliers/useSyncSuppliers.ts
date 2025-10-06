import { useState } from "react";

import { SupplierSyncPayload } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const useSyncSuppliers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ message: string } | null>(null);

  const syncSuppliers = async (syncData: SupplierSyncPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.syncSuppliers(syncData);
      setData(response.data);
      return response.data;
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "Error al sincronizar proveedores";
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    syncSuppliers,
    loading,
    error,
    data,
  };
};

export default useSyncSuppliers;
