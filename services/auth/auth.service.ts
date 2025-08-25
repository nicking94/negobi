import { LoginType, RecoveryPasswordType } from "@/types";
import * as authRoute from "./auth.route";
import api from "@/utils/api";

export class AuthService {
    static loginAction = async (data : LoginType) => await api.post(authRoute.authLogin, data);

    static recoveryPasswordAction = async (data: RecoveryPasswordType) => await api.post(authRoute.recoveyPassword, data);

    static validateOtpAction = async (data: { email: string; legal_tax_id: string; otp: string }) => await api.post(authRoute.validateOtp, data);

}
