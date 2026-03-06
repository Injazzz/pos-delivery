import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";

export function useDashboardData() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const revenueChart = useQuery({
    queryKey: ["dashboard-revenue", 7],
    queryFn: () => dashboardApi.getRevenueChart(7).then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  const topMenus = useQuery({
    queryKey: ["dashboard-top-menus"],
    queryFn: () => dashboardApi.getTopMenus().then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  const recentOrders = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => dashboardApi.getRecentOrders().then((r) => r.data.data),
    refetchInterval: 15_000,
  });

  const activityLogs = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => dashboardApi.getActivityLogs().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  return { summary, revenueChart, topMenus, recentOrders, activityLogs };
}
