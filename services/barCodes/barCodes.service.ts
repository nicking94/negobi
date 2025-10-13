import api from "../../utils/api";
import {
  PostBarCode,
  GetBarCodes,
  GetBarCodeById,
  PatchBarCode,
  DeleteBarCode,
} from "../barCodes/barCodes.route";

// Parámetros para obtener códigos de barras
export interface GetBarCodesParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId: string; // Requerido según el swagger
  productId?: string;
}

// Interfaz principal del código de barras
export interface BarCode {
  // Campos principales
  id: number;
  code: string;

  // Campos de relación (opcionales en response)
  product_id?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Campos adicionales del response de lista
  externalId?: number;
}

// Datos para crear un código de barras
export interface CreateBarCodeData {
  code: string;
  product_id?: number;
}

// Datos para actualizar un código de barras
export interface UpdateBarCodeData {
  code?: string;
  product_id?: number;
}

// Interfaces de respuesta
export interface BarCodeResponse {
  success: boolean;
  data: BarCode;
}

export interface BarCodesListResponse {
  success: boolean;
  data: {
    page: number;
    total: number;
    itemsPerPage: number;
    totalPages: number;
    order: "ASC" | "DESC";
    data: BarCode[];
  };
}

export interface PaginatedBarCodesResponse {
  success: boolean;
  data: BarCodesListResponse["data"];
}

// Interfaz para código de barras con información extendida
export interface BarCodeWithDetails extends BarCode {
  product_name?: string;
  product_code?: string;
}

// Tipos de códigos de barras soportados
export const BAR_CODE_TYPES = {
  EAN13: "EAN13", // 13 dígitos
  EAN8: "EAN8", // 8 dígitos
  UPC_A: "UPC_A", // 12 dígitos
  UPC_E: "UPC_E", // 6-8 dígitos
  CODE128: "CODE128", // Variable length
  CODE39: "CODE39", // Variable length
} as const;

export type BarCodeType = (typeof BAR_CODE_TYPES)[keyof typeof BAR_CODE_TYPES];

export const barCodeService = {
  // Crear un nuevo código de barras
  createBarCode: async (barCodeData: CreateBarCodeData): Promise<BarCode> => {
    const response = await api.post(PostBarCode, barCodeData);
    return response.data.data;
  },

  // Obtener todos los códigos de barras
  getBarCodes: async (params: GetBarCodesParams): Promise<BarCode[]> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );
    queryParams.append("companyId", params.companyId);

    // Parámetros opcionales
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.productId) {
      queryParams.append("productId", params.productId);
    }

    const response = await api.get(`${GetBarCodes}?${queryParams}`);
    return response.data.data.data; // Acceder a data.data por la estructura de respuesta
  },

  // Obtener un código de barras por ID
  getBarCodeById: async (id: string): Promise<BarCode> => {
    const response = await api.get(`${GetBarCodeById}/${id}`);
    return response.data.data;
  },

  // Actualizar un código de barras
  updateBarCode: async (
    id: string,
    updates: UpdateBarCodeData
  ): Promise<BarCode> => {
    const response = await api.patch(`${PatchBarCode}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un código de barras
  deleteBarCode: async (id: string): Promise<void> => {
    await api.delete(`${DeleteBarCode}/${id}`);
  },

  // Métodos adicionales útiles
  getBarCodesByCompany: async (companyId: string): Promise<BarCode[]> => {
    return barCodeService.getBarCodes({
      companyId,
      itemsPerPage: 10,
    });
  },

  getBarCodesByProduct: async (
    companyId: string,
    productId: string
  ): Promise<BarCode[]> => {
    return barCodeService.getBarCodes({
      companyId,
      productId,
      itemsPerPage: 10,
    });
  },

  searchBarCodes: async (
    companyId: string,
    searchTerm: string
  ): Promise<BarCode[]> => {
    return barCodeService.getBarCodes({
      companyId,
      search: searchTerm,
      itemsPerPage: 10,
    });
  },

  // Buscar por código exacto
  getBarCodeByCode: async (
    companyId: string,
    code: string
  ): Promise<BarCode | null> => {
    try {
      const barCodes = await barCodeService.getBarCodes({
        companyId,
        search: code,
        itemsPerPage: 1,
      });
      return barCodes.find((barCode) => barCode.code === code) || null;
    } catch (error) {
      console.error("Error getting bar code by code:", error);
      return null;
    }
  },

  // Verificar si existe un código de barras
  checkBarCodeExists: async (
    companyId: string,
    code: string
  ): Promise<boolean> => {
    try {
      const barCode = await barCodeService.getBarCodeByCode(companyId, code);
      return barCode !== null;
    } catch (error) {
      console.error("Error checking bar code existence:", error);
      return false;
    }
  },

  // Asignar código de barras a producto
  assignBarCodeToProduct: async (
    barCodeId: string,
    productId: number
  ): Promise<BarCode> => {
    return barCodeService.updateBarCode(barCodeId, { product_id: productId });
  },

  // Desasignar código de barras de producto
  unassignBarCodeFromProduct: async (barCodeId: string): Promise<BarCode> => {
    return barCodeService.updateBarCode(barCodeId, { product_id: undefined });
  },

  // Validar formato de código de barras
  validateBarCodeFormat: (
    code: string
  ): { isValid: boolean; type?: BarCodeType; errors: string[] } => {
    const errors: string[] = [];
    let type: BarCodeType | undefined;

    // Remover espacios y guiones
    const cleanCode = code.replace(/[\s-]/g, "");

    if (!cleanCode) {
      errors.push("El código de barras no puede estar vacío");
      return { isValid: false, errors };
    }

    // Validar que solo contenga números (para la mayoría de tipos)
    if (!/^\d+$/.test(cleanCode)) {
      errors.push("El código de barras debe contener solo números");
    }

    // Validar longitudes específicas
    const length = cleanCode.length;

    switch (length) {
      case 13:
        type = BAR_CODE_TYPES.EAN13;
        if (!barCodeService.validateEAN13(cleanCode)) {
          errors.push("Código EAN-13 inválido");
        }
        break;
      case 8:
        type = BAR_CODE_TYPES.EAN8;
        if (!barCodeService.validateEAN8(cleanCode)) {
          errors.push("Código EAN-8 inválido");
        }
        break;
      case 12:
        type = BAR_CODE_TYPES.UPC_A;
        if (!barCodeService.validateUPCA(cleanCode)) {
          errors.push("Código UPC-A inválido");
        }
        break;
      case 6:
      case 7:
      case 8:
        type = BAR_CODE_TYPES.UPC_E;
        // UPC-E tiene validación más compleja, asumimos válido por ahora
        break;
      default:
        if (length >= 1 && length <= 255) {
          type = BAR_CODE_TYPES.CODE128;
        } else {
          errors.push(`Longitud de código no soportada: ${length} dígitos`);
        }
    }

    return {
      isValid: errors.length === 0,
      type,
      errors,
    };
  },

  // Validar dígito de control EAN-13
  validateEAN13: (code: string): boolean => {
    if (code.length !== 13) return false;

    const digits = code.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[12];
  },

  // Validar dígito de control EAN-8
  validateEAN8: (code: string): boolean => {
    if (code.length !== 8) return false;

    const digits = code.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 7; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[7];
  },

  // Validar dígito de control UPC-A
  validateUPCA: (code: string): boolean => {
    if (code.length !== 12) return false;

    const digits = code.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[11];
  },

  // Generar dígito de control para EAN-13
  generateEAN13CheckDigit: (code: string): string => {
    if (code.length !== 12)
      throw new Error("Se requieren 12 dígitos para EAN-13");

    const digits = code.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  },

  // Formatear código de barras para visualización
  formatBarCode: (code: string, type?: BarCodeType): string => {
    const cleanCode = code.replace(/[\s-]/g, "");

    switch (type) {
      case BAR_CODE_TYPES.EAN13:
        if (cleanCode.length === 13) {
          return `${cleanCode.substring(0, 1)}-${cleanCode.substring(
            1,
            7
          )}-${cleanCode.substring(7, 13)}`;
        }
        break;
      case BAR_CODE_TYPES.UPC_A:
        if (cleanCode.length === 12) {
          return `${cleanCode.substring(0, 1)}-${cleanCode.substring(
            1,
            6
          )}-${cleanCode.substring(6, 11)}-${cleanCode.substring(11, 12)}`;
        }
        break;
      default:
        // Para otros tipos, agrupar cada 4 dígitos
        return cleanCode.replace(/(.{4})/g, "$1 ").trim();
    }

    return cleanCode;
  },

  // Obtener estadísticas de códigos de barras
  getBarCodesStatistics: async (
    companyId: string
  ): Promise<{
    total: number;
    assigned: number;
    unassigned: number;
    by_type: Record<string, number>;
  }> => {
    try {
      const barCodes = await barCodeService.getBarCodesByCompany(companyId);

      const byType: Record<string, number> = {};

      barCodes.forEach((barCode) => {
        const validation = barCodeService.validateBarCodeFormat(barCode.code);
        const type = validation.type || "unknown";
        byType[type] = (byType[type] || 0) + 1;
      });

      return {
        total: barCodes.length,
        assigned: barCodes.filter((barCode) => barCode.product_id).length,
        unassigned: barCodes.filter((barCode) => !barCode.product_id).length,
        by_type: byType,
      };
    } catch (error) {
      console.error("Error getting bar codes statistics:", error);
      return {
        total: 0,
        assigned: 0,
        unassigned: 0,
        by_type: {},
      };
    }
  },

  // Crear múltiples códigos de barras
  createMultipleBarCodes: async (
    companyId: string,
    barCodesData: CreateBarCodeData[]
  ): Promise<BarCode[]> => {
    const createdBarCodes: BarCode[] = [];

    for (const barCodeData of barCodesData) {
      try {
        const createdBarCode = await barCodeService.createBarCode(barCodeData);
        createdBarCodes.push(createdBarCode);
      } catch (error) {
        console.error(`Error creating bar code ${barCodeData.code}:`, error);
        throw error;
      }
    }

    return createdBarCodes;
  },

  // Buscar productos sin código de barras (simulado - en una implementación real esto vendría del backend)
  findProductsWithoutBarCodes: async (companyId: string): Promise<number[]> => {
    // Esta es una implementación simulada
    // En una implementación real, esto consultaría la base de datos
    console.log(
      "Buscando productos sin códigos de barras para company:",
      companyId
    );
    return []; // Retornar array vacío como placeholder
  },

  // Generar códigos de barras secuenciales
  generateSequentialBarCodes: (
    startCode: string,
    count: number,
    productId?: number
  ): CreateBarCodeData[] => {
    const barCodes: CreateBarCodeData[] = [];
    let currentCode = BigInt(startCode);

    for (let i = 0; i < count; i++) {
      barCodes.push({
        code: currentCode.toString(),
        product_id: productId,
      });
      currentCode++;
    }

    return barCodes;
  },
};
