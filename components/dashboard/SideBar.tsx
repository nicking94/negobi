"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  FaHome,
  FaBuilding,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaFileUpload,
  FaShoppingCart,
  FaClipboardList,
  FaTruck,
  FaCreditCard,
  FaUsers,
  FaMapMarkerAlt,
  FaUserCheck,
  FaBookOpen,
  FaBoxOpen,
  FaLandmark,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFolder,
  FaCogs,
  FaUserTie,
  FaTags,
  FaWarehouse,
  FaDollarSign, // Icono para ventas
  FaBox, // Icono para productos
  FaUserFriends, // Icono para vendedores
} from "react-icons/fa";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

interface SubmenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}
interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  hasSubmenu?: boolean;
  submenuItems?: SubmenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: FaHome, label: "Inicio", path: "/dashboard" },
  {
    icon: FaFileAlt,
    label: "Documentos",
    hasSubmenu: true,
    submenuItems: [
      {
        icon: FaFileInvoiceDollar,
        label: "Facturas",
        path: "/dashboard/documents/bills",
      },
      {
        icon: FaFileUpload,
        label: "Devoluciones de facturas",
        path: "/dashboard/documents/devolutions",
      },
      {
        icon: FaShoppingCart,
        label: "Pedidos",
        path: "/dashboard/documents/orders",
      },
      {
        icon: FaClipboardList,
        label: "Presupuestos",
        path: "/dashboard/documents/budgets",
      },
      {
        icon: FaTruck,
        label: "Notas de entrega",
        path: "/dashboard/documents/deliveryNotes",
      },
    ],
  },
  {
    icon: FaCogs,
    label: "Operaciones",
    hasSubmenu: true,
    submenuItems: [
      {
        icon: FaCreditCard,
        label: "Cobranzas",
        path: "/dashboard/collections",
      },
      {
        icon: FaUsers,
        label: "Visitas",
        path: "/dashboard/visits",
      },
      {
        icon: FaMapMarkerAlt,
        label: "Geolocalización",
        path: "/dashboard/geolocalization",
      },
    ],
  },
  {
    icon: FaFolder,
    label: "Maestros",
    hasSubmenu: true,
    submenuItems: [
      {
        icon: FaUserCheck,
        label: "Clientes",
        path: "/dashboard/masters/clients",
      },
      {
        icon: FaUserTie,
        label: "Proveedores",
        path: "/dashboard/masters/suppliers",
      },
      {
        icon: FaTags,
        label: "Instancias",
        path: "/dashboard/masters/instances",
      },
      {
        icon: FaWarehouse,
        label: "Almacenes",
        path: "/dashboard/masters/warehouses",
      },
      {
        icon: FaBoxOpen,
        label: "Productos",
        path: "/dashboard/masters/products",
      },
      {
        icon: FaLandmark,
        label: "Servicios",
        path: "/dashboard/masters/services",
      },
    ],
  },
  {
    icon: FaChartBar,
    label: "Indicadores",
    hasSubmenu: true,
    submenuItems: [
      {
        icon: FaChartLine,
        label: "Operaciones",
        path: "/dashboard/indicators/operations",
      },
      {
        icon: FaDollarSign,
        label: "Ventas",
        path: "/dashboard/indicators/sales",
      },
      {
        icon: FaBox,
        label: "Productos",
        path: "/dashboard/indicators/products",
      },
      {
        icon: FaUserFriends,
        label: "Vendedores",
        path: "/dashboard/indicators/sellers",
      },
    ],
  },
  { icon: FaChartPie, label: "Reportes", path: "/dashboard/reports" },
];

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  const pathname = usePathname();

  const isSubmenuActive = (submenuItems: SubmenuItem[] = []) => {
    return submenuItems.some(
      (subItem) =>
        pathname === subItem.path || pathname.startsWith(`${subItem.path}/`)
    );
  };

  const getInitialOpenDropdowns = () => {
    return menuItems.reduce((acc, item, index) => {
      if (
        item.hasSubmenu &&
        item.submenuItems &&
        isSubmenuActive(item.submenuItems)
      ) {
        return [...acc, index];
      }
      return acc;
    }, [] as number[]);
  };

  const [openDropdowns, setOpenDropdowns] = useState<number[]>(
    getInitialOpenDropdowns
  );

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;

    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Overlay para móviles */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden",
          sidebarOpen
            ? "opacity-100 block"
            : "opacity-0 hidden pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white/95 backdrop-blur-sm border-r border-gray_xl/60 flex flex-col shadow-xl transition-all duration-300 ease-in-out fixed md:relative z-50 h-screen",
          sidebarOpen
            ? "w-64 md:w-72 left-0 opacity-100"
            : "w-0 md:w-20 -left-full md:left-0 opacity-0 md:opacity-100 overflow-hidden"
        )}
      >
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute right-4 top-4 p-2 rounded-lg bg-gray_xxl hover:bg-gray_xl text-gray_b"
        >
          <X className="w-5 h-5" />
        </button>

        <nav className="flex-1 py-6 overflow-y-auto mt-12 lg:mt-0">
          <ul className="space-y-1 px-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(index)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group",
                        isItemActive(item.path) ||
                          (item.hasSubmenu &&
                            isSubmenuActive(item.submenuItems))
                          ? "bg-gradient-to-r from-green_m to-green_b text-white shadow-lg shadow-green_m/25"
                          : "text-gray_b hover:bg-gray_xxl hover:text-black hover:shadow-md"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-transform duration-300",
                          isItemActive(item.path) ||
                            (item.hasSubmenu &&
                              isSubmenuActive(item.submenuItems))
                            ? "text-white"
                            : "text-gray_m group-hover:text-gray_b",
                          "group-hover:scale-110"
                        )}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {openDropdowns.includes(index) ? (
                        <HiChevronDown
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isItemActive(item.path)
                              ? "text-white"
                              : "text-gray_m group-hover:text-gray_b"
                          )}
                        />
                      ) : (
                        <HiChevronRight
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isItemActive(item.path)
                              ? "text-white"
                              : "text-gray_m group-hover:text-gray_b",
                            "group-hover:translate-x-1"
                          )}
                        />
                      )}
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        openDropdowns.includes(index)
                          ? "max-h-96 opacity-100 mt-2"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <ul className="space-y-1 ml-6 pl-4 border-l-2 border-gray_xl">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subItem.path}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-300 group",
                                isItemActive(subItem.path)
                                  ? "text-black bg-green_xxl"
                                  : "text-gray_b hover:text-black hover:bg-gray_xxl"
                              )}
                            >
                              <subItem.icon
                                className={cn(
                                  "w-4 h-4 transition-colors duration-300",
                                  isItemActive(subItem.path)
                                    ? "text-gray_b"
                                    : "text-gray_m group-hover:text-gray_b"
                                )}
                              />
                              <span className="text-left">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.path || "#"}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group",
                      isItemActive(item.path)
                        ? "bg-gradient-to-r from-green_m to-green_b text-white shadow-lg shadow-green_m/25"
                        : "text-gray_b hover:bg-gray_xxl hover:text-black hover:shadow-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        isItemActive(item.path) ||
                          (item.hasSubmenu &&
                            isSubmenuActive(item.submenuItems))
                          ? "text-white"
                          : "text-gray_m group-hover:text-gray_b",
                        "group-hover:scale-110"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray_xxl">
          <div className="text-xs text-gray_m text-center">
            © Buisuch Technology <br /> Todos los derechos reservados
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
