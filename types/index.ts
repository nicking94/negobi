export type LoginType = {
    email: string;
    password: string;
    legal_tax_id: string;
}

export type RecoveryPasswordType = {
    email: string;
    legal_tax_id: string;
}

export type OrganizationType = {
    name: string;
    contact_email: string;
    legal_tax_id: string;
    main_phone: string;
}

export type OrganizationQueryType = {
    search: string,
    page: number,
    itemsPerPage: number,
}


