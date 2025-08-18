"use client";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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
          <div className="flex bg-gray_xxl rounded-lg p-1 shadow-inner gap-1 md:gap-2">
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
              className="w-40 md:w-48 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
            >
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
