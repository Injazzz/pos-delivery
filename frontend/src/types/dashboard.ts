export interface DashboardSummary {
  revenue: { today: number; this_month: number; growth: number };
  orders: {
    today: number;
    this_month: number;
    growth: number;
    by_status: Record<string, number>;
  };
  users: { total: number; customers: number; couriers: number };
  menus: { total: number; available: number };
}

export interface RevenueChartPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopMenu {
  id: number;
  name: string;
  category: string;
  total_qty: number;
  total_revenue: number;
  order_count: number;
}

export interface RecentOrder {
  id: number;
  order_code: string;
  customer: string;
  order_type: string;
  status: string;
  status_label: string;
  total: string;
  payment: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  description: string;
  causer: string;
  causer_role: string | null;
  created_at: string;
  created_at_full: string;
}
