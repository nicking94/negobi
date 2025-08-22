import { CompaniesService } from "@/services/companies/companies.service";
import { NewCompanyType } from "@/services/companies/types";
import { useState } from "react";


const useAddCompanies = () => {
    const [loading, setLoading] = useState(false);
    const newCompany = async (params: NewCompanyType) => {
        try {
            setLoading(true);
            const { data, status } = await CompaniesService.createCompany(params);
            return { data, status };
        } catch (e: unknown) {
            if (e instanceof Error) {
                return e.message;
            } else {
                return "Error desconocido";
            }
        } finally {
            setLoading(false);
        }
    };
    return { newCompany, loading };
};
export default useAddCompanies;