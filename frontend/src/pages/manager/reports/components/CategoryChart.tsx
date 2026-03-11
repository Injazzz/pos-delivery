/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryData } from "@/types/report";

// Warna-warna dari palet yang sudah didefinisikan
const COLORS = [
  "var(--heart-500)", // Merah maroon
  "var(--earth-500)", // Coklat/earth
  "var(--glow-500)", // Kuning/glow
  "var(--emerald-500)", // Hijau emerald
  "var(--heart-400)", // Merah lebih muda
  "var(--earth-400)", // Coklat lebih muda
  "var(--glow-400)", // Kuning lebih muda
];

interface Props {
  data?: CategoryData[];
  isLoading: boolean;
}

export function CategoryChart({ data, isLoading }: Props) {
  // Hitung total untuk persentase
  const total = data?.reduce((sum, item) => sum + item.total_revenue, 0) || 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const percentage = ((data.total_revenue / total) * 100).toFixed(1);

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-foreground font-medium mb-1">{data.category}</p>
        <p className="text-heart-500 font-semibold">
          {formatCurrency(data.total_revenue)}
        </p>
        <p className="text-muted-foreground text-[10px] mt-1">
          {percentage}% dari total
        </p>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold">
            Penjualan per Kategori
          </CardTitle>
          {data && data.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {data.length} kategori
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
                <Skeleton key={i} className="h-6 w-full bg-muted" />
              ))}
            </div>
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Tidak ada data
            </p>
            <p className="text-xs text-muted-foreground">
              Belum ada penjualan dalam periode ini
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Pie Chart */}
            <div className="relative">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="total_revenue"
                    nameKey="category"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="transparent"
                        className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">
                  {data.length}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Kategori
                </span>
              </div>
            </div>

            {/* Legend dengan progress bar */}
            <div className="flex-1 w-full space-y-3">
              {data.map((item, i) => {
                const percentage = ((item.total_revenue / total) * 100).toFixed(
                  1,
                );
                const color = COLORS[i % COLORS.length];

                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-foreground truncate">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[10px]">
                          {percentage}%
                        </span>
                        <span className="text-xs font-medium" style={{ color }}>
                          {formatCurrency(item.total_revenue)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
