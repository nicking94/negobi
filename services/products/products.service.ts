import { Product } from '@/app/dashboard/masters/products/page';
import * as ProductsRoutes from './products.routes'
import api from '@/utils/api'
import { OrganizationQueryType } from '@/types';

export class ProductsService {
    static createProduct = async (data: Product) => await api.post(ProductsRoutes.postProduct, data);

    static getProducts = async (params: OrganizationQueryType) => await api.get(ProductsRoutes.getProducts, { params });

    static deleteProduct = async (id: number) => await api.delete(`${ProductsRoutes.deleteProduct}/${id}`);

    static updateProduct = async (id: number, data: Product) => await api.patch(`${ProductsRoutes.updateProduct}/${id}`, data);

}
