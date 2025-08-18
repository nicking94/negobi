
import { OrganizationsService } from "@/services/organizations/organizations.service";
import { useEffect, useState } from "react";



const useGetOrganizations = () => {
    const [loading, setLoading] = useState(false);
    const [organizationsResponse, setOrganizationsResponse] = useState([]);
    const [modified, setModified] = useState(false);

    const getOrganizations = async () => {
        try {
            setLoading(true);
            const { data } = await OrganizationsService.GetOrganizations();
            setOrganizationsResponse(data.data.data);
        } catch (e) {
            return e;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrganizations();
    }, [modified]);

    return { setModified, loading, organizationsResponse, modified };
};

export default useGetOrganizations;