// hooks/companies/useGetCompanyById.ts
import { useState } from "react";
import { CompaniesService } from "@/services/companies/companies.service";
import { CompanyType } from "@/types";

const useGetCompanyById = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCompanyById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await CompaniesService.getCompanyById(id);

      if (data.success) {
        const company = data.data;

        const transformedCompany: CompanyType = {
          ...company,
          id: company.id || 0,
          organizationId: company.organizationId || company.id || 0,
          admin_first_name: company.admin_first_name || "",
          admin_last_name: company.admin_last_name || "",
          admin_username: company.admin_username || "",
          admin_email: company.admin_email || "",
          admin_phone: company.admin_phone || "",
          admin_password: company.admin_password || "",
          created_at: company.created_at
            ? new Date(company.created_at)
            : new Date(),
        };

        return transformedCompany;
      } else {
        throw new Error(data.message || "Error al obtener la empresa");
      }
    } catch (err) {
      console.error("Error fetching company by id:", err);
      setError("Error al cargar los detalles de la empresa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getCompanyById,
    loading,
    error,
  };
};

export default useGetCompanyById;
