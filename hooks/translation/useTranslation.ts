// hooks/useTranslation.ts
import { roleTranslations } from "@/utils/roleTranslations";
import { clientTypeTranslations } from "@/utils/clientTypeTranslations";

export const useTranslation = () => {
  const translateRole = (role: string): string => {
    return roleTranslations[role] ?? role;
  };

  const translateClientType = (clientType: string): string => {
    return clientTypeTranslations[clientType] ?? clientType;
  };

  return { translateRole, translateClientType };
};
