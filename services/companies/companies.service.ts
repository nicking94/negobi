// services/companies/companies.service.ts
import * as CompaniesRoutes from "./companies.route";
import api from "@/utils/api";
import { NewCompanyType, OrganizationQueryType } from "@/types";

export class CompaniesService {
  static createCompany = async (data: NewCompanyType) =>
    await api.post(CompaniesRoutes.PostCompanies, data);

  static getCompanies = async (querys: OrganizationQueryType) =>
    await api.get(CompaniesRoutes.GetCompanies, { params: querys });

  // AGREGAR ESTE MÉTODO
  static getCompanyById = async (id: string) =>
    await api.get(`${CompaniesRoutes.GetCompanies}/${id}`);

  static patchCompany = async (id: string, data: Partial<NewCompanyType>) =>
    await api.patch(`${CompaniesRoutes.PatchCompanies}/${id}`, data);

  static deleteCompany = async (id: string) =>
    await api.delete(`${CompaniesRoutes.DeleteCompany}/${id}`);
}
