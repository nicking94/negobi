"use client";
import DashboardHeader from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyPurchasesChart from "@/components/dashboard/MonthlyPurchasesChart";
import MonthlySalesChart from "@/components/dashboard/MonthlySalesChart";
import { useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/dashboard/SideBar";

const Dashboard = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl  to-green_xxl/30">
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray_xxl  to-gray_l/20 overflow-hidden">
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 h-full">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col h-full">
              <CardHeader className="pb-2 md:pb-3 lg:pb-4">
                <CardTitle className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Compras mensuales 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-2 md:p-4 lg:p-6 overflow-auto">
                <MonthlyPurchasesChart />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col h-full">
              <CardHeader className="pb-2 md:pb-3 lg:pb-4">
                <CardTitle className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green_b rounded-full"></div>
                  Ventas mensuales 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-2 md:p-4 lg:p-6 overflow-auto">
                <MonthlySalesChart />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
