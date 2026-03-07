/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/lib/axios";
import type {
  ReportFilters,
  ReportSummary,
  RevenueChartPoint,
  TopMenu,
  CategoryData,
  PaymentMethodData,
} from "@/types/report";

function toParams(filters: ReportFilters) {
  return {
    period: filters.period,
    from: filters.from,
    to: filters.to,
    group_by: filters.group_by,
  };
}

export const reportsApi = {
  getSummary: (filters: ReportFilters) =>
    apiClient.get<{ data: ReportSummary }>("/manager/reports/summary", {
      params: toParams(filters),
    }),

  getRevenueChart: (filters: ReportFilters) =>
    apiClient.get<{ data: RevenueChartPoint[] }>(
      "/manager/reports/revenue-chart",
      {
        params: toParams(filters),
      },
    ),

  getTopMenus: (filters: ReportFilters, limit = 10) =>
    apiClient.get<{ data: TopMenu[] }>("/manager/reports/top-menus", {
      params: { ...toParams(filters), limit },
    }),

  getCategories: (filters: ReportFilters) =>
    apiClient.get<{ data: CategoryData[] }>("/manager/reports/categories", {
      params: toParams(filters),
    }),

  getPaymentMethods: (filters: ReportFilters) =>
    apiClient.get<{ data: PaymentMethodData[] }>(
      "/manager/reports/payment-methods",
      {
        params: toParams(filters),
      },
    ),

  getOrders: (filters: ReportFilters, extra?: Record<string, any>) =>
    apiClient.get("/manager/reports/orders", {
      params: { ...toParams(filters), ...extra },
    }),

  exportExcel: (filters: ReportFilters) =>
    apiClient.get("/manager/reports/export/excel", {
      params: toParams(filters),
      responseType: "blob",
    }),

  exportPdfData: (filters: ReportFilters) =>
    apiClient.get("/manager/reports/export/pdf-data", {
      params: toParams(filters),
    }),
};

export const activityLogsApi = {
  getLogs: (params?: Record<string, any>) =>
    apiClient.get("/manager/activity-logs", { params }),

  getSummary: () => apiClient.get("/manager/activity-logs/summary"),
};
