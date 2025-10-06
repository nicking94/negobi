// services/paymentTerms/paymentTerms.service.ts
import api from "@/utils/api";
import {
  deletePaymentTerm,
  getPaymentTerm,
  postPaymentTerm,
  updatePaymentTerm,
} from "./paymentTerms.route";
import {
  PaymentTermsResponse,
  PaymentTermResponse,
  PaymentTermDeleteResponse,
  GetPaymentTermsParams,
  PaymentTermCreatePayload,
  PaymentTermUpdatePayload,
} from "@/types";

export const paymentTermsService = {
  getPaymentTerms: async (
    params: GetPaymentTermsParams
  ): Promise<PaymentTermsResponse> => {
    const response = await api.get(getPaymentTerm, { params });
    return response.data;
  },

  getOnePaymentTerm: async (id: string): Promise<PaymentTermResponse> => {
    const response = await api.get(`${getPaymentTerm}/${id}`);
    return response.data;
  },

  createPaymentTerm: async (
    data: PaymentTermCreatePayload
  ): Promise<PaymentTermResponse> => {
    const response = await api.post(postPaymentTerm, data);
    return response.data;
  },

  updatePaymentTerm: async (
    id: string,
    data: PaymentTermUpdatePayload
  ): Promise<PaymentTermResponse> => {
    const response = await api.patch(`${updatePaymentTerm}/${id}`, data);
    return response.data;
  },

  deletePaymentTerm: async (id: string): Promise<PaymentTermDeleteResponse> => {
    const response = await api.delete(`${deletePaymentTerm}/${id}`);
    return response.data;
  },
};
