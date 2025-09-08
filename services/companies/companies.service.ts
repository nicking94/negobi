import * as CompaniesRoutes from "./companies.route"
import api from "@/utils/api"
import { NewCompanyType } from "./types";
import { OrganizationQueryType } from "@/types";


export class CompaniesService {
    static createCompany = async (data: NewCompanyType) => await api.post(CompaniesRoutes.PostCompanies, data);

    static getCompanies = async (querys: OrganizationQueryType) => await api.get(CompaniesRoutes.GetCompanies, { params: querys });

    static patchCompany = async (id: string, data: Partial<NewCompanyType>) => await api.patch(`${CompaniesRoutes.PatchCompanies}/${id}`, data);
}

