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

  // Función principal para cargar sucursales
  const loadCompanyBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetCompanyBranchesParams = {
        page: 1,
        itemsPerPage: 1000,
      };

      if (filters.companyId > 0) {
        params.companyId = filters.companyId;
      }

      if (filters.search) params.search = filters.search;
      if (filters.name) params.name = filters.name;
      if (filters.code) params.code = filters.code;

      const branchesData = await companyBranchService.getCompanyBranches(
        params
      );

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

  // Función para cargar sucursales de múltiples empresas (si necesitas esta funcionalidad)
  const loadAllCompanyBranches = async (companyIds: number[]) => {
    try {
      setLoading(true);
      setError(null);

      const allBranches: CompanyBranch[] = [];

      for (const companyId of companyIds) {
        try {
          const branchesData = await companyBranchService.getCompanyBranches({
            companyId: companyId,
            page: 1,
            itemsPerPage: 1000,
          });

          if (Array.isArray(branchesData)) {
            allBranches.push(...branchesData);
          }
        } catch (err) {
          console.error(
            `Error cargando sucursales de empresa ${companyId}:`,
            err
          );
        }
      }

      setCompanyBranches(allBranches);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar sucursales";
      setError(errorMessage);
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
    loadAllCompanyBranches, // Exportar la nueva función si la necesitas
  };
};
