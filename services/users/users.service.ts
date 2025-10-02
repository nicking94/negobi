// services/users/users.service.ts
import { User } from "@/app/dashboard/users/page";
import * as UserRoutes from "./user.routes";
import api from "@/utils/api";
import { OrganizationQueryType } from "@/types";

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
  created_at?: string;
  updated_at?: string;
}

export interface ChangePasswordData {
  new_password: string; // ✅ Según el endpoint
  legal_tax_id: string; // ✅ Según el endpoint
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

  // ✅ Método para obtener el usuario autenticado
  static getProfile() {
    return api.get(UserRoutes.getProfile);
  }

  // ✅ Método para actualizar el perfil del usuario autenticado
  static updateProfile(data: Partial<UserProfile>) {
    return api.patch(`${UserRoutes.updateProfile}/${data.id}`, data);
  }

  // ✅ Método para cambiar contraseña - CORREGIDO según el endpoint
  static changePassword(data: ChangePasswordData) {
    return api.put(UserRoutes.changePassword, data); // ✅ PUT según el swagger
  }
}
