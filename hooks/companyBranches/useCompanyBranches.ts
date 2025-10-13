import { useState, useEffect } from "react";
import {
  companyBranchService,
  CompanyBranch,
  CreateCompanyBranchData,
  UpdateCompanyBranchData,
  GetCompanyBranchesParams,
} from "../../services/companyBranches/companyBranches.service";

export interface UseCompanyBranchesFilters {
  companyId: number;
  search?: string;
  name?: string;
  code?: string;
}

export const useCompanyBranches = (filters: UseCompanyBranchesFilters) => {
  const [companyBranches, setCompanyBranches] = useState<CompanyBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyBranches = async (
    customFilters?: Partial<UseCompanyBranchesFilters>
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Si no hay companyId, no cargar nada
      if (!filters.companyId && !customFilters?.companyId) {
        setCompanyBranches([]);
        return;
      }

      const combinedFilters: GetCompanyBranchesParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 100,
      };

      console.log("🔵 Enviando parámetros para sucursales:", combinedFilters);

      const branchesData = await companyBranchService.getCompanyBranches(
        combinedFilters
      );

      if (Array.isArray(branchesData)) {
        setCompanyBranches(branchesData);
      } else {
        setCompanyBranches([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar sucursales"
      );
      setCompanyBranches([]);
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

  // Eliminar sucursal
  const deleteCompanyBranch = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await companyBranchService.deleteCompanyBranch(id);
      setCompanyBranches((prev) =>
        prev.filter((branch) => branch.id.toString() !== id)
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar sucursal"
      );
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
    loadCompanyBranches();
  }, [filters.companyId, filters.search]);

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
