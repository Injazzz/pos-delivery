/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueChartPoint } from "@/types/report";
import { useEffect, useState } from "react";

function fmtRevenue(v: number) {
  return `Rp ${(v / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}k`;
}

interface Props {
  data?: RevenueChartPoint[];
  isLoading: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!active || !payload?.length || !mounted) return null;

  // Warna untuk setiap tipe
  const getColor = (dataKey: string) => {
    switch (dataKey) {
      case "orders":
        return "var(--heart-500)";
      case "revenue":
        return "var(--success-500)"; // success-500 untuk lunas
      case "pending_revenue":
        return "var(--warning-500)"; // warning-500 untuk belum lunas
      default:
        return "var(--foreground)";
    }
  };

  const getLabel = (dataKey: string) => {
    switch (dataKey) {
      case "orders":
        return "Orders";
      case "revenue":
        return "Pembayaran Lunas";
      case "pending_revenue":
        return "Pembayaran Belum Lunas";
      default:
        return dataKey;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-foreground font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => {
        const color = getColor(entry.dataKey);
        const label = getLabel(entry.dataKey);
        const value =
          entry.dataKey === "orders"
            ? `${entry.value} order`
            : `Rp ${entry.value.toLocaleString("id-ID")}`;

        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mt-1"
          >
            <span style={{ color }}>{label}</span>
            <span className="font-semibold" style={{ color }}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RevenueChart({ data, isLoading }: Props) {
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState({
    orders: "#f43f5e", // heart-500
    revenue: "#22c55e", // success-500 (hijau)
    pending: "#f59e0b", // warning-500 (kuning/oranye)
    ordersGradientStart: "#f43f5e",
    revenueGradientStart: "#22c55e",
    pendingGradientStart: "#f59e0b",
    axisText: "#6b7280", // gray-500
    gridColor: "#e5e7eb", // gray-200
  });

  useEffect(() => {
    setMounted(true);

    // Update colors based on current theme
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const computed = getComputedStyle(document.documentElement);

      setColors({
        // Orders menggunakan heart-500
        orders:
          computed.getPropertyValue("--heart-500").trim() ||
          (isDark ? "#f43f5e" : "#e11d48"),
        // Pendapatan Lunas menggunakan success-500 (hijau)
        revenue:
          computed.getPropertyValue("--success-500").trim() ||
          (isDark ? "#22c55e" : "#16a34a"),
        // Pendapatan Belum Lunas menggunakan warning-500 (kuning/oranye)
        pending:
          computed.getPropertyValue("--warning-500").trim() ||
          (isDark ? "#f59e0b" : "#d97706"),
        // Gradient starts
        ordersGradientStart:
          computed.getPropertyValue("--heart-400").trim() ||
          (isDark ? "#fb7185" : "#f43f5e"),
        revenueGradientStart:
          computed.getPropertyValue("--success-400").trim() ||
          (isDark ? "#4ade80" : "#22c55e"),
        pendingGradientStart:
          computed.getPropertyValue("--warning-400").trim() ||
          (isDark ? "#fbbf24" : "#f59e0b"),
        // Axis text color
        axisText: isDark ? "#9ca3af" : "#4b5563",
        // Grid color
        gridColor: isDark ? "#374151" : "#e5e7eb",
      });
    };

    updateColors();

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm font-semibold">
            Grafik Pendapatan & Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-52 w-full bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-sm font-semibold">
          Grafik Pendapatan & Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-52 w-full bg-muted rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                {/* Orders Gradient - Heart */}
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.ordersGradientStart}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.ordersGradientStart}
                    stopOpacity={0}
                  />
                </linearGradient>

                {/* Revenue Gradient - Lunas (Success/Hijau) */}
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.revenueGradientStart}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.revenueGradientStart}
                    stopOpacity={0}
                  />
                </linearGradient>

                {/* Pending Revenue Gradient - Belum Lunas (Warning/Kuning) */}
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.pendingGradientStart}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.pendingGradientStart}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.gridColor}
                vertical={false}
                horizontal={true}
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: colors.axisText,
                  fontSize: 11,
                  fontWeight: 500,
                }}
                axisLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickMargin={8}
              />

              <YAxis
                yAxisId="revenue"
                tickFormatter={fmtRevenue}
                tick={{
                  fill: colors.axisText,
                  fontSize: 10,
                  fontWeight: 500,
                }}
                axisLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickMargin={4}
                width={45}
              />

              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{
                  fill: colors.axisText,
                  fontSize: 10,
                  fontWeight: 500,
                }}
                axisLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickMargin={4}
                width={35}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Orders Area - Heart (Merah) */}
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke={colors.orders}
                strokeWidth={2.5}
                fill="url(#ordersGrad)"
                name="Orders"
                isAnimationActive={true}
                animationDuration={500}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: colors.orders,
                  strokeWidth: 2,
                  fill: "white",
                }}
              />

              {/* Pendapatan Lunas Area - Success (Hijau) */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={colors.revenue}
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                name="Pembayaran Lunas"
                isAnimationActive={true}
                animationDuration={500}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: colors.revenue,
                  strokeWidth: 2,
                  fill: "white",
                }}
              />

              {/* Pendapatan Belum Lunas Area - Warning (Kuning/Oranye) */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="pending_revenue"
                stroke={colors.pending}
                strokeWidth={2.5}
                fill="url(#pendingGrad)"
                name="Pembayaran Belum Lunas"
                isAnimationActive={true}
                animationDuration={500}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: colors.pending,
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
