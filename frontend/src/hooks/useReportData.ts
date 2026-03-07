import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports";
import type { ReportFilters } from "@/types/report";

export function useReportData(filters: ReportFilters) {
  const params = { ...filters };

  const summary = useQuery({
    queryKey: ["report-summary", params],
    queryFn: () => reportsApi.getSummary(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

  const revenueChart = useQuery({
    queryKey: ["report-revenue", params],
    queryFn: () => reportsApi.getRevenueChart(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

  const topMenus = useQuery({
    queryKey: ["report-top-menus", params],
    queryFn: () => reportsApi.getTopMenus(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

  const categories = useQuery({
    queryKey: ["report-categories", params],
    queryFn: () => reportsApi.getCategories(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

  const paymentMethods = useQuery({
    queryKey: ["report-payments", params],
    queryFn: () =>
      reportsApi.getPaymentMethods(params).then((r) => r.data.data),
    staleTime: 30_000,
  });

  const isLoading =
    summary.isLoading ||
    revenueChart.isLoading ||
    topMenus.isLoading ||
    categories.isLoading ||
    paymentMethods.isLoading;

  return {
    summary,
    revenueChart,
    topMenus,
    categories,
    paymentMethods,
    isLoading,
  };
}
