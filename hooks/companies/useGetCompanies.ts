import { CompaniesService } from "@/services/companies/companies.service";
import { useEffect, useState, useCallback } from "react";

const useGetCompanies = () => {
    const [loading, setLoading] = useState(false);
    const [companiesResponse, setCompaniesResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const getCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await CompaniesService.getCompanies({ search, page, itemsPerPage });
            setCompaniesResponse(data.data.data);
            setTotalPage(data.data.totalPages);
            setTotal(data.data.total);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    }, [search, page, itemsPerPage]);

    useEffect(() => {
        getCompanies();
    }, [modified, search, page, itemsPerPage, getCompanies]);

    return { setModified, loading, companiesResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetCompanies;