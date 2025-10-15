// app/dashboard/layout.tsx
"use client";
import { SidebarProvider } from "@/context/SidebarContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CurrencyProvider } from "@/context/CurrencyContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <CurrencyProvider>
          <div className="w-full h-screen max-h-screen overflow-hidden flex-1">
            {children}
          </div>
        </CurrencyProvider>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
