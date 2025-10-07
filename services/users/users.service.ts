import api from "@/utils/api";
import * as UserRoutes from "./user.routes";
import {
  OrganizationQueryType,
  ApiKeyType,
  UserType,
  CompanyType,
} from "@/types";

export interface UserProfile extends UserType {
  company?: CompanyType;
  api_key?: ApiKeyType;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: string;
  phone: string;
  username: string;
  branch_id?: number;
  company_id?: number;
  first_name: string;
  last_name: string;
  seller_code?: string;
  external_code?: string;
  erp_cod_sucu?: string;
}

export interface UpdateUserPayload {
  dni?: string;
  remember_password?: string;
  rm_password_expired?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  role?: string;
  seller_code?: string;
  external_code?: string;
  erp_cod_sucu?: string;
  company_id?: number;
  branch_id?: number;
  location?: string;
  sync_with_erp?: boolean;
}

export interface ChangePasswordData {
  new_password: string;
  legal_tax_id: string;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    page: number;
    total: number;
    itemsPerPage: number;
    totalPages: number;
    order: string;
    data: UserType[];
  };
}

export interface UserResponse {
  success: boolean;
  data: UserType;
}

export interface UserDeleteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface UserRolesResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface SyncUsersPayload {
  companyId: number;
  data: CreateUserPayload[];
}

export interface SyncUsersResponse {
  success: boolean;
  data: Array<{
    code: string;
    sync: boolean;
    error: string | null;
    negobi_db_id: number;
  }>;
}

export class UsersService {
  // Crear usuario
  static async createUser(data: CreateUserPayload): Promise<UserResponse> {
    const response = await api.post(UserRoutes.postUser, data);
    return response.data;
  }

  // Listar usuarios
  static async getUsers(
    params: OrganizationQueryType
  ): Promise<UsersListResponse> {
    const response = await api.get(UserRoutes.getUsers, { params });
    return response.data;
  }

  // Obtener usuario por ID
  static async getUserById(id: number): Promise<UserResponse> {
    const response = await api.get(`${UserRoutes.getUser}/${id}`);
    return response.data;
  }

  // ✅ CORREGIDO - usa PATCH
  static async updateUser(
    id: number,
    data: UpdateUserPayload
  ): Promise<UserResponse> {
    const response = await api.patch(`${UserRoutes.patchUser}/${id}`, data);
    return response.data;
  }

  // Eliminar usuario
  static async deleteUser(id: number): Promise<UserDeleteResponse> {
    const response = await api.delete(`${UserRoutes.deleteUser}/${id}`);
    return response.data;
  }

  // Obtener perfil del usuario logueado
  static async getProfile(): Promise<UserResponse> {
    const response = await api.get(UserRoutes.getProfile);
    return response.data;
  }

  // Actualizar perfil (alias de updateUser pero para el perfil actual)
  static async updateProfile(
    id: number,
    data: UpdateUserPayload
  ): Promise<UserResponse> {
    return this.updateUser(id, data);
  }

  // Cambiar contraseña
  static async changePassword(data: ChangePasswordData): Promise<UserResponse> {
    const response = await api.put(UserRoutes.changePassword, data);
    return response.data;
  }

  // Obtener roles de usuario
  static async getUserRoles(): Promise<UserRolesResponse> {
    const response = await api.get(UserRoutes.getUserRoles);
    return response.data;
  }

  // Sincronizar usuarios desde ERP
  static async syncUsers(data: SyncUsersPayload): Promise<SyncUsersResponse> {
    const response = await api.post(UserRoutes.syncUsers, data);
    return response.data;
  }
}
