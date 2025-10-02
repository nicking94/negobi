// app/dashboard/layout.tsx
"use client";
import { SidebarProvider } from "@/context/SidebarContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="w-full h-screen max-h-screen overflow-hidden flex-1">
          {children}
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
