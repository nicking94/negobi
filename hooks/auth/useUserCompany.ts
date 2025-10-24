// hooks/auth/useUserCompany.ts - ACTUALIZADO
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { UsersService } from "@/services/users/users.service";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  role: string;
  company_id?: number;
  branch_id?: number;
  seller_code?: string;
  external_code?: string;
  erp_cod_sucu?: string;
  company?: {
    id: number;
    name: string;
    legal_tax_id: string;
    contact_email: string;
    external_code?: string;
  };
}

export const useUserCompany = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCompany, setUserCompany] = useState<any>(null);
  // ✅ NUEVO: Estado para la empresa seleccionada
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Si ya tenemos el perfil, no hacer fetch nuevamente
      if (userProfile && userProfile.id === parseInt(user.id)) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await UsersService.getProfile();

        if (response.success && response.data) {
          const profileData: UserProfile = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            phone: response.data.phone,
            is_active: response.data.is_active,
            role: response.data.role,
            company_id: response.data.company_id,
            branch_id: response.data.branch_id,
            seller_code: response.data.seller_code,
            external_code: response.data.external_code,
            erp_cod_sucu: response.data.erp_cod_sucu,
            company: response.data.company,
          };

          setUserProfile(profileData);

          if (response.data.company) {
            setUserCompany(response.data.company);
            // ✅ Inicializar selectedCompanyId con la empresa del usuario
            if (!selectedCompanyId && response.data.company.id) {
              setSelectedCompanyId(response.data.company.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (user) {
          const fallbackProfile: UserProfile = {
            id: parseInt(user.id),
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_active: true,
            role: user.role,
            company_id: user.company_id,
          };
          setUserProfile(fallbackProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]); // Solo dependencia de user

  // CORRECCIÓN: Usar useMemo para evitar recálculos innecesarios
  const companyId = useMemo(() => {
    // ✅ Prioridad: selectedCompanyId > userCompany > userProfile
    return (
      selectedCompanyId ||
      userProfile?.company_id ||
      userCompany?.id ||
      user?.company_id ||
      undefined
    );
  }, [
    selectedCompanyId,
    userProfile?.company_id,
    userCompany?.id,
    user?.company_id,
  ]);

  const isSuperAdmin = user?.role === "superAdmin";
  const isAdmin = user?.role === "directive";
  const isSeller = user?.role === "seller";

  const canAccessOrganizations = isSuperAdmin;
  const canAccessCompanies = isSuperAdmin;
  const canAccessBranches = isSuperAdmin || isAdmin;
  const canAccessUsers = isSuperAdmin || isAdmin;

  return {
    companyId,
    selectedCompanyId, // ✅ NUEVO: Exportar selectedCompanyId
    setSelectedCompanyId, // ✅ NUEVO: Exportar setSelectedCompanyId
    isLoading: isLoading || authLoading,
    hasCompany: !!companyId,
    user: userProfile,
    userProfile,
    isSuperAdmin,
    isAdmin,
    isSeller,
    canAccessOrganizations,
    canAccessCompanies,
    canAccessBranches,
    canAccessUsers,
    userCompany,
  };
};

export default useUserCompany;
