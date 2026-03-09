/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueChartPoint } from "@/types/report";

function fmtRevenue(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
}

interface Props {
  data?: RevenueChartPoint[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: Props) {
  const chartData = data ?? [];

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-300">
          Grafik Pendapatan & Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 bg-slate-800 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tickFormatter={fmtRevenue}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
                formatter={(value: any, name?: string) => {
                  // Jika name undefined, gunakan default
                  const safeName = name ?? "";

                  if (safeName === "revenue") {
                    return [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "Pendapatan",
                    ];
                  }

                  if (safeName === "orders") {
                    return [String(value), "Order"];
                  }

                  // Fallback untuk name lain
                  return [String(value), safeName];
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Legend
                formatter={(value?: string) => {
                  if (value === "revenue") return "Pendapatan";
                  if (value === "orders") return "Order";
                  return value ?? "";
                }}
                wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                dot={false}
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorOrders)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
