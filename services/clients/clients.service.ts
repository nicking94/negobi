import { Client } from "@/app/dashboard/masters/clients/page";
import * as ClientsRoute from "./clients.routes";
import api from "@/utils/api";


export class ClientsService {
    //    static async getClients() {
    //      return await api.get(ClientsRoute.GetClients);
    //    }

    //    static async getClientById(id: string) {
    //      return await api.get(`${ClientsRoute.GetClients}/${id}`);
    //    }

    static async addClient(data: Client) {
        return await api.post(ClientsRoute.PostClient, data);
    }

    //    static async updateClient(id: string, data: any) {
    //      return await api.put(`${ClientsRoute.GetClients}/${id}`, data);
    //    }

    //    static async deleteClient(id: string) {
    //      return await api.delete(`${ClientsRoute.GetClients}/${id}`);
}
