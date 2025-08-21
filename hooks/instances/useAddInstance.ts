import { InstancesServices } from "@/services/instances/instance.service";
import { InstanceType } from "@/services/instances/types";
import { useState } from "react";


const useAddInstance = () => {
    const [loading, setLoading] = useState(false);
    const newInstance = async (params: InstanceType) => {
        try {
            setLoading(true);
            const { data, status } = await InstancesServices.AddInstance(params);
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
    return { newInstance, loading };
};
export default useAddInstance;