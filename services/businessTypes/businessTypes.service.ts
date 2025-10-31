import api from "../../utils/api";
import {
  PostBusinessType,
  GetBusinessTypes,
  GetBusinessTypeById,
  PatchBusinessType,
  DeleteBusinessType,
} from "../businessTypes/businessTypes.route";

export interface GetBusinessTypesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  name?: string;
}

export interface BusinessType {
  id: number;
  name: string;
  description: string;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateBusinessTypeData {
  name: string;
  description: string;
}

export interface UpdateBusinessTypeData {
  name?: string;
  description?: string;
}

export interface BusinessTypeResponse {
  success: boolean;
  data: BusinessType;
}

export interface BusinessTypesListResponse {
  success: boolean;
  data: BusinessType[];
}

export interface PaginatedBusinessTypesResponse {
  success: boolean;
  data: {
    data: BusinessType[];
    totalPages: number;
    total: number;
  };
}

export const COMMON_BUSINESS_TYPES = {
  RETAIL: "Retail",
  WHOLESALE: "Wholesale",
  MANUFACTURING: "Manufacturing",
  SERVICES: "Services",
  CONSULTING: "Consulting",
  TECHNOLOGY: "Technology",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  HOSPITALITY: "Hospitality",
  CONSTRUCTION: "Construction",
  TRANSPORTATION: "Transportation",
  FINANCE: "Finance",
  REAL_ESTATE: "Real Estate",
  ENTERTAINMENT: "Entertainment",
  FOOD_BEVERAGE: "Food & Beverage",
} as const;

export type CommonBusinessType =
  (typeof COMMON_BUSINESS_TYPES)[keyof typeof COMMON_BUSINESS_TYPES];

export const businessTypeService = {
  createBusinessType: async (
    businessTypeData: CreateBusinessTypeData
  ): Promise<BusinessType> => {
    const response = await api.post(PostBusinessType, businessTypeData);
    return response.data.data;
  },

  getBusinessTypes: async (
    params?: GetBusinessTypesParams
  ): Promise<BusinessType[]> => {
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
    if (params?.name) {
      queryParams.append("name", params.name);
    }

    const response = await api.get(`${GetBusinessTypes}?${queryParams}`);
    return response.data.data;
  },

  getBusinessTypeById: async (id: string): Promise<BusinessType> => {
    const response = await api.get(`${GetBusinessTypeById}/${id}`);
    return response.data.data;
  },

  updateBusinessType: async (
    id: string,
    updates: UpdateBusinessTypeData
  ): Promise<BusinessType> => {
    const response = await api.patch(`${PatchBusinessType}/${id}`, updates);
    return response.data.data;
  },

  deleteBusinessType: async (id: string): Promise<void> => {
    await api.delete(`${DeleteBusinessType}/${id}`);
  },

  getBusinessTypesByName: async (name: string): Promise<BusinessType[]> => {
    return businessTypeService.getBusinessTypes({
      name,
      itemsPerPage: 10,
    });
  },

  searchBusinessTypes: async (searchTerm: string): Promise<BusinessType[]> => {
    return businessTypeService.getBusinessTypes({
      search: searchTerm,
      itemsPerPage: 10,
    });
  },

  checkBusinessTypeNameExists: async (name: string): Promise<boolean> => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        name,
        itemsPerPage: 1,
      });
      return businessTypes.length > 0;
    } catch (error) {
      console.error("Error checking business type name existence:", error);
      return false;
    }
  },

  getBusinessTypesForSelect: async (): Promise<
    Array<{ value: number; label: string }>
  > => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });
      return businessTypes.map((businessType) => ({
        value: businessType.id,
        label: businessType.name,
      }));
    } catch (error) {
      console.error("Error getting business types for select:", error);
      return [];
    }
  },

  getBusinessTypesForSelectWithDescription: async (): Promise<
    Array<{ value: number; label: string; description: string }>
  > => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });
      return businessTypes.map((businessType) => ({
        value: businessType.id,
        label: businessType.name,
        description: businessType.description,
      }));
    } catch (error) {
      console.error(
        "Error getting business types for select with description:",
        error
      );
      return [];
    }
  },

  getPopularBusinessTypes: async (
    limit: number = 10
  ): Promise<BusinessType[]> => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });

      return businessTypes
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular business types:", error);
      return [];
    }
  },

  validateBusinessTypeData: (
    businessTypeData: CreateBusinessTypeData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!businessTypeData.name || businessTypeData.name.trim().length === 0) {
      errors.push("El nombre del tipo de negocio es requerido");
    } else if (businessTypeData.name.length < 2) {
      errors.push(
        "El nombre del tipo de negocio debe tener al menos 2 caracteres"
      );
    } else if (businessTypeData.name.length > 100) {
      errors.push(
        "El nombre del tipo de negocio no puede exceder los 100 caracteres"
      );
    }

    if (
      !businessTypeData.description ||
      businessTypeData.description.trim().length === 0
    ) {
      errors.push("La descripción del tipo de negocio es requerida");
    } else if (businessTypeData.description.length > 500) {
      errors.push("La descripción no puede exceder los 500 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  getBusinessTypesStatistics: async (): Promise<{
    total: number;
    average_name_length: number;
    average_description_length: number;
  }> => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });

      const totalNameLength = businessTypes.reduce(
        (sum, type) => sum + type.name.length,
        0
      );
      const totalDescriptionLength = businessTypes.reduce(
        (sum, type) => sum + type.description.length,
        0
      );

      return {
        total: businessTypes.length,
        average_name_length:
          businessTypes.length > 0 ? totalNameLength / businessTypes.length : 0,
        average_description_length:
          businessTypes.length > 0
            ? totalDescriptionLength / businessTypes.length
            : 0,
      };
    } catch (error) {
      console.error("Error getting business types statistics:", error);
      return {
        total: 0,
        average_name_length: 0,
        average_description_length: 0,
      };
    }
  },

  createCommonBusinessTypes: async (): Promise<BusinessType[]> => {
    const commonTypes: CreateBusinessTypeData[] = [
      {
        name: COMMON_BUSINESS_TYPES.RETAIL,
        description:
          "Venta de productos directamente a los consumidores finales",
      },
      {
        name: COMMON_BUSINESS_TYPES.WHOLESALE,
        description: "Venta de productos al por mayor a otros negocios",
      },
      {
        name: COMMON_BUSINESS_TYPES.MANUFACTURING,
        description: "Fabricación y producción de bienes",
      },
      {
        name: COMMON_BUSINESS_TYPES.SERVICES,
        description: "Prestación de servicios profesionales o técnicos",
      },
      {
        name: COMMON_BUSINESS_TYPES.CONSULTING,
        description: "Asesoramiento y consultoría especializada",
      },
      {
        name: COMMON_BUSINESS_TYPES.TECHNOLOGY,
        description: "Desarrollo y venta de productos y servicios tecnológicos",
      },
      {
        name: COMMON_BUSINESS_TYPES.HEALTHCARE,
        description: "Servicios médicos y de atención sanitaria",
      },
      {
        name: COMMON_BUSINESS_TYPES.EDUCATION,
        description: "Servicios educativos y de formación",
      },
      {
        name: COMMON_BUSINESS_TYPES.HOSPITALITY,
        description: "Servicios de hotelería, restaurantes y turismo",
      },
      {
        name: COMMON_BUSINESS_TYPES.CONSTRUCTION,
        description: "Construcción y desarrollo de infraestructura",
      },
    ];

    const createdTypes: BusinessType[] = [];

    for (const typeData of commonTypes) {
      try {
        const exists = await businessTypeService.checkBusinessTypeNameExists(
          typeData.name
        );
        if (!exists) {
          const createdType = await businessTypeService.createBusinessType(
            typeData
          );
          createdTypes.push(createdType);
        }
      } catch (error) {
        console.error(`Error creating business type ${typeData.name}:`, error);
      }
    }

    return createdTypes;
  },

  findSimilarBusinessTypes: async (
    name: string,
    threshold: number = 0.7
  ): Promise<BusinessType[]> => {
    try {
      const allTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });

      return allTypes.filter((type) => {
        const similarity = businessTypeService.calculateStringSimilarity(
          name.toLowerCase(),
          type.name.toLowerCase()
        );
        return similarity >= threshold;
      });
    } catch (error) {
      console.error("Error finding similar business types:", error);
      return [];
    }
  },

  calculateStringSimilarity: (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    if (longer === shorter) {
      return 1.0;
    }

    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));
    const similarity =
      commonWords.length / Math.max(words1.length, words2.length);

    return similarity;
  },

  getBusinessTypesGroupedByCategory: async (): Promise<
    Record<string, BusinessType[]>
  > => {
    try {
      const businessTypes = await businessTypeService.getBusinessTypes({
        itemsPerPage: 10,
      });

      const categories: Record<string, BusinessType[]> = {
        "Retail & Sales": [],
        "Manufacturing & Production": [],
        "Services & Consulting": [],
        "Technology & IT": [],
        "Healthcare & Wellness": [],
        "Education & Training": [],
        "Hospitality & Tourism": [],
        "Construction & Real Estate": [],
        "Finance & Banking": [],
        Other: [],
      };

      businessTypes.forEach((type) => {
        const description = type.description.toLowerCase();

        if (
          description.includes("venta") ||
          description.includes("retail") ||
          description.includes("comercio")
        ) {
          categories["Retail & Sales"].push(type);
        } else if (
          description.includes("fabricación") ||
          description.includes("producción") ||
          description.includes("manufactura")
        ) {
          categories["Manufacturing & Production"].push(type);
        } else if (
          description.includes("servicio") ||
          description.includes("consultoría") ||
          description.includes("asesoramiento")
        ) {
          categories["Services & Consulting"].push(type);
        } else if (
          description.includes("tecnología") ||
          description.includes("software") ||
          description.includes("it")
        ) {
          categories["Technology & IT"].push(type);
        } else if (
          description.includes("salud") ||
          description.includes("médico") ||
          description.includes("sanitario")
        ) {
          categories["Healthcare & Wellness"].push(type);
        } else if (
          description.includes("educación") ||
          description.includes("formación") ||
          description.includes("enseñanza")
        ) {
          categories["Education & Training"].push(type);
        } else if (
          description.includes("hotel") ||
          description.includes("restaurante") ||
          description.includes("turismo")
        ) {
          categories["Hospitality & Tourism"].push(type);
        } else if (
          description.includes("construcción") ||
          description.includes("inmobiliario")
        ) {
          categories["Construction & Real Estate"].push(type);
        } else if (
          description.includes("financiero") ||
          description.includes("bancario")
        ) {
          categories["Finance & Banking"].push(type);
        } else {
          categories["Other"].push(type);
        }
      });

      Object.keys(categories).forEach((category) => {
        if (categories[category].length === 0) {
          delete categories[category];
        }
      });

      return categories;
    } catch (error) {
      console.error("Error grouping business types by category:", error);
      return {};
    }
  },

  createMultipleBusinessTypes: async (
    businessTypesData: CreateBusinessTypeData[]
  ): Promise<BusinessType[]> => {
    const createdBusinessTypes: BusinessType[] = [];

    for (const businessTypeData of businessTypesData) {
      try {
        const createdBusinessType =
          await businessTypeService.createBusinessType(businessTypeData);
        createdBusinessTypes.push(createdBusinessType);
      } catch (error) {
        console.error(
          `Error creating business type ${businessTypeData.name}:`,
          error
        );
        throw error;
      }
    }

    return createdBusinessTypes;
  },
};
