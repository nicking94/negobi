// hooks/useTranslation.ts
import { roleTranslations } from "@/utils/roleTranslations";
import { clientTypeTranslations } from "@/utils/clientTypeTranslations";
import { documentTypeTranslations } from "@/utils/documentTypeTranslations";

export const useTranslation = () => {
  const translateRole = (role: string): string => {
    return roleTranslations[role] ?? role;
  };

  const translateClientType = (clientType: string): string => {
    return clientTypeTranslations[clientType] ?? clientType;
  };

  const translateDocumentType = (documentType: string): string => {
    return documentTypeTranslations[documentType] ?? documentType;
  };

  return { translateRole, translateClientType, translateDocumentType };
};
