
import { ProductsService } from "@/services/products/products.service";
import { useEffect, useState, useCallback } from "react";

const useGetProducts = () => {
    const [loading, setLoading] = useState(false);
    const [productsResponse, setProductsResponse] = useState([]);
    const [modified, setModified] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState(4);

    const getProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await ProductsService.getProducts({ search, page, itemsPerPage, companyId });
            setProductsResponse(data.data.data);
            setTotalPage(data.data.totalPages);
            setTotal(data.data.total);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    }, [search, page, itemsPerPage]);

    useEffect(() => {
        getProducts();
    }, [modified, search, page, itemsPerPage, getProducts]);

    return { setModified, loading, productsResponse, modified, totalPage, total, setPage, setItemsPerPage, setSearch, page, itemsPerPage };
};

export default useGetProducts;