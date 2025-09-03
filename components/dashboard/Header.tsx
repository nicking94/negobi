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
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const DashboardHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("http://localhost:3000/");
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray_xxl px-4 md:px-6 lg:px-8 py-3 md:py-4 shadow-sm">
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
          <div className="flex bg-gray_xxl rounded-lg p-1 shadow-inner gap-1 ">
            <button className="px-2 md:px-3 lg:px-4 py-1 md:py-2 bg-gradient-to-r from-green_m to-green_b text-white text-xs font-medium rounded-md shadow-sm transition-all duration-300">
              VES
            </button>
            <button className="bg-white hover:bg-gray_xxl px-2 md:px-3 lg:px-4 py-1 md:py-2 text-gray_m text-xs font-medium rounded-md hover:shadow-sm transition-all duration-300">
              USD
            </button>
          </div>

          <div className="block text-xs text-gray_b font-medium">
            ORGANIZACIÓN Negobi
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 md:gap-2 lg:gap-3 text-sm hover:bg-white rounded-lg px-2 md:px-3 py-1 md:py-2"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-green_xl to-green_b rounded-md flex items-center justify-center text-white font-semibold text-[10px] md:text-xs">
                  PS
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-black text-xs md:text-sm">
                    Negobi
                  </div>
                  <div className="text-[10px] md:text-xs text-gray_m">
                    Propietario
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray_m" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 md:w-64 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
            >
              {/* Nuevo item de Perfil */}
              <DropdownMenuItem className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm">
                <Link
                  href="/dashboard/settings/profile"
                  className="flex items-center w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Link>
              </DropdownMenuItem>

              {/* Submenú de Configuración */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm flex items-center">
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
                        href="/dashboard/settings/roles"
                        className="flex items-center w-full"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Roles
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

              <DropdownMenuItem
                className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1 text-xs md:text-sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
export default DashboardHeader;
