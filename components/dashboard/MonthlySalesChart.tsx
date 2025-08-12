"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
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

const MonthlySalesChart = () => {
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
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(value) => `VES ${(value / 1000).toFixed(0)}K`}
            domain={[0, 500000]}
            ticks={[
              0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000,
              450000,
            ]}
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
