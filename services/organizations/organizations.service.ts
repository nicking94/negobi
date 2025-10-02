import api from "@/utils/api";
import * as OrganizationsRoute from "./organizations.route";
import {
  OrganizationPayload,
  OrganizationQueryType,
  OrganizationType,
} from "@/types";

// services/organizations/organizations.service.ts
export class OrganizationsService {
  static AddOrganizations = async (data: OrganizationType) =>
    await api.post(OrganizationsRoute.addOrganization, data);

  static GetOrganizations = async (data: OrganizationQueryType) =>
    await api.get(OrganizationsRoute.getOrganizations, { params: data });

  static DeleteOrganization = async (id: string) =>
    await api.delete(`${OrganizationsRoute.deleteOrganization}/${id}`);
  static async UpdateOrganization(id: number, data: OrganizationPayload) {
    const payload = {
      name: data.name,
      contact_email: data.contact_email,
      legal_tax_id: data.legal_tax_id,
      main_phone: data.main_phone,
    };

    return await api.patch(`/organizations/${id}`, payload);
  }
}
