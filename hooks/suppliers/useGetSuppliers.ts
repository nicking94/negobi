import { useEffect, useState, useCallback } from "react";
import { SupplierType, SupplierQueryType } from "@/types";
import { supplierService } from "@/services/suppliers/suppliers.service";

const useGetSuppliers = () => {
  const [loading, setLoading] = useState(false);
  const [suppliersResponse, setSuppliersResponse] = useState<SupplierType[]>(
    []
  );
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();

  const getSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const params: SupplierQueryType = {
        page,
        itemsPerPage,
        search,
        companyId,
        is_active: isActive,
      };

      const response = await supplierService.getSuppliers(params);

      setSuppliersResponse(response.data.data);
      setTotalPage(response.data.totalPages);
      setTotal(response.data.total);
    } catch (e) {
      console.error("Error fetching suppliers:", e);
      return e;
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage, companyId, isActive]);

  useEffect(() => {
    getSuppliers();
  }, [modified, search, page, itemsPerPage, companyId, isActive, getSuppliers]);

  return {
    setModified,
    loading,
    suppliersResponse,
    modified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch,
    setCompanyId,
    setIsActive,
    page,
    itemsPerPage,
    search,
    companyId,
    isActive,
  };
};

export default useGetSuppliers;
