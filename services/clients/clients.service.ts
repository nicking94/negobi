// services/clients/clients.service.ts
import { Client } from "@/app/dashboard/masters/clients/page";
import * as ClientsRoute from "./clients.routes";
import api from "@/utils/api";

interface ClientsQueryType {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  salespersonUserId?: string;
  companyId?: number;
  order?: string;
  legal_name?: string;
}

export class ClientsService {
  static async getClients(query: ClientsQueryType) {
    // Limpia los parámetros undefined
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );
    return await api.get(ClientsRoute.GetClients, { params: cleanQuery });
  }

  static async addClient(data: Client) {
    return await api.post(ClientsRoute.PostClient, data);
  }

  static async updateClient(id: string, data: Partial<Client>) {
    return await api.patch(`${ClientsRoute.GetClients}/${id}`, data);
  }

  static async deleteClient(id: string) {
    return await api.delete(`${ClientsRoute.GetClients}/${id}`);
  }
}
