export interface ApiError {
  response?: {
    data?: {
      message?: string;
      statusCode?: number;
      success?: boolean;
    };
    status?: number;
  };
  status?: number;
  message?: string;
  statusCode?: number;
  success?: boolean;
}

export interface UserType {
  id: number;
  name: string;
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
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  externalId?: number;
  dni?: string;
}

export interface ClientType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  external_code?: string;
  sync_with_erp?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ClientTypesResponse {
  success: boolean;
  data: {
    message: string;
    data?: ClientType[];
  };
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

export type SupplierType = {
  id: number;
  companyId: number;
  supplier_code: string;
  legal_name: string;
  tax_document_type: string;
  tax_document_number: string;
  person_type: string;
  email: string;
  main_phone: string;
  mobile_phone: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  commercial_name: string;
  address: string;
  fiscal_address: string;
  zip_code: string;
  paymentTermId: number;
  credit_limit: number;
  credit_days: number;
  notes: string;
  balance_due: number;
  advance_balance: number;
  last_purchase_date: string;
  last_purchase_number: string;
  last_purchase_amount: number;
  last_payment_date: string;
  last_payment_number: string;
  last_payment_amount: number;
  is_active: boolean;
  created_by: string;
  updated_by: string;

  // Additional fields from responses
  external_code?: string;
  sync_with_erp?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type SupplierCreatePayload = Omit<
  SupplierType,
  | "id"
  | "external_code"
  | "sync_with_erp"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export type SupplierUpdatePayload = Partial<SupplierCreatePayload>;

export type SupplierResponse = {
  success: boolean;
  data: SupplierType;
};

// Actualiza en tus types:
export type SuppliersListResponse = {
  success: boolean;
  data: {
    data: SupplierType[];
    totalPages: number;
    total: number;
  };
};

export type SupplierDeleteResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

// Sync Types
export type SupplierSyncPayload = {
  companyId: number;
  data: SupplierCreatePayload[];
};

export type SupplierSyncResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

// Query Parameters
export type SupplierQueryType = {
  page: number;
  itemsPerPage: number;
  order?: "ASC" | "DESC";
  search?: string;
  companyId?: number;
  supplier_code?: string;
  legal_name?: string;
  tax_document_type?: string;
  tax_document_number?: string;
  person_type?: string;
  email?: string;
  contact_person?: string;
  commercial_name?: string;
  paymentTermId?: number;
  is_active?: boolean;
};

export type PaymentTermType = {
  id: number;
  term_name: string;
  term_description: string;
  number_of_days: number;
  is_active: boolean;
  external_code?: string;
  sync_with_erp?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type PaymentTermCreatePayload = {
  term_name: string;
  term_description: string;
  number_of_days: number;
  is_active: boolean;
};

export type PaymentTermUpdatePayload = Partial<PaymentTermCreatePayload>;

export type PaymentTermsResponse = {
  success: boolean;
  data: PaymentTermType[];
};

export type PaymentTermResponse = {
  success: boolean;
  data: PaymentTermType;
};

export type PaginatedPaymentTermsResponse = {
  success: boolean;
  data: {
    data: PaymentTermType[];
    totalPages: number;
    total: number;
  };
};

export type PaymentTermDeleteResponse = {
  success: boolean;
  data: {
    message: string;
  };
};

export type GetPaymentTermsParams = {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  term_name?: string;
  term_description?: string;
  number_of_days?: number;
  is_active?: boolean;
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
