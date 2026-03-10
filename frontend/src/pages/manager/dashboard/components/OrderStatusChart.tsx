/* eslint-disable @typescript-eslint/no-explicit-any */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Props {
  data?: DashboardSummary["orders"]["by_status"];
  isLoading: boolean;
}

// Status colors menggunakan CSS variables
const STATUS_COLORS: Record<string, string> = {
  pending: "var(--glow-500)", // Kuning/emas
  processing: "var(--heart-400)", // Merah muda
  cooking: "var(--earth-500)", // Coklat/oranye
  ready: "var(--heart-600)", // Merah maroon
  on_delivery: "var(--earth-400)", // Coklat muda
  delivered: "var(--success-500)", // Hijau
  cancelled: "var(--error-500)", // Merah
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

// Background colors untuk legend
const STATUS_BG_COLORS: Record<string, string> = {
  pending: "bg-glow-500/20",
  processing: "bg-heart-400/20",
  cooking: "bg-earth-500/20",
  ready: "bg-heart-600/20",
  on_delivery: "bg-earth-400/20",
  delivered: "bg-success-500/20",
  cancelled: "bg-error-500/20",
};

export function OrderStatusChart({ data, isLoading }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data
    ? Object.entries(data)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: STATUS_LABELS[key] ?? key,
          value,
          color: STATUS_COLORS[key] ?? "var(--muted-foreground)",
          bgColor: STATUS_BG_COLORS[key] ?? "bg-muted",
          statusKey: key,
        }))
    : [];

  const total = chartData.reduce((s, d) => s + d.value, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length || !mounted) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-muted-foreground mb-2 font-medium">{data.name}</p>
        <p className="font-semibold" style={{ color: data.color }}>
          {data.value} order ({((data.value / total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  };

  if (!mounted) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm font-semibold">
            Status Order Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-52 w-full bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-heart-500 animate-pulse" />
            Status Order Aktif
          </CardTitle>
          {total > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Total: {total} order
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-40 mx-auto rounded-full bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full bg-muted" />
              ))}
            </div>
          </div>
        ) : total === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium mb-1">Belum ada data</p>
            <p className="text-xs text-muted-foreground">
              Status order akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Pie Chart */}
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        stroke="transparent"
                        className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">
                  {total}
                </span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Legend dengan persentase */}
            <div className="flex-1 w-full space-y-2.5">
              {chartData.map((d) => {
                const percentage = ((d.value / total) * 100).toFixed(1);

                return (
                  <div
                    key={d.name}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          d.bgColor,
                        )}
                        style={{
                          backgroundColor: d.color,
                          boxShadow: `0 0 10px ${d.color}40`,
                        }}
                      />
                      <span className="text-xs text-foreground truncate">
                        {d.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {percentage}%
                      </span>
                      <span
                        className="text-xs font-semibold min-w-7.5 text-right"
                        style={{ color: d.color }}
                      >
                        {d.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Progress bar untuk total */}
      {total > 0 && !isLoading && (
        <div className="h-1 w-full bg-muted overflow-hidden">
          {chartData.map((d, i) => (
            <div
              key={i}
              className="h-full float-left transition-all duration-500"
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
