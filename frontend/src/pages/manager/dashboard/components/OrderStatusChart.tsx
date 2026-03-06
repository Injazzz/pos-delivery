// src/pages/manager/dashboard/components/OrderStatusChart.tsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@/types/dashboard";

interface Props {
  data?: DashboardSummary["orders"]["by_status"];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  processing: "#3b82f6",
  cooking: "#f97316",
  ready: "#10b981",
  on_delivery: "#8b5cf6",
  delivered: "#14b8a6",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  cooking: "Dimasak",
  ready: "Siap",
  on_delivery: "Dikirim",
  delivered: "Diterima",
  cancelled: "Batal",
};

export function OrderStatusChart({ data, isLoading }: Props) {
  const chartData = data
    ? Object.entries(data)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: STATUS_LABELS[key] ?? key,
          value,
          color: STATUS_COLORS[key] ?? "#64748b",
        }))
    : [];

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm font-semibold">
          Status Order Aktif
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-52 w-full bg-slate-800 rounded-lg" />
        ) : total === 0 ? (
          <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
            Belum ada data
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {chartData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
