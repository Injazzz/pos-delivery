import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

import { useDashboardData } from "./hooks/useDashboardData";
import { StatsGrid } from "./components/StatsGrid";
import { RevenueChart } from "./components/RevenueChart";
import { OrderStatusChart } from "./components/OrderStatusChart";
import { TopMenusCard } from "./components/TopMenusCard";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { ActivityFeed } from "./components/ActivityFeed";

export default function ManagerDashboard() {
  const qc = useQueryClient();
  const { summary, revenueChart, topMenus, recentOrders, activityLogs } =
    useDashboardData();

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    qc.invalidateQueries({ queryKey: ["dashboard-revenue"] });
    qc.invalidateQueries({ queryKey: ["dashboard-top-menus"] });
    qc.invalidateQueries({ queryKey: ["dashboard-recent-orders"] });
    qc.invalidateQueries({ queryKey: ["dashboard-activity"] });
  };

  const now = new Date().toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{now}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <StatsGrid data={summary.data} isLoading={summary.isLoading} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <RevenueChart
          data={revenueChart.data}
          isLoading={revenueChart.isLoading}
        />
        <OrderStatusChart
          data={summary.data?.orders.by_status}
          isLoading={summary.isLoading}
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentOrdersTable
          data={recentOrders.data}
          isLoading={recentOrders.isLoading}
        />
        <TopMenusCard data={topMenus.data} isLoading={topMenus.isLoading} />
        <ActivityFeed
          data={activityLogs.data}
          isLoading={activityLogs.isLoading}
        />
      </div>
    </div>
  );
}
