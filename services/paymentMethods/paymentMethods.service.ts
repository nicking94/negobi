import api from "../../utils/api";
import {
  PostPaymentMethod,
  GetPaymentMethods,
  PatchPaymentMethod,
  DeletePaymentMethod,
} from "../paymentMethods/paymentMethods.route";

export interface GetPaymentMethodsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  method_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PaymentMethod {
  id: number;
  method_name: string;
  description: string;
  is_active: boolean;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreatePaymentMethodData {
  method_name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePaymentMethodData {
  method_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod;
}

export interface PaymentMethodsListResponse {
  success: boolean;
  data: PaymentMethod[];
}

export interface PaginatedPaymentMethodsResponse {
  success: boolean;
  data: {
    data: PaymentMethod[];
    totalPages: number;
    total: number;
  };
}

export const paymentMethodService = {
  createPaymentMethod: async (
    paymentMethodData: CreatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.post(PostPaymentMethod, paymentMethodData);
    return response.data.data;
  },

  getPaymentMethods: async (
    params?: GetPaymentMethodsParams
  ): Promise<PaymentMethod[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.method_name) {
      queryParams.append("method_name", params.method_name);
    }
    if (params?.description) {
      queryParams.append("description", params.description);
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetPaymentMethods}?${queryParams}`);
    return response.data.data;
  },

  updatePaymentMethod: async (
    id: string,
    updates: UpdatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.patch(`${PatchPaymentMethod}/${id}`, updates);
    return response.data.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`${DeletePaymentMethod}/${id}`);
  },

  getPaymentMethodById: async (id: string): Promise<PaymentMethod> => {
    const response = await api.get(`${GetPaymentMethods}/${id}`);
    return response.data.data;
  },

  getActivePaymentMethods: async (): Promise<PaymentMethod[]> => {
    return paymentMethodService.getPaymentMethods({
      is_active: true,
      itemsPerPage: 10,
    });
  },

  getPaymentMethodByName: async (
    name: string
  ): Promise<PaymentMethod | null> => {
    try {
      const paymentMethods = await paymentMethodService.getPaymentMethods({
        method_name: name,
        itemsPerPage: 1,
      });
      return paymentMethods.length > 0 ? paymentMethods[0] : null;
    } catch (error) {
      console.error("Error fetching payment method by name:", error);
      return null;
    }
  },

  getCommonPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const commonMethods = [
      { method_name: "Efectivo", description: "Pago en efectivo" },
      {
        method_name: "Tarjeta de Crédito",
        description: "Pago con tarjeta de crédito",
      },
      {
        method_name: "Tarjeta de Débito",
        description: "Pago con tarjeta de débito",
      },
      {
        method_name: "Transferencia Bancaria",
        description: "Transferencia bancaria",
      },
      { method_name: "Cheque", description: "Pago con cheque" },
      { method_name: "Depósito", description: "Depósito bancario" },
    ];

    const existingMethods =
      await paymentMethodService.getActivePaymentMethods();
    const results: PaymentMethod[] = [];

    for (const commonMethod of commonMethods) {
      const existing = existingMethods.find(
        (method) =>
          method.method_name.toLowerCase() ===
          commonMethod.method_name.toLowerCase()
      );

      if (existing) {
        results.push(existing);
      } else {
        try {
          const newMethod = await paymentMethodService.createPaymentMethod({
            ...commonMethod,
            is_active: true,
          });
          results.push(newMethod);
        } catch (error) {
          console.error(
            `Error creating payment method ${commonMethod.method_name}:`,
            error
          );
        }
      }
    }

    return results;
  },
};
