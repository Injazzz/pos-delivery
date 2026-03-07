import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { ReportFilters } from "./components/ReportFilters";
import { SummaryCards } from "./components/SummaryCards";
import { RevenueChart } from "./components/RevenueChart";
import { CategoryChart } from "./components/CategoryChart";
import { PaymentMethodChart } from "./components/PaymentMethodChart";
import { TopMenusTable } from "./components/TopMenusTable";
import { OrdersTable } from "./components/OrdersTable";
import { ExportButtons } from "./components/ExportButtons";
import type { ReportFilters as TFilters } from "@/types/report";
import { useReportData } from "@/hooks/useReportData";

export default function ManagerReportsPage() {
  const [filters, setFilters] = useState<TFilters>({
    period: "month",
    group_by: "day",
  });

  const {
    summary,
    revenueChart,
    topMenus,
    categories,
    paymentMethods,
    isLoading,
  } = useReportData(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-amber-400" />
            Laporan Penjualan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analisis pendapatan, order, dan menu terlaris
          </p>
        </div>
        <ExportButtons filters={filters} />
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onChange={setFilters}
        isLoading={isLoading}
      />

      {/* Summary cards */}
      <SummaryCards data={summary.data} isLoading={summary.isLoading} />

      {/* Charts row 1 */}
      <RevenueChart
        data={revenueChart.data}
        isLoading={revenueChart.isLoading}
      />

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart
          data={categories.data}
          isLoading={categories.isLoading}
        />
        <PaymentMethodChart
          data={paymentMethods.data}
          isLoading={paymentMethods.isLoading}
        />
      </div>

      {/* Top menus */}
      <TopMenusTable data={topMenus.data} isLoading={topMenus.isLoading} />

      {/* Orders table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3">
          Daftar Order
        </h2>
        <OrdersTable filters={filters} />
      </div>
    </div>
  );
}
