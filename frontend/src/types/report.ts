/* eslint-disable @typescript-eslint/no-explicit-any */

export type ReportPeriod = "today" | "week" | "month" | "year" | "custom";

export interface ReportFilters {
  period: ReportPeriod;
  from?: string;
  to?: string;
  group_by?: "day" | "week" | "month";
}

export interface ReportSummary {
  period: { from: string; to: string };
  revenue: number;
  revenue_pending: number;
  revenue_growth: number | null;
  orders_count: number;
  orders_paid: number;
  orders_partial: number;
  avg_order_value: number;
  orders_by_status: Record<string, number>;
  orders_by_type: Record<string, number>;
}

export interface RevenueChartPoint {
  period: string;
  label: string;
  revenue: number;
  pending_revenue?: number;
  orders: number;
}

export interface TopMenu {
  menu_id: number;
  name: string;
  category: string;
  price: number;
  total_qty: number;
  total_revenue: number;
  order_count: number;
}

export interface CategoryData {
  category: string;
  total_qty: number;
  total_revenue: number;
  percentage: number;
}

export interface PaymentMethodData {
  method: string;
  label: string;
  count: number;
  total: number;
}

export interface ActivityLog {
  id: number;
  description: string;
  log_name: string | null;
  event: string | null;
  causer: { id: number; name: string; role: string } | null;
  subject_type: string | null;
  subject_id: number | null;
  properties: Record<string, any>;
  created_at: string;
}
