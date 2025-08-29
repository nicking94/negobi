"use client"
import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { toast } from "sonner";




const useValidateOtp = () => {
    const [loading, setLoading] = useState(false);

    const onValidateOtp = async (params: { email: string; legal_tax_id: string; otp: string }) => {
        try {
            setLoading(true);
            const { data, status } = await AuthService.validateOtpAction(params);
            if (data) {
                localStorage.setItem("tempToken", data.data.access_token);
                return { data, status }
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

    return { onValidateOtp, loading };
};

export default useValidateOtp;