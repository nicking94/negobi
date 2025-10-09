"use client";
import {
  ChevronDown,
  Menu,
  X,
  Settings,
  Building,
  Briefcase,
  MapPin,
  Users,
  Shield,
  Target,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import useLogout from "@/hooks/auth/useLogout";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/translation/useTranslation";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const DashboardHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) => {
  const { logout, user, refreshUserProfile } = useAuth();
  const { loading } = useLogout();
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const { translateRole } = useTranslation();

  useEffect(() => {
    const refreshProfile = async () => {
      if (user && (!user.first_name || !user.last_name || !user.role)) {
        setIsRefreshingProfile(true);
        try {
          await refreshUserProfile?.();
        } catch (error) {
          console.error("Error refreshing user profile:", error);
        } finally {
          setIsRefreshingProfile(false);
        }
      }
    };

    refreshProfile();
  }, [user, refreshUserProfile]);

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user) return "US";

    const { first_name, last_name, username } = user;

    if (first_name && last_name) {
      return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
    }

    if (first_name) {
      return `${first_name.charAt(0)}${
        first_name.charAt(1) || ""
      }`.toUpperCase();
    }

    if (last_name) {
      return `${last_name.charAt(0)}${last_name.charAt(1) || ""}`.toUpperCase();
    }

    if (username) {
      return username.substring(0, 2).toUpperCase();
    }

    return "US";
  };

  // Función para obtener el nombre completo del usuario
  const getUserFullName = () => {
    if (!user) return "Usuario";

    const { first_name, last_name, username, email } = user;

    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }

    if (first_name) {
      return first_name;
    }

    if (last_name) {
      return last_name;
    }

    return username || email?.split("@")[0] || "Usuario";
  };

  // Función para obtener el rol traducido usando tu hook
  const getUserRole = () => {
    if (!user?.role) return "Usuario";
    return translateRole(user.role);
  };

  const getOrganizationName = () => {
    if (!user) return "ORGANIZACIÓN";

    const { first_name, company_id } = user;

    if (company_id) {
      return `EMPRESA ${company_id}`;
    }

    if (first_name) {
      return first_name.toUpperCase();
    }

    return "ORGANIZACIÓN";
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray_xxl px-4 md:px-6 lg:px-8 py-3 md:py-4 shadow-sm">
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray_xxl hover:bg-gray_xl p-2 md:p-2"
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? (
              <X className="size-4 md:size-5 text-gray_b" />
            ) : (
              <Menu className="size-4 md:size-5 text-gray_b" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Selector de Moneda */}
          <div className="flex bg-gray_xxl rounded-lg p-1 shadow-inner gap-1 ">
            <button className="px-2 md:px-3 lg:px-4 py-1 md:py-2 bg-gradient-to-r from-green_m to-green_b text-white text-xs font-medium rounded-md shadow-sm transition-all duration-300">
              VES
            </button>
            <button className="bg-white hover:bg-gray_xxl px-2 md:px-3 lg:px-4 py-1 md:py-2 text-gray_m text-xs font-medium rounded-md hover:shadow-sm transition-all duration-300">
              USD
            </button>
          </div>

          {/* Nombre de la Organización */}
          <div className="hidden md:block text-xs text-gray_b font-medium">
            {getOrganizationName()}
          </div>

          {/* Dropdown del Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 md:gap-2 lg:gap-3 text-sm hover:bg-white rounded-lg px-2 md:px-3 py-1 md:py-2"
                disabled={isRefreshingProfile}
              >
                {isRefreshingProfile ? (
                  // Loading state
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-gray-200 rounded-md flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green_b"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="font-semibold text-black text-xs md:text-sm">
                        Cargando...
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hidden sm:block text-left">
                      <div className="font-semibold text-black text-xs md:text-sm">
                        {getUserFullName()}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray_m">
                        {getUserRole()}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray_m" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[18rem] md:w-64 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
            >
              {/* Información del Usuario en el Header del Dropdown */}
              <div className="px-2 py-3 border-b border-gray_xxl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green_xl to-green_b rounded-md flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray_b truncate">
                      {getUserFullName()}
                    </p>
                    <p className="text-xs text-gray_m truncate">
                      {user?.email || "No email"}
                    </p>
                    <p className="text-xs text-green_b font-medium">
                      {getUserRole()}
                    </p>
                    {user?.company_id && (
                      <p className="text-xs text-gray_m">
                        Empresa ID: {user.company_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Item de Perfil */}
              <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                <Link
                  href="/dashboard/settings/profile"
                  className="flex items-center w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer bg-white hover:bg-gray_xxl data-[state=open]:bg-gray_xxl rounded-md m-1 text-xs md:text-sm flex items-center focus:bg-gray_xxl focus:text-gray_b active:bg-gray_xxl active:text-gray_b">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-48">
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/organizations"
                        className="flex items-center w-full"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Organizaciones
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/settings/companies"
                        className="flex items-center w-full"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Empresas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/companyBranches"
                        className="flex items-center w-full"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Sucursal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/users"
                        className="flex items-center w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Usuarios
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/settings/general"
                        className="flex items-center w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        General
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/settings/goals"
                        className="flex items-center w-full"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Metas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                      <Link
                        href="/dashboard/settings/planification"
                        className="flex items-center w-full"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Planificación
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator className="bg-gray_xxl" />

              {/* Cerrar Sesión */}
              <DropdownMenuItem
                className="cursor-pointer bg-white hover:bg-red-50 text-red_b rounded-md m-1 text-xs md:text-sm"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
