// hooks/companyBranches/useCompanyBranches.ts - MODIFICADO
import { useState, useEffect } from "react";
import {
  companyBranchService,
  CompanyBranch,
  CreateCompanyBranchData,
  UpdateCompanyBranchData,
  GetCompanyBranchesParams,
} from "../../services/companyBranches/companyBranches.service";
import { useUserCompany } from "../auth/useUserCompany";

export interface UseCompanyBranchesFilters {
  search?: string;
  name?: string;
  code?: string;
}

export const useCompanyBranches = (filters: UseCompanyBranchesFilters) => {
  const [companyBranches, setCompanyBranches] = useState<CompanyBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener la empresa del usuario logeado
  const { companyId, isLoading: userCompanyLoading } = useUserCompany();

  const loadCompanyBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si no hay companyId, no cargar sucursales
      if (!companyId || companyId <= 0) {
        console.log("ℹ️ Usuario sin empresa asignada, no se cargan sucursales");
        setCompanyBranches([]);
        return;
      }

      console.log(`🏢 Cargando sucursales para empresa ID: ${companyId}`);

      const params: GetCompanyBranchesParams = {
        page: 1,
        itemsPerPage: 1000,
        companyId: companyId, // Siempre usar la empresa del usuario
      };

      const branchesData = await companyBranchService.getCompanyBranches(
        params
      );
      console.log(
        `✅ Sucursales cargadas: ${branchesData.length} para empresa ${companyId}`
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

  // Crear sucursal - SOLO para la empresa del usuario
  const createCompanyBranch = async (
    branchData: CreateCompanyBranchData
  ): Promise<CompanyBranch | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!hasCompany || !companyId) {
        throw new Error("No tienes una empresa asignada para crear sucursales");
      }

      const branchDataWithUserCompany = {
        ...branchData,
        companyId: companyId,
      };

      const newBranch = await companyBranchService.createCompanyBranch(
        branchDataWithUserCompany
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
    if (companyId && !userCompanyLoading) {
      loadCompanyBranches();
    }
  }, [
    companyId,
    userCompanyLoading,
    filters.search,
    filters.name,
    filters.code,
  ]);

  return {
    companyBranches,
    loading: loading || userCompanyLoading,
    error,
    createCompanyBranch,
    updateCompanyBranch,
    deleteCompanyBranch,
    getCompanyBranchById,
    refetch: loadCompanyBranches,
    userCompanyId: companyId,
  };
};
