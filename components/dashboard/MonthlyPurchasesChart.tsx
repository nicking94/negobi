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

const MonthlyPurchasesChart = () => {
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
            domain={[0, 400000]}
            ticks={[0, 50000, 100000, 150000, 200000, 250000, 300000]}
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
