"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  FaCog,
  FaUser,
  FaShieldAlt,
  FaBell,
  FaFolder,
} from "react-icons/fa";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

const menuItems = [
  { icon: FaHome, label: "Inicio", path: "/dashboard" },
  {
    icon: FaBuilding,
    label: "Organizaciones",
    path: "/dashboard/organizations",
  },
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
  { icon: FaCreditCard, label: "Cobranzas", path: "/dashboard/collections" },
  { icon: FaUsers, label: "Visitas", path: "/dashboard/visits" },
  {
    icon: FaMapMarkerAlt,
    label: "Geolocalización",
    path: "/dashboard/geolocalization",
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
        icon: FaBookOpen,
        label: "Instancias",
        path: "/dashboard/masters/instances",
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
    label: "Estadísticas de ventas",
    hasSubmenu: true,
    submenuItems: [
      {
        icon: FaChartLine,
        label: "Operaciones",
        path: "/dashboard/statistics/operations",
      },
    ],
  },
  { icon: FaChartPie, label: "Reportes", path: "/dashboard/reports" },
  {
    icon: FaCog,
    label: "Configuración",
    hasSubmenu: true,
    submenuItems: [
      { icon: FaUser, label: "General", path: "/dashboard/settings/general" },
      { icon: FaShieldAlt, label: "Metas", path: "/dashboard/settings/goals" },
      {
        icon: FaBell,
        label: "Planificación",
        path: "/dashboard/settings/planification",
      },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen } = useSidebar();
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);
  const pathname = usePathname();

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Función para verificar si un item está activo
  const isItemActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-sm border-r border-gray_xl/60 flex flex-col shadow-xl transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-72" : "w-0 opacity-0 overflow-hidden"
      )}
    >
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleDropdown(index)}
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
                        isItemActive(item.path)
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
                        ? "max-h-48 opacity-100 mt-2"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="space-y-1 ml-6 pl-4 border-l-2 border-slate-200">
                      {item.submenuItems?.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            href={subItem.path}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-300 group",
                              isItemActive(subItem.path)
                                ? "text-black bg-gray_xl"
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
                      isItemActive(item.path)
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
          © Buisuch Technology <br /> Todos los derechos reservados{" "}
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
