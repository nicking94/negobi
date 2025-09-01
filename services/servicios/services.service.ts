import { Service } from '@/app/dashboard/masters/services/page';
import * as ServicesRoutes from './services.route'
import api from '@/utils/api'
import { OrganizationQueryType } from '@/types';

export class ServiceService {
    static postService = async (data: Service) =>
        await api.post(ServicesRoutes.addService, data);

    static getServices = async (data: OrganizationQueryType) => await api.get(ServicesRoutes.getServices, { params: data });

    static patchService = async (id: string, data: Partial<Service>) =>
        await api.patch(`${ServicesRoutes.patchService}/${id}`, data);

    static deleteService = async (id: string) =>
        await api.delete(`${ServicesRoutes.deleteService}/${id}`);
}
