import api from "../../utils/api";
import {
  PostService,
  GetServices,
  PatchService,
  DeleteService,
} from "../servicios/services.route";

export interface GetServicesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId: string;
  categoryId?: string;
}

export interface Service {
  id: number;
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  description: string;
  name: string;
  code: string;
  erp_code_inst?: string;
  category_id?: number;
  company_id?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  externalId?: number;
  category?: {
    id: number;
    category_name: string;
    category_code: string;
    description?: string;
    is_active: boolean;
  };
  company?: {
    id: number;
    name: string;
  };
}

export interface CreateServiceData {
  price_level_1: number;
  price_level_2: number;
  price_level_3: number;
  description: string;
  name: string;
  code: string;
  category_id?: number | null;
  company_id?: number;
  erp_code_inst?: string;
  external_code?: string;
}

export interface UpdateServiceData {
  price_level_1?: number;
  price_level_2?: number;
  price_level_3?: number;
  description?: string;
  name?: string;
  code?: string;
  category_id?: number | null;
  company_id?: number;
  erp_code_inst?: string;
  external_code?: string;
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
}

export interface ServicesListResponse {
  success: boolean;
  data: {
    page: number;
    total: number;
    itemsPerPage: number;
    totalPages: number;
    order: "ASC" | "DESC";
    data: Service[];
  };
}

export interface PaginatedServicesResponse {
  success: boolean;
  data: ServicesListResponse["data"];
}

export interface ServiceWithDetails extends Service {
  category_name?: string;
  company_name?: string;
}

export interface ServicePriceAnalysis {
  service: Service;
  average_price: number;
  price_range: number;
  is_competitive: boolean;
  suggested_price?: number;
}

export const serviceService = {
  createService: async (serviceData: CreateServiceData): Promise<Service> => {
    const response = await api.post(PostService, serviceData);
    const service = response.data.data;

    return {
      ...service,
      category_id:
        service.category_id !== undefined
          ? service.category_id
          : service.category?.id,
      company_id:
        service.company_id !== undefined
          ? service.company_id
          : service.company?.id,
    };
  },

  getServices: async (params: GetServicesParams): Promise<Service[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("companyId", params.companyId);

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }

    const response = await api.get(`${GetServices}?${queryParams}`);

    const servicesData = response.data.data.data;

    return servicesData.map((service: any) => ({
      ...service,

      category_id:
        service.category_id !== undefined
          ? service.category_id
          : service.category?.id,

      company_id:
        service.company_id !== undefined
          ? service.company_id
          : service.company?.id,
    }));
  },

  updateService: async (
    id: string,
    updates: UpdateServiceData
  ): Promise<Service> => {
    const response = await api.patch(`${PatchService}/${id}`, updates);
    const service = response.data.data;

    return {
      ...service,
      category_id:
        service.category_id !== undefined
          ? service.category_id
          : service.category?.id,
      company_id:
        service.company_id !== undefined
          ? service.company_id
          : service.company?.id,
    };
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`${DeleteService}/${id}`);
  },

  getServicesByCompany: async (companyId: string): Promise<Service[]> => {
    return serviceService.getServices({
      companyId,
      itemsPerPage: 10,
    });
  },

  getServicesByCategory: async (
    companyId: string,
    categoryId: string
  ): Promise<Service[]> => {
    return serviceService.getServices({
      companyId,
      categoryId,
      itemsPerPage: 10,
    });
  },

  searchServices: async (
    companyId: string,
    searchTerm: string
  ): Promise<Service[]> => {
    return serviceService.getServices({
      companyId,
      search: searchTerm,
      itemsPerPage: 10,
    });
  },

  searchServicesByName: async (
    companyId: string,
    name: string
  ): Promise<Service[]> => {
    return serviceService.getServices({
      companyId,
      search: name,
      itemsPerPage: 10,
    });
  },

  searchServicesByCode: async (
    companyId: string,
    code: string
  ): Promise<Service[]> => {
    return serviceService.getServices({
      companyId,
      search: code,
      itemsPerPage: 10,
    });
  },

  updateServicePrices: async (
    id: string,
    prices: {
      price_level_1?: number;
      price_level_2?: number;
      price_level_3?: number;
    }
  ): Promise<Service> => {
    return serviceService.updateService(id, prices);
  },

  checkServiceCodeExists: async (
    companyId: string,
    code: string
  ): Promise<boolean> => {
    try {
      const services = await serviceService.getServices({
        companyId,
        search: code,
        itemsPerPage: 1,
      });
      return services.some((service) => service.code === code);
    } catch (error) {
      console.error("Error checking service code existence:", error);
      return false;
    }
  },

  checkServiceNameExists: async (
    companyId: string,
    name: string
  ): Promise<boolean> => {
    try {
      const services = await serviceService.getServices({
        companyId,
        search: name,
        itemsPerPage: 1,
      });
      return services.some((service) => service.name === name);
    } catch (error) {
      console.error("Error checking service name existence:", error);
      return false;
    }
  },

  getServicesForSelect: async (
    companyId: string
  ): Promise<Array<{ value: number; label: string; code: string }>> => {
    try {
      const services = await serviceService.getServicesByCompany(companyId);
      return services.map((service) => ({
        value: service.id,
        label: `${service.code} - ${service.name}`,
        code: service.code,
      }));
    } catch (error) {
      console.error("Error getting services for select:", error);
      return [];
    }
  },

  getServicesGroupedByCategory: async (
    companyId: string
  ): Promise<Record<string, Service[]>> => {
    try {
      const services = await serviceService.getServicesByCompany(companyId);
      return services.reduce((groups, service) => {
        const category = service.category_id?.toString() || "sin-categoria";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(service);
        return groups;
      }, {} as Record<string, Service[]>);
    } catch (error) {
      console.error("Error grouping services by category:", error);
      return {};
    }
  },

  calculateAveragePrice: (service: Service): number => {
    const prices = [
      service.price_level_1,
      service.price_level_2,
      service.price_level_3,
    ];
    const validPrices = prices.filter((price) => price > 0);
    if (validPrices.length === 0) return 0;

    return (
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
    );
  },

  analyzeServicePrices: (service: Service): ServicePriceAnalysis => {
    const prices = [
      service.price_level_1,
      service.price_level_2,
      service.price_level_3,
    ].filter((price) => price > 0);
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = Math.max(...prices) - Math.min(...prices);

    const isCompetitive = priceRange <= averagePrice * 0.5;
    const suggestedPrice = Math.round(averagePrice);

    return {
      service,
      average_price: parseFloat(averagePrice.toFixed(2)),
      price_range: parseFloat(priceRange.toFixed(2)),
      is_competitive: isCompetitive,
      suggested_price: suggestedPrice,
    };
  },

  getBestValueServices: async (
    companyId: string,
    limit: number = 10
  ): Promise<Service[]> => {
    try {
      const services = await serviceService.getServicesByCompany(companyId);

      return services
        .filter(
          (service) => service.description && service.description.length > 0
        )
        .sort((a, b) => {
          const priceA = serviceService.calculateAveragePrice(a);
          const priceB = serviceService.calculateAveragePrice(b);
          const valueA = serviceService.calculateServiceValue(a);
          const valueB = serviceService.calculateServiceValue(b);

          return valueB / priceB - valueA / priceA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting best value services:", error);
      return [];
    }
  },

  calculateServiceValue: (service: Service): number => {
    const baseValue = service.description?.length || 0;
    const priceComplexity =
      (service.price_level_1 + service.price_level_2 + service.price_level_3) /
      3;
    return baseValue + priceComplexity * 0.1;
  },

  validateServiceData: (
    serviceData: CreateServiceData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!serviceData.name || serviceData.name.trim().length === 0) {
      errors.push("El nombre del servicio es requerido");
    } else if (serviceData.name.length > 100) {
      errors.push("El nombre del servicio no puede exceder los 100 caracteres");
    }

    if (!serviceData.code || serviceData.code.trim().length === 0) {
      errors.push("El código del servicio es requerido");
    } else if (serviceData.code.length > 50) {
      errors.push("El código del servicio no puede exceder los 50 caracteres");
    }

    if (
      !serviceData.description ||
      serviceData.description.trim().length === 0
    ) {
      errors.push("La descripción del servicio es requerida");
    } else if (serviceData.description.length > 500) {
      errors.push("La descripción no puede exceder los 500 caracteres");
    }

    if (serviceData.price_level_1 < 0) {
      errors.push("El precio nivel 1 no puede ser negativo");
    }

    if (serviceData.price_level_2 < 0) {
      errors.push("El precio nivel 2 no puede ser negativo");
    }

    if (serviceData.price_level_3 < 0) {
      errors.push("El precio nivel 3 no puede ser negativo");
    }

    if (
      serviceData.price_level_1 > 0 &&
      serviceData.price_level_2 > 0 &&
      serviceData.price_level_1 > serviceData.price_level_2
    ) {
      errors.push("El precio nivel 1 no puede ser mayor al precio nivel 2");
    }

    if (
      serviceData.price_level_2 > 0 &&
      serviceData.price_level_3 > 0 &&
      serviceData.price_level_2 > serviceData.price_level_3
    ) {
      errors.push("El precio nivel 2 no puede ser mayor al precio nivel 3");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  getServicesStatistics: async (
    companyId: string
  ): Promise<{
    total: number;
    with_category: number;
    without_category: number;
    average_price: number;
    price_range: { min: number; max: number };
  }> => {
    try {
      const services = await serviceService.getServicesByCompany(companyId);

      const prices = services
        .flatMap((service) => [
          service.price_level_1,
          service.price_level_2,
          service.price_level_3,
        ])
        .filter((price) => price > 0);

      const totalPrices = prices.reduce((sum, price) => sum + price, 0);
      const averagePrice = prices.length > 0 ? totalPrices / prices.length : 0;

      return {
        total: services.length,
        with_category: services.filter((service) => service.category_id).length,
        without_category: services.filter((service) => !service.category_id)
          .length,
        average_price: parseFloat(averagePrice.toFixed(2)),
        price_range: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
        },
      };
    } catch (error) {
      console.error("Error getting services statistics:", error);
      return {
        total: 0,
        with_category: 0,
        without_category: 0,
        average_price: 0,
        price_range: { min: 0, max: 0 },
      };
    }
  },

  createMultipleServices: async (
    companyId: string,
    servicesData: CreateServiceData[]
  ): Promise<Service[]> => {
    const createdServices: Service[] = [];

    for (const serviceData of servicesData) {
      try {
        const serviceWithCompany = {
          ...serviceData,
          company_id: serviceData.company_id || parseInt(companyId),
        };

        const createdService = await serviceService.createService(
          serviceWithCompany
        );
        createdServices.push(createdService);
      } catch (error) {
        console.error(`Error creating service ${serviceData.name}:`, error);
        throw error;
      }
    }

    return createdServices;
  },
};
