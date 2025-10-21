// hooks/companies/useGetCompaniesForSelect.ts - VERSIÓN MEJORADA
import { useEffect, useState } from "react";
import useGetAllCompanies from "./useGetAllCompanies";

interface CompanyOption {
  value: string;
  label: string;
}

const useGetCompaniesForSelect = () => {
  const { companies, loading, error, refetch } = useGetAllCompanies();
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);

  useEffect(() => {
    if (companies && companies.length > 0) {
      const options = companies
        .filter((company) => company.id && company.name) // Solo compañías válidas
        .map((company) => ({
          value: company.id.toString(),
          label: company.name || `Compañía ${company.id}`,
        }));
      setCompanyOptions(options);
    } else {
      setCompanyOptions([]);
    }
  }, [companies]);

  return {
    companyOptions,
    loading,
    error,
    refetch,
    companies,
  };
};

export default useGetCompaniesForSelect;
