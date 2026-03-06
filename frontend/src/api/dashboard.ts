import apiClient from "@/lib/axios";
import type {
  ActivityLog,
  DashboardSummary,
  RecentOrder,
  RevenueChartPoint,
  TopMenu,
} from "@/types/dashboard";

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<{ data: DashboardSummary }>("/manager/dashboard/summary"),
  getRevenueChart: (days = 7) =>
    apiClient.get<{ data: RevenueChartPoint[] }>(
      "/manager/dashboard/revenue-chart",
      { params: { days } },
    ),
  getTopMenus: () =>
    apiClient.get<{ data: TopMenu[] }>("/manager/dashboard/top-menus"),
  getRecentOrders: () =>
    apiClient.get<{ data: RecentOrder[] }>("/manager/dashboard/recent-orders"),
  getActivityLogs: () =>
    apiClient.get<{ data: ActivityLog[] }>("/manager/dashboard/activity-logs"),
};
