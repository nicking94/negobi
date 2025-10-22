import {
  LoginType,
  RecoveryPasswordType,
  RegisterType,
  ChangePasswordType,
  ValidateOtpType,
} from "@/types";
import * as authRoute from "./auth.route";
import api from "@/utils/api";

export class AuthService {
  static loginAction = async (data: LoginType) =>
    await api.post(authRoute.authLogin, data);

  static companyLoginAction = async (data: any) =>
    await api.post(authRoute.authCompanyLogin, data);

  static refreshTokenAction = async () => await api.get(authRoute.authRefresh);

  static recoveryPasswordAction = async (data: RecoveryPasswordType) =>
    await api.post(authRoute.authRecoveryPassword, data);

  static validateOtpAction = async (data: ValidateOtpType) =>
    await api.post(authRoute.authValidateOtp, data);

  static changePasswordAction = async (data: ChangePasswordType) =>
    await api.put(authRoute.authChangePassword, data);

  static registerAction = async (data: RegisterType) =>
    await api.post(authRoute.authRegister, data);
}
