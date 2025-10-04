// services/clients/clients.service.ts
import { Client } from "@/app/dashboard/masters/clients/page";
import * as ClientsRoute from "./clients.routes";
import api from "@/utils/api";

interface ClientsQueryType {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  companyId?: number;
  order?: string;
  legal_name?: string;
}

export class ClientsService {
  static async getClients(query: ClientsQueryType = {}) {
    const cleanQuery: Record<string, any> = {};

    Object.entries(query).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all" &&
        !(typeof value === "boolean" && value === false)
      ) {
        cleanQuery[key] = value;
      }
    });

    console.log("Clean query parameters:", cleanQuery);

    return await api.get(ClientsRoute.GetClients, { params: cleanQuery });
  }

  static async getClient(id: string) {
    return await api.get(`${ClientsRoute.GetClients}/${id}`);
  }

  static async addClient(data: Client) {
    return await api.post(ClientsRoute.PostClient, data);
  }

  static async updateClient(id: string, data: Partial<Client>) {
    console.log(`Making PATCH request to: ${ClientsRoute.GetClients}/${id}`);
    console.log("Update data:", data);

    const response = await api.patch(`${ClientsRoute.GetClients}/${id}`, data);

    console.log("Update response status:", response.status);
    console.log("Update response data:", response.data);

    return response;
  }

  static async deleteClient(id: string) {
    return await api.delete(`${ClientsRoute.GetClients}/${id}`);
  }
}
