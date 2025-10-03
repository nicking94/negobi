// services/users/users.service.ts
import { User } from "@/app/dashboard/users/page";
import * as UserRoutes from "./user.routes";
import api from "@/utils/api";
import { ApiKeyType, OrganizationQueryType } from "@/types";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  role: string;
  seller_code?: string;
  external_code?: string;
  erp_cod_sucu?: string;
  company_id?: number;
  branch_id?: number;
  location?: string;
  remember_password?: string;
  rm_password_expired?: string;
  sync_with_erp?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  company?: any;
  api_key?: ApiKeyType;
}

export interface ChangePasswordData {
  new_password: string;
  legal_tax_id: string;
}

// Interface para actualizar perfil según Swagger
export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  // Otros campos que acepte el endpoint según Swagger
}

export class UsersService {
  static postUser(data: User) {
    return api.post(UserRoutes.postUser, data);
  }

  static getUsers(data: OrganizationQueryType) {
    return api.get(UserRoutes.getUsers, { params: data });
  }

  static patchUser(id: string, data: Partial<User>) {
    return api.patch(`${UserRoutes.patchUser}/${id}`, data);
  }

  static deleteUser(id: string) {
    return api.delete(`${UserRoutes.deleteUser}/${id}`);
  }

  static getProfile() {
    return api.get(UserRoutes.getProfile);
  }

  // CORREGIDO: Usar la interfaz específica y asegurar el ID
  static updateProfile(id: number, data: UpdateProfileData) {
    return api.patch(`${UserRoutes.updateProfile}/${id}`, data);
  }

  static changePassword(data: ChangePasswordData) {
    return api.put(UserRoutes.changePassword, data);
  }
}
