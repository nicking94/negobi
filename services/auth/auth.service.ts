import { LoginType, RecoveryPasswordType } from "@/types";
import * as authRoute from "./auth.route";
import api from "@/utils/api";

export class AuthService {
    static loginAction = async (data : LoginType) => await api.post(authRoute.authLogin, data);

    static recoveryPasswordAction = async (data : RecoveryPasswordType) => await api.post(authRoute.recoveyPassword, data);
}
