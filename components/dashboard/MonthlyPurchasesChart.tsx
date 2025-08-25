"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface MonthlyPurchasesChartProps {
  timeRange: "day" | "week" | "month" | "year";
}

// Datos de ejemplo para diferentes rangos de tiempo
const dailyData = [
  { hour: "00:00", value: 500 },
  { hour: "04:00", value: 800 },
  { hour: "08:00", value: 3000 },
  { hour: "12:00", value: 8000 },
  { hour: "16:00", value: 10000 },
  { hour: "20:00", value: 6000 },
];

const weeklyData = [
  { day: "Lun", value: 30000 },
  { day: "Mar", value: 45000 },
  { day: "Mié", value: 60000 },
  { day: "Jue", value: 75000 },
  { day: "Vie", value: 90000 },
  { day: "Sáb", value: 65000 },
  { day: "Dom", value: 40000 },
];

const monthlyData = [
  { month: "Enero", value: 120000 },
  { month: "Febrero", value: 150000 },
  { month: "Marzo", value: 180000 },
  { month: "Abril", value: 220000 },
  { month: "Mayo", value: 280000 },
  { month: "Junio", value: 320000 },
  { month: "Julio", value: 350000 },
  { month: "Agosto", value: 280000 },
  { month: "Septiembre", value: 180000 },
  { month: "Octubre", value: 120000 },
  { month: "Noviembre", value: 80000 },
  { month: "Diciembre", value: 60000 },
];

const yearlyData = [
  { year: "2019", value: 1200000 },
  { year: "2020", value: 1800000 },
  { year: "2021", value: 2400000 },
  { year: "2022", value: 3000000 },
  { year: "2023", value: 3600000 },
];

const MonthlyPurchasesChart = ({ timeRange }: MonthlyPurchasesChartProps) => {
  // Seleccionar datos según el rango de tiempo
  const getData = () => {
    switch (timeRange) {
      case "day":
        return dailyData;
      case "week":
        return weeklyData;
      case "month":
        return monthlyData;
      case "year":
        return yearlyData;
      default:
        return dailyData;
    }
  };

  const data = getData();
  const xAxisKey = timeRange === "day" ? "hour" : timeRange === "week" ? "day" : timeRange === "month" ? "month" : "year";

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(value) => `VES ${(value / 1000).toFixed(0)}K`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#monthlyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyPurchasesChart;