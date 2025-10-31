import api from "../../utils/api";
import {
  PostItemTax,
  GetItemTaxes,
  PatchItemTax,
  DeleteItemTax,
} from "../itemTaxes/itemTaxes.route";

export interface GetItemTaxesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  itemId?: number;
  taxTypeId?: number;
  tax_rate?: number;
  tax_amount?: number;
}

export interface ItemTax {
  id: number;
  tax_rate: number;
  tax_amount: number;
  itemId?: number;
  taxTypeId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateItemTaxData {
  itemId: number;
  taxTypeId: number;
  tax_rate: number;
  tax_amount: number;
}

export interface UpdateItemTaxData {
  itemId?: number;
  taxTypeId?: number;
  tax_rate?: number;
  tax_amount?: number;
}

export interface ItemTaxResponse {
  success: boolean;
  data: ItemTax;
}

export interface ItemTaxesListResponse {
  success: boolean;
  data: ItemTax[];
}

export interface PaginatedItemTaxesResponse {
  success: boolean;
  data: {
    data: ItemTax[];
    totalPages: number;
    total: number;
  };
}

export const itemTaxService = {
  createItemTax: async (itemTaxData: CreateItemTaxData): Promise<ItemTax> => {
    const response = await api.post(PostItemTax, itemTaxData);
    return response.data.data;
  },

  getItemTaxes: async (params?: GetItemTaxesParams): Promise<ItemTax[]> => {
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
    if (params?.itemId) {
      queryParams.append("itemId", params.itemId.toString());
    }
    if (params?.taxTypeId) {
      queryParams.append("taxTypeId", params.taxTypeId.toString());
    }
    if (params?.tax_rate) {
      queryParams.append("tax_rate", params.tax_rate.toString());
    }
    if (params?.tax_amount) {
      queryParams.append("tax_amount", params.tax_amount.toString());
    }

    const response = await api.get(`${GetItemTaxes}?${queryParams}`);
    return response.data.data;
  },

  updateItemTax: async (
    id: string,
    updates: UpdateItemTaxData
  ): Promise<ItemTax> => {
    const response = await api.patch(`${PatchItemTax}/${id}`, updates);
    return response.data.data;
  },

  deleteItemTax: async (id: string): Promise<void> => {
    await api.delete(`${DeleteItemTax}/${id}`);
  },

  getItemTaxById: async (id: string): Promise<ItemTax> => {
    const response = await api.get(`${GetItemTaxes}/${id}`);
    return response.data.data;
  },

  getItemTaxesByItem: async (itemId: number): Promise<ItemTax[]> => {
    return itemTaxService.getItemTaxes({
      itemId,
      itemsPerPage: 10,
    });
  },

  getItemTaxesByTaxType: async (taxTypeId: number): Promise<ItemTax[]> => {
    return itemTaxService.getItemTaxes({
      taxTypeId,
      itemsPerPage: 10,
    });
  },

  getItemTaxesByItemAndTaxType: async (
    itemId: number,
    taxTypeId: number
  ): Promise<ItemTax | null> => {
    try {
      const itemTaxes = await itemTaxService.getItemTaxes({
        itemId,
        taxTypeId,
        itemsPerPage: 1,
      });
      return itemTaxes.length > 0 ? itemTaxes[0] : null;
    } catch (error) {
      console.error("Error fetching item tax by item and tax type:", error);
      return null;
    }
  },

  calculateItemTaxes: async (
    itemId: number,
    baseAmount: number,
    taxTypeIds: number[]
  ): Promise<{ taxTypeId: number; tax_rate: number; tax_amount: number }[]> => {
    const calculatedTaxes: {
      taxTypeId: number;
      tax_rate: number;
      tax_amount: number;
    }[] = [];

    for (const taxTypeId of taxTypeIds) {
      try {
        const existingItemTax =
          await itemTaxService.getItemTaxesByItemAndTaxType(itemId, taxTypeId);

        if (existingItemTax) {
          calculatedTaxes.push({
            taxTypeId,
            tax_rate: existingItemTax.tax_rate,
            tax_amount: existingItemTax.tax_amount,
          });
        } else {
          const defaultTaxRate = 0;
          const taxAmount = baseAmount * (defaultTaxRate / 100);

          calculatedTaxes.push({
            taxTypeId,
            tax_rate: defaultTaxRate,
            tax_amount: taxAmount,
          });
        }
      } catch (error) {
        console.error(
          `Error calculating tax for item ${itemId} and tax type ${taxTypeId}:`,
          error
        );
      }
    }

    return calculatedTaxes;
  },

  createMultipleItemTaxes: async (
    itemTaxesData: CreateItemTaxData[]
  ): Promise<ItemTax[]> => {
    const createdItemTaxes: ItemTax[] = [];

    for (const itemTaxData of itemTaxesData) {
      try {
        const createdItemTax = await itemTaxService.createItemTax(itemTaxData);
        createdItemTaxes.push(createdItemTax);
      } catch (error) {
        console.error(`Error creating item tax:`, error);
        throw error;
      }
    }

    return createdItemTaxes;
  },

  upsertItemTaxes: async (
    itemId: number,
    taxes: { taxTypeId: number; tax_rate: number; tax_amount: number }[]
  ): Promise<ItemTax[]> => {
    const results: ItemTax[] = [];

    for (const tax of taxes) {
      try {
        const existingItemTax =
          await itemTaxService.getItemTaxesByItemAndTaxType(
            itemId,
            tax.taxTypeId
          );

        if (existingItemTax) {
          const updatedItemTax = await itemTaxService.updateItemTax(
            existingItemTax.id.toString(),
            {
              tax_rate: tax.tax_rate,
              tax_amount: tax.tax_amount,
            }
          );
          results.push(updatedItemTax);
        } else {
          const newItemTax = await itemTaxService.createItemTax({
            itemId,
            taxTypeId: tax.taxTypeId,
            tax_rate: tax.tax_rate,
            tax_amount: tax.tax_amount,
          });
          results.push(newItemTax);
        }
      } catch (error) {
        console.error(
          `Error upserting item tax for item ${itemId} and tax type ${tax.taxTypeId}:`,
          error
        );
        throw error;
      }
    }

    return results;
  },
};
