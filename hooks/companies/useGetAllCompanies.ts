// hooks/companies/useGetAllCompanies.ts
import { CompaniesService } from "@/services/companies/companies.service";
import { useEffect, useState } from "react";
import { CompanyType } from "@/types";

const useGetAllCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getAllCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Solicitar todas las empresas sin paginación
      const { data } = await CompaniesService.getCompanies({
        page: 1,
        itemsPerPage: 1000,
        search: "",
      });

      const transformedCompanies = data.data.data.map((company: any) => ({
        ...company,
        id: company.id || 0,
        organizationId: company.organizationId || company.id || 0,
        created_at: company.created_at
          ? new Date(company.created_at)
          : new Date(),
      }));

      setCompanies(transformedCompanies);
    } catch (e) {
      console.error("Error fetching companies:", e);
      setError("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCompanies();
  }, []);

  return {
    loading,
    companies,
    error,
    refetch: getAllCompanies,
  };
};

export default useGetAllCompanies;
