import type { Menu } from "./menu";

export type OrderStatus =
  | "pending"
  | "processing"
  | "cooking"
  | "ready"
  | "on_delivery"
  | "delivered"
  | "cancelled";

export type OrderType = "dine_in" | "take_away" | "delivery";

export interface OrderItem {
  id: number;
  menu_id: number;
  menu?: Pick<Menu, "id" | "name" | "category" | "first_image_url">;
  qty: number;
  price: number;
  subtotal: number;
  formatted_price: string;
  formatted_subtotal: string;
  note: string | null;
}

export interface Order {
  id: number;
  order_code: string;
  order_type: OrderType;
  order_type_label: string;
  status: OrderStatus;
  status_label: string;
  notes: string | null;
  table_number: string | null;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total_price: number;
  formatted_total: string;
  customer?: { id: number; name: string; phone: string | null };
  cashier?: { id: number; name: string };
  items?: OrderItem[];
  payment?: {
    id: number;
    method: string;
    status: string;
    amount: number;
    amount_paid: number;
    paid_at: string | null;
  };
  delivery?: {
    id: number;
    address: string;
    delivery_status: string;
    courier: { id: number; name: string; phone: string | null } | null;
    delivered_at: string | null;
  };
  status_logs?: Array<{
    from: string | null;
    to: string;
    reason: string | null;
    updated_by: string;
    updated_at: string;
  }>;
  review?: { rating: number; comment: string | null } | null;
  estimated_ready_at: string | null;
  created_at: string;
}

export interface StoreOrderPayload {
  order_type: OrderType;
  notes?: string;
  table_number?: string;
  customer_id?: number;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  items: Array<{ menu_id: number; qty: number; note?: string }>;
}

export interface OrderFilters {
  status?: string;
  order_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export interface OrderStats {
  today_orders: number;
  today_revenue: number;
  pending: number;
  processing: number;
  ready: number;
}
