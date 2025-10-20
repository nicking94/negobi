// services/clients/clients.service.ts
import { Client } from "@/app/dashboard/masters/clients/page";
import * as ClientsRoute from "./clients.routes";
import api from "@/utils/api";
import { ClientTypesResponse, ClientType } from "@/types";

interface ClientsQueryType {
  search?: string;
  page?: number;
  itemsPerPage?: number;
  companyId?: number;
  order?: string;
  legal_name?: string;
  salespersonUserId?: string;
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

    const response = await api.get(ClientsRoute.GetClients, {
      params: cleanQuery,
    });

    return response;
  }

  static async getClient(id: string) {
    return await api.get(`${ClientsRoute.GetClients}/${id}`);
  }

  static async addClient(data: Client) {
    return await api.post(ClientsRoute.PostClient, data);
  }

  static async updateClient(id: string, data: Partial<Client>) {
    const response = await api.patch(`${ClientsRoute.GetClients}/${id}`, data);

    return response;
  }

  static async deleteClient(id: string) {
    return await api.delete(`${ClientsRoute.GetClients}/${id}`);
  }

  static async getClientTypes(): Promise<ClientTypesResponse> {
    try {
      const response = await api.get(ClientsRoute.GetClientTypes);

      return response.data;
    } catch (error) {
      console.error("Error fetching client types:", error);
      throw error;
    }
  }

  static async getClientType(
    id: number
  ): Promise<{ success: boolean; data: ClientType }> {
    try {
      const response = await api.get(`${ClientsRoute.GetClientTypes}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client type ${id}:`, error);
      throw error;
    }
  }
}
