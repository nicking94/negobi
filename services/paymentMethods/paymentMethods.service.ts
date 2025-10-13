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
  // Campos del response (GET)
  id: number;
  method_name: string;
  description: string;
  is_active: boolean;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreatePaymentMethodData {
  // Campos requeridos para crear un método de pago
  method_name: string;

  // Campos opcionales para creación
  description?: string;
  is_active?: boolean;
}

export interface UpdatePaymentMethodData {
  // Todos los campos son opcionales para actualización
  method_name?: string;
  description?: string;
  is_active?: boolean;
}

// Response interfaces
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
  // Crear un nuevo método de pago
  createPaymentMethod: async (
    paymentMethodData: CreatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.post(PostPaymentMethod, paymentMethodData);
    return response.data.data;
  },

  // Obtener todos los métodos de pago
  getPaymentMethods: async (
    params?: GetPaymentMethodsParams
  ): Promise<PaymentMethod[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
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

  // Actualizar un método de pago
  updatePaymentMethod: async (
    id: string,
    updates: UpdatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.patch(`${PatchPaymentMethod}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un método de pago
  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`${DeletePaymentMethod}/${id}`);
  },

  // Obtener un método de pago por ID
  getPaymentMethodById: async (id: string): Promise<PaymentMethod> => {
    const response = await api.get(`${GetPaymentMethods}/${id}`);
    return response.data.data;
  },

  // Métodos adicionales útiles
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

  // Métodos predefinidos comunes
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

    // Verificar si existen, si no crearlos
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
