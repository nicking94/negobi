import { ServiceService } from "@/services/servicios/services.service";
import { useEffect, useState, useCallback } from "react";

const useGetService = () => {
    const [loading, setLoading] = useState(false);
    const [servicesResponse, setServicesResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState(4);

    const getServices = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await ServiceService.getServices({ search, page, itemsPerPage, companyId });
            setServicesResponse(data.data.data);
            setTotalPage(data.data.totalPages);
            setTotal(data.data.total);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    }, [search, page, itemsPerPage]);

    useEffect(() => {
        getServices();
    }, [modified, search, page, itemsPerPage, getServices]);

    return { setModified, loading, servicesResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetService;