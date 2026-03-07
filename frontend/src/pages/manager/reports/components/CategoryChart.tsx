/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryData } from "@/types/report";

const COLORS = [
  "#f59e0b",
  "#6366f1",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

interface Props {
  data?: CategoryData[];
  isLoading: boolean;
}

export function CategoryChart({ data, isLoading }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-300">
          Penjualan per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 bg-slate-800 rounded-xl" />
        ) : !data?.length ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            Tidak ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="total_revenue"
                nameKey="category"
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
                formatter={(value: any, name?: string) => {
                  const formattedValue = `Rp ${Number(value).toLocaleString("id-ID")}`;
                  const displayName = name ?? "Revenue";
                  return [formattedValue, displayName];
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Legend
                formatter={(value?: string) => {
                  return value ?? "";
                }}
                wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Tabel ringkas */}
        {!isLoading && !!data?.length && (
          <div className="mt-3 space-y-1.5">
            {data.map((c, i) => (
              <div key={c.category} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-slate-400 flex-1 truncate">
                  {c.category}
                </span>
                <span className="text-xs text-white font-medium">
                  {c.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
