/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Wallet,
  Landmark,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethodData } from "@/types/report";

interface Props {
  data?: PaymentMethodData[];
  isLoading: boolean;
}

// Mapping icon untuk metode pembayaran
const METHOD_ICON: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  qris: Wallet,
  bank_transfer: Landmark,
  e_wallet: Wallet,
};

// Mapping warna untuk metode pembayaran
const METHOD_COLOR: Record<string, string> = {
  cash: "text-emerald-500",
  card: "text-heart-500",
  qris: "text-glow-500",
  bank_transfer: "text-earth-500",
  e_wallet: "text-purple-500",
};

const METHOD_BG: Record<string, string> = {
  cash: "bg-emerald-500/10",
  card: "bg-heart-500/10",
  qris: "bg-glow-500/10",
  bank_transfer: "bg-earth-500/10",
  e_wallet: "bg-purple-500/10",
};

// Warna untuk bar chart
const BAR_COLORS = [
  "var(--heart-500)",
  "var(--earth-500)",
  "var(--glow-500)",
  "var(--emerald-500)",
  "var(--heart-400)",
];

export function PaymentMethodChart({ data, isLoading }: Props) {
  // Hitung total untuk persentase
  const total = data?.reduce((sum, item) => sum + item.total, 0) || 0;

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
    const percentage = ((data.total / total) * 100).toFixed(1);
    const Icon = METHOD_ICON[data.method] || CreditCard;
    const color = METHOD_COLOR[data.method] || "text-muted-foreground";

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-4 h-4", color)} />
          <p className="text-foreground font-medium">{data.label}</p>
        </div>
        <p className="text-heart-500 font-semibold">
          {formatCurrency(data.total)}
        </p>
        <div className="flex items-center justify-between gap-4 mt-1">
          <p className="text-muted-foreground text-[10px]">
            {data.count} transaksi
          </p>
          <p className="text-muted-foreground text-[10px]">{percentage}%</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-heart-500" />
            Metode Pembayaran
          </CardTitle>
          {data && data.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {data.length} metode
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full bg-muted rounded-lg" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full bg-muted" />
              ))}
            </div>
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Tidak ada data
            </p>
            <p className="text-xs text-muted-foreground">
              Belum ada transaksi dengan metode pembayaran
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} barSize={32} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                  horizontal={true}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}jt`
                      : value >= 1000
                        ? `${(value / 1000).toFixed(0)}rb`
                        : value
                  }
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                {data.map((entry, index) => (
                  <Bar
                    key={entry.method}
                    dataKey="total"
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Detail per metode */}
            <div className="space-y-2 pt-2 border-t border-border">
              {data.map((item) => {
                const Icon = METHOD_ICON[item.method] || CreditCard;
                const color =
                  METHOD_COLOR[item.method] || "text-muted-foreground";
                const bg = METHOD_BG[item.method] || "bg-muted";
                const percentage = ((item.total / total) * 100).toFixed(1);

                return (
                  <div
                    key={item.method}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        bg,
                      )}
                    >
                      <Icon className={cn("w-4 h-4", color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className={cn("text-xs font-semibold", color)}>
                          {formatCurrency(item.total)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: `var(--${color.replace("text-", "").replace("-500", "")}-500)`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {percentage}%
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {item.count} tx
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total summary */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Total Transaksi
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {data.reduce((sum, item) => sum + item.count, 0)} transaksi
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
