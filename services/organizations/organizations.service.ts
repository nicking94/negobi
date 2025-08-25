import api from "@/utils/api";
import * as OrganizationsRoute from "./organizations.route";
import { OrganizationQueryType, OrganizationType } from "@/types";



export class OrganizationsService {
    static AddOrganizations = async (data: OrganizationType) => await api.post(OrganizationsRoute.addOrganization, data);

    static GetOrganizations = async (data: OrganizationQueryType) => await api.get(OrganizationsRoute.getOrganizations, { params: data });

    static DeleteOrganization = async (id: string) => await api.delete(`${OrganizationsRoute.deleteOrganization}/${id}`);

    static UpdateOrganization = async (id: string, data: OrganizationType) => await api.patch(`${OrganizationsRoute.updateOrganization}/${id}`, data);
}