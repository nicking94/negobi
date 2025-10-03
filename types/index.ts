export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  status?: number;
  message?: string;
}

export type OrganizationPayload = {
  name: string;
  contact_email?: string;
  legal_tax_id?: string;
  main_phone?: string;
  is_active?: boolean;
  logo?: string;
  companies?: string[];
  roles?: string[];
};

export type RegisterType = {
  name: string;
  legal_tax_id: string;
  contact_email: string;
  main_phone: string;
  fiscal_address: string;
  code?: string;
  is_active?: boolean;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
  organizationId?: number;
  api_key_duration_days?: number;
};

export type ApiKeyType = {
  id: string;
  key: string;
  company_id: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  duration_days: number;
};

export type RegisterResponseData = {
  id: string;
  name: string;
  legal_tax_id: string;
  contact_email: string;
  main_phone: string;
  fiscal_address: string;
  code?: string;
  is_active: boolean;
  company_id?: string;
  organization_id?: string;
  api_key: ApiKeyType;
  admin_user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
};

export type RegisterResponse = {
  success: boolean;
  message?: string;
  data: RegisterResponseData;
};

export type LoginType = {
  email: string;
  password: string;
  legal_tax_id?: string;
};

export type RecoveryPasswordType = {
  email: string;
  legal_tax_id: string;
};
export interface OrganizationResponse {
  success: boolean;
  data: {
    external_code: string;
    sync_with_erp: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    id: number;
    name: string;
    legal_tax_id: string;
    contact_email: string;
    main_phone: string;
    is_active: boolean;
  };
}

export interface OrganizationsListResponse {
  success: boolean;
  data: {
    data: OrganizationType[];
    totalPages: number;
    total: number;
  };
}

// Tipo para empresas existentes (con todos los campos requeridos)
export type CompanyType = {
  id: number;
  organizationId: number;
  name: string;
  legal_tax_id: string;
  api_key_duration_days: number;
  code: string;
  contact_email: string;
  main_phone: string;
  fiscal_address: string;
  is_active: boolean;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
  created_at: Date;
  external_code?: string;
  sync_with_erp?: boolean;
  updated_at?: Date;
  deleted_at?: Date;
  api_key?: string;
  api_key_expiration_date?: Date;
};

// Tipo para crear nuevas empresas (sin id, organizationId, created_at)
export type NewCompanyType = {
  name: string;
  legal_tax_id: string;
  api_key_duration_days: number;
  code: string;
  contact_email: string;
  main_phone: string;
  fiscal_address: string;
  is_active: boolean;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
};

export type OrganizationType = {
  id?: string;
  name: string;
  contact_email?: string;
  legal_tax_id?: string;
  main_phone?: string;
  is_active?: boolean;
  companies?: string[];
  roles?: string[];
  logo?: string;
};

export type OrganizationQueryType = {
  search: string;
  page: number;
  itemsPerPage: number;
  companyId?: number;
};

export type WarehouseQueryType = {
  search: string;
  page: number;
  itemsPerPage: number;
  companyId?: number;
};
