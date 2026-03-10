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
import type { RevenueChartPoint } from "@/types/dashboard";
import { useEffect, useState } from "react";

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

  // Get CSS variable values
  const earthColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--earth-600")
      .trim() || "#b8893a";
  const heartColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--heart-500")
      .trim() || "#f83f2d";

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-2 font-medium">{label}</p>
      <p className="font-semibold" style={{ color: earthColor }}>
        Rp {payload[0]?.value?.toLocaleString("id-ID")}
      </p>
      <p className="mt-1" style={{ color: heartColor }}>
        {payload[1]?.value} order
      </p>
    </div>
  );
}

export function RevenueChart({ data, isLoading }: Props) {
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState({
    revenue: "#b8893a",
    orders: "#f83f2d",
    revenueGradientStart: "#d7a74f",
    ordersGradientStart: "#ff6b5c",
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
        // Revenue menggunakan earth
        revenue:
          computed.getPropertyValue("--earth-600").trim() ||
          (isDark ? "#b8893a" : "#9a6b2c"),
        // Orders menggunakan heart
        orders:
          computed.getPropertyValue("--heart-500").trim() ||
          (isDark ? "#f83f2d" : "#d92b1a"),
        // Revenue gradient menggunakan earth yang lebih terang
        revenueGradientStart:
          computed.getPropertyValue("--earth-400").trim() ||
          (isDark ? "#d7a74f" : "#b8893a"),
        // Orders gradient menggunakan heart yang lebih terang
        ordersGradientStart:
          computed.getPropertyValue("--heart-400").trim() ||
          (isDark ? "#ff6b5c" : "#f83f2d"),
        // Axis text color - menyesuaikan dengan mode
        axisText: isDark ? "#9ca3af" : "#4b5563", // gray-400 untuk dark, gray-600 untuk light
        // Grid color - lebih subtle di dark mode
        gridColor: isDark ? "#374151" : "#e5e7eb", // gray-700 untuk dark, gray-200 untuk light
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
            Pendapatan & Order — 7 Hari Terakhir
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
          Pendapatan & Order — 7 Hari Terakhir
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
                {/* Revenue Gradient - Menggunakan Earth */}
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

                {/* Orders Gradient - Menggunakan Heart */}
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
                tick={{
                  fill: colors.axisText,
                  fontSize: 10,
                  fontWeight: 500,
                }}
                axisLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickLine={{ stroke: colors.gridColor, strokeWidth: 1 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
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

              {/* Revenue Area - Menggunakan Earth */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={colors.revenue}
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                name="Revenue"
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

              {/* Orders Area - Menggunakan Heart */}
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
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
