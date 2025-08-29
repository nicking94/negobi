import { InstancesServices } from "@/services/instances/instance.service";
import { useEffect, useState, useCallback } from "react";

const useGetInstances = () => {
    const [loading, setLoading] = useState(false);
    const [instancesResponse, setInstancesResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const getInstances = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await InstancesServices.GetInstances({ search, page, itemsPerPage });
            setInstancesResponse(data.data.data);
            setTotalPage(data.data.totalPages);
            setTotal(data.data.total);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    }, [search, page, itemsPerPage]);

    useEffect(() => {
        getInstances();
    }, [modified, search, page, itemsPerPage, getInstances]);

    return { setModified, loading, instancesResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetInstances;