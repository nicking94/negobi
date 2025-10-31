import api from "../../utils/api";
import {
  PostPayment,
  GetPayments,
  PatchPayment,
  DeletePayment,
} from "../payments/payments.route";

export interface GetPaymentsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  clientId?: number;
  payment_type?: PaymentType;
  invoice_id?: number;
  operation_type_id?: number;
  payment_date?: string;
  payment_amount?: number;
  paymentCurrencyId?: number;
  paymentMethodId?: number;
  bankAccountId?: number;
  reference_number?: string;
  supplierId?: number;
}

export type PaymentType = "supplier_payment" | "client_payment";

export interface Payment {
  id: number;
  payment_type: PaymentType;
  invoice_id: number;
  operation_type_id: number;
  payment_date: string;
  payment_amount: number;
  exchange_rate_used: number;
  reference_number: string;
  notes: string;
  clientId?: number;
  paymentCurrencyId?: number;
  paymentMethodId?: number;
  bankAccountId?: number;
  supplierId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreatePaymentData {
  payment_type: PaymentType;
  payment_date: string;
  payment_amount: number;
  clientId?: number;
  invoice_id?: number;
  operation_type_id?: number;
  paymentCurrencyId?: number;
  exchange_rate_used?: number;
  paymentMethodId?: number;
  bankAccountId?: number;
  reference_number?: string;
  notes?: string;
  supplierId?: number;
}

export interface UpdatePaymentData {
  clientId?: number;
  payment_type?: PaymentType;
  invoice_id?: number;
  operation_type_id?: number;
  payment_date?: string;
  payment_amount?: number;
  paymentCurrencyId?: number;
  exchange_rate_used?: number;
  paymentMethodId?: number;
  bankAccountId?: number;
  reference_number?: string;
  notes?: string;
  supplierId?: number;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
}

export interface PaymentsListResponse {
  success: boolean;
  data: Payment[];
}

export interface PaginatedPaymentsResponse {
  success: boolean;
  data: {
    data: Payment[];
    totalPages: number;
    total: number;
  };
}

export const paymentService = {
  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await api.post(PostPayment, paymentData);
    return response.data.data;
  },

  getPayments: async (params?: GetPaymentsParams): Promise<Payment[]> => {
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
    if (params?.clientId) {
      queryParams.append("clientId", params.clientId.toString());
    }
    if (params?.payment_type) {
      queryParams.append("payment_type", params.payment_type);
    }
    if (params?.invoice_id) {
      queryParams.append("invoice_id", params.invoice_id.toString());
    }
    if (params?.operation_type_id) {
      queryParams.append(
        "operation_type_id",
        params.operation_type_id.toString()
      );
    }
    if (params?.payment_date) {
      queryParams.append("payment_date", params.payment_date);
    }
    if (params?.payment_amount) {
      queryParams.append("payment_amount", params.payment_amount.toString());
    }
    if (params?.paymentCurrencyId) {
      queryParams.append(
        "paymentCurrencyId",
        params.paymentCurrencyId.toString()
      );
    }
    if (params?.paymentMethodId) {
      queryParams.append("paymentMethodId", params.paymentMethodId.toString());
    }
    if (params?.bankAccountId) {
      queryParams.append("bankAccountId", params.bankAccountId.toString());
    }
    if (params?.reference_number) {
      queryParams.append("reference_number", params.reference_number);
    }
    if (params?.supplierId) {
      queryParams.append("supplierId", params.supplierId.toString());
    }

    const response = await api.get(`${GetPayments}?${queryParams}`);
    return response.data.data;
  },

  updatePayment: async (
    id: string,
    updates: UpdatePaymentData
  ): Promise<Payment> => {
    const response = await api.patch(`${PatchPayment}/${id}`, updates);
    return response.data.data;
  },

  deletePayment: async (id: string): Promise<void> => {
    await api.delete(`${DeletePayment}/${id}`);
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get(`${GetPayments}/${id}`);
    return response.data.data;
  },

  getClientPayments: async (clientId: number): Promise<Payment[]> => {
    return paymentService.getPayments({
      clientId,
      payment_type: "client_payment",
      itemsPerPage: 10,
    });
  },

  getSupplierPayments: async (supplierId: number): Promise<Payment[]> => {
    return paymentService.getPayments({
      supplierId,
      payment_type: "supplier_payment",
      itemsPerPage: 10,
    });
  },

  getPaymentsByDateRange: async (
    startDate: string,
    endDate: string,
    paymentType?: PaymentType
  ): Promise<Payment[]> => {
    const params: GetPaymentsParams = {
      payment_date: `${startDate},${endDate}`,
      itemsPerPage: 10,
    };

    if (paymentType) {
      params.payment_type = paymentType;
    }

    return paymentService.getPayments(params);
  },

  getPaymentsByInvoice: async (invoiceId: number): Promise<Payment[]> => {
    return paymentService.getPayments({
      invoice_id: invoiceId,
      itemsPerPage: 10,
    });
  },
};
