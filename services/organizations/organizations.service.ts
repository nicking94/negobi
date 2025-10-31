// services/organizations/organizations.service.ts
import * as OrganizationsRoutes from "./organizations.route";
import api from "@/utils/api";
import { OrganizationPayload } from "@/types";

export interface OrganizationFilters {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  name?: string;
}

export class OrganizationsService {
  static createOrganization = async (data: OrganizationPayload) =>
    await api.post(OrganizationsRoutes.PostOrganizations, data);

  static getOrganizations = async (querys: OrganizationFilters) => {
    const cleanQuerys = Object.fromEntries(
      Object.entries(querys).filter(([value]) => value !== undefined)
    );

    try {
      const response = await api.get(OrganizationsRoutes.GetOrganizations, {
        params: cleanQuerys,
      });
      return response;
    } catch (error) {
      console.error("🔍 [OrganizationsService] Error:", error);
      throw error;
    }
  };

  static getOrganization = async (id: string) =>
    await api.get(`${OrganizationsRoutes.GetOrganization}/${id}`);

  static patchOrganization = async (
    id: string,
    data: Partial<OrganizationPayload>
  ) => await api.patch(`${OrganizationsRoutes.PatchOrganization}/${id}`, data);

  static deleteOrganization = async (id: string) =>
    await api.delete(`${OrganizationsRoutes.DeleteOrganization}/${id}`);
}
