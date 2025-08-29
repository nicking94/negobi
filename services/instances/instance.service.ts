import api from "@/utils/api";
import * as InstancesRoutes from "./instances.route";
import { InstanceQueryType, InstanceType } from "./types";


export class InstancesServices {
    static AddInstance = async (data: InstanceType) => await api.post(InstancesRoutes.AddInstance, data);

    static GetInstances = async (query: InstanceQueryType) => await api.get(InstancesRoutes.GetInstances, { params: query })

    static PatchInstance = async (id: string, data: InstanceType) => await api.patch(`${InstancesRoutes.PatchInstance}/${id}`, data)

    static DeleteInstance = async (id: string) => await api.delete(`${InstancesRoutes.DeleteInstance}/${id}`)

}