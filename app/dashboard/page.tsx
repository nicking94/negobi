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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Compras mensuales 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <MonthlyPurchasesChart />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green_b rounded-full"></div>
                  Ventas mensuales 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
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
