// hooks/useRoleTranslation.ts
import { roleTranslations } from "@/utils/roleTranslations";

export const useRoleTranslation = () => {
  const translateRole = (role: string): string => {
    return roleTranslations[role] ?? role;
  };

  return { translateRole };
};
