"use client";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyPurchasesChart from "@/components/dashboard/MonthlyPurchasesChart";
import MonthlySalesChart from "@/components/dashboard/MonthlySalesChart";
import { useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/dashboard/SideBar";

// Interfaces para los datos
interface MetricData {
  total: number;
  comparison: number; 
}

interface ProductRanking {
  id: string;
  name: string;
  sales: number;
  image?: string;
}

const Dashboard = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  

  const [metrics, setMetrics] = useState({
    revenue: { total: 0, comparison: 0 },
    orders: { total: 0, comparison: 0 },
    customers: { total: 0, comparison: 0 },
    avgOrder: { total: 0, comparison: 0 }
  });
  
  const [topProducts, setTopProducts] = useState<ProductRanking[]>([]);
  const [bottomProducts, setBottomProducts] = useState<ProductRanking[]>([]);

 
  useEffect(() => {
    const generatePeriods = () => {
      const periods = [];
      const now = new Date();
      
      if (timeRange === "day") {
    
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          periods.push(date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
        }
      } else if (timeRange === "week") {
       
        for (let i = 0; i < 8; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - i * 7);
          const start = new Date(date);
          start.setDate(date.getDate() - date.getDay()); 
          const end = new Date(start);
          end.setDate(start.getDate() + 6); 
          
          periods.push(`Semana ${i+1}: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
        }
      } else if (timeRange === "month") {
      
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          periods.push(date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
        }
      } else {
     
        for (let i = 0; i < 5; i++) {
          periods.push((now.getFullYear() - i).toString());
        }
      }
      
      setAvailablePeriods(periods);
      setSelectedPeriod(periods[0]);
    };
    
    generatePeriods();
  }, [timeRange]);

  
  useEffect(() => {
    if (!selectedPeriod) return;
    
    const loadData = () => {
    
      let revenue, orders, customers;
      
      if (timeRange === "day") {
     
        revenue = Math.floor(Math.random() * 5000) + 2000;
        orders = Math.floor(Math.random() * 50) + 20;
        customers = Math.floor(Math.random() * 40) + 15;
      } else if (timeRange === "week") {
     
        revenue = Math.floor(Math.random() * 30000) + 15000;
        orders = Math.floor(Math.random() * 300) + 100;
        customers = Math.floor(Math.random() * 200) + 80;
      } else if (timeRange === "month") {
  
        revenue = Math.floor(Math.random() * 100000) + 50000;
        orders = Math.floor(Math.random() * 1000) + 200;
        customers = Math.floor(Math.random() * 500) + 100;
      } else {
      
        revenue = Math.floor(Math.random() * 1200000) + 600000;
        orders = Math.floor(Math.random() * 12000) + 3000;
        customers = Math.floor(Math.random() * 6000) + 1500;
      }
      
      const avgOrder = revenue / orders;
      
      setMetrics({
        revenue: { 
          total: revenue, 
          comparison: Math.floor(Math.random() * 40) - 10 
        },
        orders: { 
          total: orders, 
          comparison: Math.floor(Math.random() * 40) - 10
        },
        customers: { 
          total: customers, 
          comparison: Math.floor(Math.random() * 40) - 10
        },
        avgOrder: { 
          total: avgOrder, 
          comparison: Math.floor(Math.random() * 20) - 5
        }
      });
      
      
      setTopProducts([
        { id: "1", name: "Producto A", sales: timeRange === "day" ? 12 : timeRange === "week" ? 85 : timeRange === "month" ? 245 : 1200, image: "/placeholder-product.jpg" },
        { id: "2", name: "Producto B", sales: timeRange === "day" ? 10 : timeRange === "week" ? 68 : timeRange === "month" ? 198 : 980, image: "/placeholder-product.jpg" },
        { id: "3", name: "Producto C", sales: timeRange === "day" ? 8 : timeRange === "week" ? 52 : timeRange === "month" ? 156 : 780, image: "/placeholder-product.jpg" },
        { id: "4", name: "Producto D", sales: timeRange === "day" ? 6 : timeRange === "week" ? 45 : timeRange === "month" ? 132 : 660, image: "/placeholder-product.jpg" },
        { id: "5", name: "Producto E", sales: timeRange === "day" ? 5 : timeRange === "week" ? 38 : timeRange === "month" ? 118 : 590, image: "/placeholder-product.jpg" }
      ]);
      
    
      setBottomProducts([
        { id: "6", name: "Producto F", sales: timeRange === "day" ? 1 : timeRange === "week" ? 4 : timeRange === "month" ? 12 : 60, image: "/placeholder-product.jpg" },
        { id: "7", name: "Producto G", sales: timeRange === "day" ? 1 : timeRange === "week" ? 3 : timeRange === "month" ? 9 : 45, image: "/placeholder-product.jpg" },
        { id: "8", name: "Producto H", sales: timeRange === "day" ? 0 : timeRange === "week" ? 2 : timeRange === "month" ? 7 : 35, image: "/placeholder-product.jpg" },
        { id: "9", name: "Producto I", sales: timeRange === "day" ? 0 : timeRange === "week" ? 1 : timeRange === "month" ? 5 : 25, image: "/placeholder-product.jpg" },
        { id: "10", name: "Producto J", sales: timeRange === "day" ? 0 : timeRange === "week" ? 1 : timeRange === "month" ? 3 : 15, image: "/placeholder-product.jpg" }
      ]);
    };
    
    loadData();
  }, [selectedPeriod, timeRange]);

  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };


  const getTimeRangeText = () => {
    switch (timeRange) {
      case "day": return "diarias";
      case "week": return "semanales";
      case "month": return "mensuales";
      case "year": return "anuales";
      default: return "";
    }
  };

  return (
    <div className="flex min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-gray_xxl to-green_xxl/30">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray_xxl to-gray_l/20 overflow-y-auto">
      
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex gap-2 flex-wrap">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === "day" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                onClick={() => setTimeRange("day")}
              >
                Hoy
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === "week" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                onClick={() => setTimeRange("week")}
              >
                Semanal
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === "month" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                onClick={() => setTimeRange("month")}
              >
                Mensual
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === "year" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                onClick={() => setTimeRange("year")}
              >
                Anual
              </button>
            </div>
            
            <select 
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {availablePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
         
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.total)}</div>
                <div className={`flex items-center text-sm ${metrics.revenue.comparison >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.revenue.comparison >= 0 ? '↑' : '↓'} {Math.abs(metrics.revenue.comparison)}% vs período anterior
                </div>
              </CardContent>
            </Card>
            
     
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.orders.total}</div>
                <div className={`flex items-center text-sm ${metrics.orders.comparison >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.orders.comparison >= 0 ? '↑' : '↓'} {Math.abs(metrics.orders.comparison)}% vs período anterior
                </div>
              </CardContent>
            </Card>
            
       
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.customers.total}</div>
                <div className={`flex items-center text-sm ${metrics.customers.comparison >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.customers.comparison >= 0 ? '↑' : '↓'} {Math.abs(metrics.customers.comparison)}% vs período anterior
                </div>
              </CardContent>
            </Card>
            
           
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Ticket Medio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.avgOrder.total)}</div>
                <div className={`flex items-center text-sm ${metrics.avgOrder.comparison >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.avgOrder.comparison >= 0 ? '↑' : '↓'} {Math.abs(metrics.avgOrder.comparison)}% vs período anterior
                </div>
              </CardContent>
            </Card>
          </div>
          
       
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
           
            <div className="space-y-6 lg:space-y-8">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col h-full">
                <CardHeader className="pb-2 md:pb-3 lg:pb-4">
                  <CardTitle className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Compras {getTimeRangeText()} {selectedPeriod}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-2 md:p-4 lg:p-6 overflow-auto">
                  <MonthlyPurchasesChart timeRange={timeRange} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col h-full">
                <CardHeader className="pb-2 md:pb-3 lg:pb-4">
                  <CardTitle className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green_b rounded-full"></div>
                    Ventas {getTimeRangeText()} {selectedPeriod}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-2 md:p-4 lg:p-6 overflow-auto">
                  <MonthlySalesChart timeRange={timeRange} />
                </CardContent>
              </Card>
            </div>
            
         
            <div className="space-y-6 lg:space-y-8">
           
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
                    Productos Más Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <span className="text-xs text-gray-500">Sin imagen</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales} unidades</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(product.sales * 49.99)} 
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
           
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
                    Productos Menos Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bottomProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">{topProducts.length + index + 1}</span>
                          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <span className="text-xs text-gray-500">Sin imagen</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales} unidades</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(product.sales * 49.99)} 
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;