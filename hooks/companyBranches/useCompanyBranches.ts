import { useState, useEffect } from "react";
import {
  companyBranchService,
  CompanyBranch,
  CreateCompanyBranchData,
  UpdateCompanyBranchData,
  GetCompanyBranchesParams,
} from "../../services/companyBranches/companyBranches.service";

export interface UseCompanyBranchesFilters {
  companyId: number | null;
  search?: string;
  name?: string;
  code?: string;
}

export const useCompanyBranches = (filters: UseCompanyBranchesFilters) => {
  const [companyBranches, setCompanyBranches] = useState<CompanyBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // En useCompanyBranches.ts - función loadCompanyBranches
  const loadCompanyBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filters.companyId || filters.companyId <= 0) {
        console.log("🔄 No hay companyId, no cargando sucursales");
        setCompanyBranches([]);
        return;
      }

      const params: GetCompanyBranchesParams = {
        page: 1,
        itemsPerPage: 1000,
        companyId: filters.companyId,
      };

      console.log("🔄 Cargando sucursales para empresa:", filters.companyId);
      const branchesData = await companyBranchService.getCompanyBranches(
        params
      );

      console.log("✅ Sucursales cargadas RAW:", branchesData);

      // ✅ NUEVO: Verificar estructura de las sucursales
      if (branchesData.length > 0) {
        console.log("🔍 Primera sucursal detallada:", {
          id: branchesData[0].id,
          name: branchesData[0].name,
          companyId: branchesData[0].companyId,
          allKeys: Object.keys(branchesData[0]),
        });
      }

      setCompanyBranches(branchesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar sucursales";
      setError(errorMessage);
      setCompanyBranches([]);
      console.error("❌ Error cargando sucursales:", err);
    } finally {
      setLoading(false);
    }
  };

  // Crear sucursal
  const createCompanyBranch = async (
    branchData: CreateCompanyBranchData
  ): Promise<CompanyBranch | null> => {
    try {
      setLoading(true);
      setError(null);
      const newBranch = await companyBranchService.createCompanyBranch(
        branchData
      );
      setCompanyBranches((prev) => [...prev, newBranch]);
      return newBranch;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear sucursal");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar sucursal
  const updateCompanyBranch = async (
    id: string,
    updates: UpdateCompanyBranchData
  ): Promise<CompanyBranch | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedBranch = await companyBranchService.updateCompanyBranch(
        id,
        updates
      );
      setCompanyBranches((prev) =>
        prev.map((branch) =>
          branch.id.toString() === id ? updatedBranch : branch
        )
      );
      return updatedBranch;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar sucursal"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar sucursal - CORREGIDO
  const deleteCompanyBranch = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await companyBranchService.deleteCompanyBranch(id);

      // Corrección: eliminar la sucursal que coincide con el ID
      setCompanyBranches(
        (prev) => prev.filter((branch) => branch.id.toString() !== id) // Cambiado !== en lugar de ===
      );

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar sucursal";
      setError(errorMessage);
      console.error("💥 Error en deleteCompanyBranch:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener sucursal por ID
  const getCompanyBranchById = async (
    id: string
  ): Promise<CompanyBranch | null> => {
    try {
      setLoading(true);
      setError(null);
      const branch = await companyBranchService.getCompanyBranchById(id);
      return branch;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener sucursal"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.companyId) {
      loadCompanyBranches();
    }
  }, [filters.companyId, filters.search, filters.name, filters.code]);

  return {
    companyBranches,
    loading,
    error,
    createCompanyBranch,
    updateCompanyBranch,
    deleteCompanyBranch,
    getCompanyBranchById,
    refetch: loadCompanyBranches,
  };
};
