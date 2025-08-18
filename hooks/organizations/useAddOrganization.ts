import { OrganizationsService } from "@/services/organizations/organizations.service";
import { OrganizationType } from "@/types";
import { useState } from "react";


const usePostOrganizations = () => {
    const [loading, setLoading] = useState(false);
    const newOrganizations = async (params: OrganizationType) => {
        try {
            setLoading(true);
            const { data, status } = await OrganizationsService.AddOrganizations(params);
            console.log(data);
            return { data, status };
        } catch (e: unknown) {
            if (e instanceof Error) {
                return e.message;
            } else {
                return "Error desconocido";
            }
        } finally {
            setLoading(false);
        }
    };
    return { newOrganizations, loading };
};
export default usePostOrganizations;