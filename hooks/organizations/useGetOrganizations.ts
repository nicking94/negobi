import { OrganizationsService } from "@/services/organizations/organizations.service";
import { useEffect, useState, useCallback } from "react";

const useGetOrganizations = () => {
    const [loading, setLoading] = useState(false);
    const [organizationsResponse, setOrganizationsResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const getOrganizations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await OrganizationsService.GetOrganizations({ search, page, itemsPerPage });
            setOrganizationsResponse(data.data.data);
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

    return { setModified, loading, organizationsResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetOrganizations;