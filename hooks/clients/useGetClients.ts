import { ClientsService } from "@/services/clients/clients.service";
import { useEffect, useState, useCallback } from "react";

const useGetClients = () => {
    const [loading, setLoading] = useState(false);
    const [clientsResponse, setClientsResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const getClients = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await ClientsService.getClients({ search, page, itemsPerPage });
            setClientsResponse(data.data.data);
            setTotalPage(data.data.totalPages);
            setTotal(data.data.total);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    }, [search, page, itemsPerPage]);

    useEffect(() => {
        getClients();
    }, [modified, search, page, itemsPerPage, getClients]);

    return { setModified, loading, clientsResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetClients;