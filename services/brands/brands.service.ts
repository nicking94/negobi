import api from "../../utils/api";
import {
  PostBrand,
  GetBrands,
  GetBrandById,
  PatchBrand,
  DeleteBrand,
} from "../brands/brands.route";

// Parámetros para obtener marcas
export interface GetBrandsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  brand_name?: string;
  description?: string;
  is_active?: boolean;
}

// Interfaz principal de la marca
export interface Brand {
  // Campos principales
  id: number;
  brand_name: string;
  description: string;
  is_active: boolean;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Datos para crear una marca
export interface CreateBrandData {
  brand_name: string;
  description: string;
  is_active?: boolean;
}

// Datos para actualizar una marca
export interface UpdateBrandData {
  brand_name?: string;
  description?: string;
  is_active?: boolean;
}

// Interfaces de respuesta
export interface BrandResponse {
  success: boolean;
  data: Brand;
}

export interface BrandsListResponse {
  success: boolean;
  data: Brand[];
}

export interface PaginatedBrandsResponse {
  success: boolean;
  data: {
    data: Brand[];
    totalPages: number;
    total: number;
  };
}

export const brandService = {
  // Crear una nueva marca
  createBrand: async (brandData: CreateBrandData): Promise<Brand> => {
    const response = await api.post(PostBrand, brandData);
    return response.data.data;
  },

  // Obtener todas las marcas
  getBrands: async (params?: GetBrandsParams): Promise<Brand[]> => {
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
    if (params?.brand_name) {
      queryParams.append("brand_name", params.brand_name);
    }
    if (params?.description) {
      queryParams.append("description", params.description);
    }
    if (params?.is_active !== undefined) {
      queryParams.append("is_active", params.is_active.toString());
    }

    const response = await api.get(`${GetBrands}?${queryParams}`);
    return response.data.data;
  },

  // Obtener una marca por ID
  getBrandById: async (id: string): Promise<Brand> => {
    const response = await api.get(`${GetBrandById}/${id}`);
    return response.data.data;
  },

  // Actualizar una marca
  updateBrand: async (id: string, updates: UpdateBrandData): Promise<Brand> => {
    const response = await api.patch(`${PatchBrand}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar una marca
  deleteBrand: async (id: string): Promise<void> => {
    await api.delete(`${DeleteBrand}/${id}`);
  },

  // Métodos adicionales útiles
  getActiveBrands: async (): Promise<Brand[]> => {
    return brandService.getBrands({
      is_active: true,
      itemsPerPage: 1000,
    });
  },

  getInactiveBrands: async (): Promise<Brand[]> => {
    return brandService.getBrands({
      is_active: false,
      itemsPerPage: 1000,
    });
  },

  // Buscar marcas por nombre
  searchBrandsByName: async (searchTerm: string): Promise<Brand[]> => {
    return brandService.getBrands({
      search: searchTerm,
      itemsPerPage: 1000,
    });
  },

  // Buscar marcas por descripción
  searchBrandsByDescription: async (description: string): Promise<Brand[]> => {
    return brandService.getBrands({
      description: description,
      itemsPerPage: 1000,
    });
  },

  // Activar/desactivar marca
  toggleBrandStatus: async (id: string, isActive: boolean): Promise<Brand> => {
    return brandService.updateBrand(id, { is_active: isActive });
  },

  // Activar marca
  activateBrand: async (id: string): Promise<Brand> => {
    return brandService.toggleBrandStatus(id, true);
  },

  // Desactivar marca
  deactivateBrand: async (id: string): Promise<Brand> => {
    return brandService.toggleBrandStatus(id, false);
  },

  // Verificar si existe una marca con el mismo nombre
  checkBrandNameExists: async (brandName: string): Promise<boolean> => {
    try {
      const brands = await brandService.getBrands({
        brand_name: brandName,
        itemsPerPage: 1,
      });
      return brands.length > 0;
    } catch (error) {
      console.error("Error checking brand name existence:", error);
      return false;
    }
  },

  // Obtener marcas para select/dropdown
  getBrandsForSelect: async (): Promise<
    Array<{ value: number; label: string }>
  > => {
    try {
      const brands = await brandService.getActiveBrands();
      return brands.map((brand) => ({
        value: brand.id,
        label: brand.brand_name,
      }));
    } catch (error) {
      console.error("Error getting brands for select:", error);
      return [];
    }
  },

  // Obtener marcas con información extendida para select
  getBrandsForSelectWithDescription: async (): Promise<
    Array<{ value: number; label: string; description: string }>
  > => {
    try {
      const brands = await brandService.getActiveBrands();
      return brands.map((brand) => ({
        value: brand.id,
        label: brand.brand_name,
        description: brand.description,
      }));
    } catch (error) {
      console.error("Error getting brands for select with description:", error);
      return [];
    }
  },

  // Obtener estadísticas de marcas
  getBrandsStatistics: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> => {
    try {
      const [allBrands, activeBrands] = await Promise.all([
        brandService.getBrands({ itemsPerPage: 1000 }),
        brandService.getActiveBrands(),
      ]);

      return {
        total: allBrands.length,
        active: activeBrands.length,
        inactive: allBrands.length - activeBrands.length,
      };
    } catch (error) {
      console.error("Error getting brands statistics:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
  },

  // Obtener marcas populares (más activas - en un caso real esto vendría de estadísticas de uso)
  getPopularBrands: async (limit: number = 10): Promise<Brand[]> => {
    try {
      const brands = await brandService.getActiveBrands();
      // Ordenar alfabéticamente como placeholder
      // En una implementación real, esto se basaría en métricas de uso
      return brands
        .sort((a, b) => a.brand_name.localeCompare(b.brand_name))
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular brands:", error);
      return [];
    }
  },

  // Validar nombre de marca
  validateBrandName: (
    brandName: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!brandName || brandName.trim().length === 0) {
      errors.push("El nombre de la marca es requerido");
    }

    if (brandName.length < 2) {
      errors.push("El nombre de la marca debe tener al menos 2 caracteres");
    }

    if (brandName.length > 100) {
      errors.push("El nombre de la marca no puede exceder los 100 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validar descripción de marca
  validateBrandDescription: (
    description: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (description && description.length > 500) {
      errors.push("La descripción no puede exceder los 500 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Crear múltiples marcas
  createMultipleBrands: async (
    brandsData: CreateBrandData[]
  ): Promise<Brand[]> => {
    const createdBrands: Brand[] = [];

    for (const brandData of brandsData) {
      try {
        const createdBrand = await brandService.createBrand(brandData);
        createdBrands.push(createdBrand);
      } catch (error) {
        console.error(`Error creating brand ${brandData.brand_name}:`, error);
        throw error;
      }
    }

    return createdBrands;
  },
};
