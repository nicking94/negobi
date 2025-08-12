"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"; // Importa useRouter

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const DashboardHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: DashboardHeaderProps) => {
  const router = useRouter(); // Obtiene el router

  const handleLogout = () => {
    // Aquí puedes agregar lógica adicional para cerrar sesión si es necesario
    router.push("http://localhost:3000/"); // Redirige a la página principal
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray_xxl px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray_xxl hover:bg-gray_xl"
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? (
              <X className="size-5 text-gray_b" />
            ) : (
              <Menu className="size-5 text-gray_b" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-gray_xxl rounded-lg p-1 shadow-inner gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-green_m to-green_b text-white text-xs font-medium rounded-md shadow-sm transition-all duration-300">
              VES
            </button>
            <button className="bg-white hover:bg-gray_xxl px-4 py-2 text-gray_m text-xs font-medium rounded-md  hover:shadow-sm transition-all duration-300">
              USD
            </button>
          </div>

          <div className="text-xs text-gray_b font-medium">
            ORGANIZACIÓN Perez Silva
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 text-sm hover:bg-white rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green_xl to-green_b rounded-md flex items-center justify-center text-white font-semibold text-xs">
                  PS
                </div>
                <div className="text-left">
                  <div className="font-semibold text-black">Perez Silva</div>
                  <div className="text-xs text-gray_m">Propietario</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray_m" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
            >
              <DropdownMenuItem
                className="cursor-pointer bg-white hover:bg-gray_xxl rounded-md m-1"
                onClick={handleLogout} // Añade el manejador de eventos
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
