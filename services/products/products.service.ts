import { Product } from '@/app/dashboard/masters/products/page';
import * as ProductsRoutes from './products.routes'
import api from '@/utils/api'

export class ProductsService {
    static createProduct = async (data: Product) => await api.post(ProductsRoutes.postProduct, data);


}
