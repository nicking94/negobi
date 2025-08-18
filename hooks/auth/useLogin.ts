import { useState } from "react";
import { LoginType } from "@/types";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { NEGOBI_JWT_REFRESH_TOKEN, NEGOBI_JWT_TOKEN } from "@/utils/constants";


const useLogin = () => {
    const [loading, setLoading] = useState(false);

    const onLogin = async (params: LoginType) => {
        try {
            setLoading(true);
            const { data , status} = await AuthService.loginAction(params);
                if(status === 200){
                if (NEGOBI_JWT_TOKEN && NEGOBI_JWT_REFRESH_TOKEN) {
                    localStorage.setItem(NEGOBI_JWT_TOKEN, data.data.access_token);
                    localStorage.setItem(NEGOBI_JWT_REFRESH_TOKEN, data.data.refresh_token);
                } else {
                    console.error("Las claves de token no están definidas.");
                }
                return status;
            }else{
                toast.error(data.message);
            }
        } catch (e: any) {
            return e.response;
        } finally {
            setLoading(false);
        }
    };

    return { onLogin, loading };
};

export default useLogin;

