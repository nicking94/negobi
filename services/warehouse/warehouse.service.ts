import api from "@/utils/api";
import * as WarehouseRoute from "./warehouse.route";
import type { Warehouse } from "@/app/dashboard/masters/warehouses/page";
import type { WarehouseQueryType } from "@/types";

export const addWarehouse = (data: Warehouse) =>
  api.post(WarehouseRoute.addWarehouse, data);

export const getWarehouses = (query: WarehouseQueryType) =>
  api.get(WarehouseRoute.getWarehouses, { params: query });

export const deleteWarehouse = (id: string) =>
  api.delete(`${WarehouseRoute.deleteWarehouse}/${id}`);

export const updateWarehouse = (id: string, data: Warehouse) =>
  api.patch(`${WarehouseRoute.updateWarehouse}/${id}`, data);
