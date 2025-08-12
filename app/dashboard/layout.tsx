"use client";
import { SidebarProvider } from "@/context/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <SidebarProvider>{children}</SidebarProvider>;
};
export default DashboardLayout;
