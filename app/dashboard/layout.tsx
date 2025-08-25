"use client";
import { SidebarProvider } from "@/context/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full h-screen max-h-screen overflow-hidden flex-1">
        {children}
      </div>
    </SidebarProvider>
  );
};
export default DashboardLayout;