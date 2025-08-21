export type InstanceType = {
    category_name: string;
    category_code: string;
    description: string;
    parentCategoryId: number;
}

export type InstanceQueryType = {
    search: string;
    page: number;
    itemsPerPage: number;
}