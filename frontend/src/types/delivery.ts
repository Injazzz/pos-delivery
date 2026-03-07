export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "on_way"
  | "delivered"
  | "failed";

export interface Courier {
  id: number;
  name: string;
  phone: string | null;
  avatar_url: string;
  active_deliveries?: number;
}

export interface Delivery {
  id: number;
  order_id: number;
  order?: {
    id: number;
    order_code: string;
    status: string;
    status_label: string;
    total: string;
    customer: string;
    customer_phone: string | null;
    items_count: number;
  };
  courier: Courier | null;
  address: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_status: DeliveryStatus;
  delivery_status_label: string;
  delivery_fee: number;
  delivery_notes: string | null;
  proof_image_url: string | null;
  proof_image_timestamp: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  is_delivered: boolean;
  created_at: string;
}

export interface DeliverySummary {
  pending: number;
  assigned: number;
  on_way: number;
  delivered: number;
  failed: number;
}
