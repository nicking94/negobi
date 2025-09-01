import { Supplier } from "@/app/dashboard/masters/suppliers/page";
import * as SupplierRoute from "./suppliers.route"
import api from "@/utils/api";

export class SupplierService {

    static async getSuppliers() {
        return api.get(SupplierRoute.getSuppliers);
    }

    static async postSuppliers(data: Supplier) {
        return api.post(SupplierRoute.postSuppliers, data);
    }

    static async putSuppliers(id: number, data: Supplier) {
        return api.patch(`${SupplierRoute.putSuppliers}/${id}`, data);
    }

    static async deleteSuppliers(id: number) {
        return api.delete(`${SupplierRoute.deleteSuppliers}/${id}`);
    }
}