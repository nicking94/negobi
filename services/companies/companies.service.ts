import * as CompaniesRoutes from "./companies.route"
import api from "@/utils/api"
import { NewCompanyType } from "./types";


export class CompaniesService {
    static createCompany = async (data: NewCompanyType) => await api.post(CompaniesRoutes.PostCompanies, data);
}

