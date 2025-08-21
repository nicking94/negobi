import api from "@/utils/api";
import * as InstancesRoutes from "./instances.route";
import { InstanceType } from "./types";


export class InstancesServices {
    static AddInstance = async (data: InstanceType) => await api.post(InstancesRoutes.AddInstance, data);
}