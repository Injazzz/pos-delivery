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
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
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
      case "revenue":
        return "var(--emerald-500)";
      case "pending_revenue":
        return "var(--glow-500)";
      case "orders":
        return "var(--heart-500)";
      default:
        return "var(--foreground)";
    }
  };

  const getLabel = (dataKey: string) => {
    switch (dataKey) {
      case "revenue":
        return "Pendapatan Lunas";
      case "pending_revenue":
        return "Pendapatan Tertunda";
      case "orders":
        return "Order";
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
    revenue: "#10b981", // emerald-500
    pending: "#f59e0b", // glow-500
    orders: "#f43f5e", // heart-500
    revenueGradientStart: "#10b981",
    pendingGradientStart: "#f59e0b",
    ordersGradientStart: "#f43f5e",
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
        // Pendapatan Lunas menggunakan emerald
        revenue:
          computed.getPropertyValue("--emerald-500").trim() ||
          (isDark ? "#10b981" : "#059669"),
        // Pendapatan Tertunda menggunakan glow
        pending:
          computed.getPropertyValue("--glow-500").trim() ||
          (isDark ? "#f59e0b" : "#d97706"),
        // Orders menggunakan heart
        orders:
          computed.getPropertyValue("--heart-500").trim() ||
          (isDark ? "#f43f5e" : "#e11d48"),
        // Gradient starts
        revenueGradientStart:
          computed.getPropertyValue("--emerald-400").trim() ||
          (isDark ? "#34d399" : "#10b981"),
        pendingGradientStart:
          computed.getPropertyValue("--glow-400").trim() ||
          (isDark ? "#fbbf24" : "#f59e0b"),
        ordersGradientStart:
          computed.getPropertyValue("--heart-400").trim() ||
          (isDark ? "#fb7185" : "#f43f5e"),
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
                {/* Revenue Gradient - Pendapatan Lunas (Emerald) */}
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

                {/* Pending Revenue Gradient - Pendapatan Tertunda (Glow) */}
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.pendingGradientStart}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.pendingGradientStart}
                    stopOpacity={0}
                  />
                </linearGradient>

                {/* Orders Gradient - Order (Heart) */}
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.ordersGradientStart}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.ordersGradientStart}
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

              {/* Pendapatan Lunas Area - Emerald */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={colors.revenue}
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                name="Pendapatan Lunas"
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

              {/* Pendapatan Tertunda Area - Glow */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="pending_revenue"
                stroke={colors.pending}
                strokeWidth={2.5}
                fill="url(#pendingGrad)"
                name="Pendapatan Tertunda"
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

              {/* Orders Area - Heart */}
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke={colors.orders}
                strokeWidth={2.5}
                fill="url(#ordersGrad)"
                name="Order"
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
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
