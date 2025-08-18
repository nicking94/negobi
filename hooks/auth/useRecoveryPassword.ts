import { useState } from "react";
import { RecoveryPasswordType } from "@/types";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";




const useRecoveryPassword = () => {
    const [loading, setLoading] = useState(false);

    const onRecoveryPassword = async (params: RecoveryPasswordType) => {
        try {
            setLoading(true);
            const { data } = await AuthService.recoveryPasswordAction(params);
            if (data) {
                return data;
            } else {
                toast.error(data.message);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Error desconocido");
            }
        } finally {
            setLoading(false);
        }
    };

    return { onRecoveryPassword, loading };
};

export default useRecoveryPassword;

