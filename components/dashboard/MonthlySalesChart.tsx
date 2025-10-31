"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface MonthlySalesChartProps {
  timeRange: "day" | "week" | "month" | "year";
}

const dailySalesData = [
  { hour: "00:00", value: 1000 },
  { hour: "04:00", value: 1500 },
  { hour: "08:00", value: 5000 },
  { hour: "12:00", value: 12000 },
  { hour: "16:00", value: 15000 },
  { hour: "20:00", value: 8000 },
];

const weeklySalesData = [
  { day: "Lun", value: 45000 },
  { day: "Mar", value: 60000 },
  { day: "Mié", value: 75000 },
  { day: "Jue", value: 90000 },
  { day: "Vie", value: 120000 },
  { day: "Sáb", value: 95000 },
  { day: "Dom", value: 60000 },
];

const monthlySalesData = [
  { month: "Enero", value: 180000 },
  { month: "Febrero", value: 220000 },
  { month: "Marzo", value: 260000 },
  { month: "Abril", value: 310000 },
  { month: "Mayo", value: 380000 },
  { month: "Junio", value: 420000 },
  { month: "Julio", value: 450000 },
  { month: "Agosto", value: 380000 },
  { month: "Septiembre", value: 280000 },
  { month: "Octubre", value: 220000 },
  { month: "Noviembre", value: 180000 },
  { month: "Diciembre", value: 150000 },
];

const yearlySalesData = [
  { year: "2019", value: 1800000 },
  { year: "2020", value: 2500000 },
  { year: "2021", value: 3200000 },
  { year: "2022", value: 3900000 },
  { year: "2023", value: 4600000 },
];

const MonthlySalesChart = ({ timeRange }: MonthlySalesChartProps) => {
  const getData = () => {
    switch (timeRange) {
      case "day":
        return dailySalesData;
      case "week":
        return weeklySalesData;
      case "month":
        return monthlySalesData;
      case "year":
        return yearlySalesData;
      default:
        return dailySalesData;
    }
  };

  const data = getData();
  const xAxisKey =
    timeRange === "day"
      ? "hour"
      : timeRange === "week"
      ? "day"
      : timeRange === "month"
      ? "month"
      : "year";

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart;
