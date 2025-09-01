import { getWarehouses } from "@/services/warehouse/warehouse.service";
import { useEffect, useState, useCallback } from "react";

const useGetWarehouses = () => {
  const [loading, setLoading] = useState(false);
  const [warehousesResponse, setWarehousesResponse] = useState([]);
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState(5);

  const getOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getWarehouses({
        search,
        page,
        itemsPerPage,
        companyId,
      });
      setWarehousesResponse(data.data.data);
      setTotalPage(data.data.totalPages);
      setTotal(data.data.total);
    } catch (e) {
      return e;
    } finally {
      setLoading(false);
    }
  }, [search, page, itemsPerPage]);

  useEffect(() => {
    getOrganizations();
  }, [modified, search, page, itemsPerPage, getOrganizations]);

  return {
    setModified,
    loading,
    warehousesResponse,
    modified,
    totalPage,
    total,
    setPage,
    setItemsPerPage,
    setSearch,
    page,
    itemsPerPage,
  };
};

export default useGetWarehouses;
