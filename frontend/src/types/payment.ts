export type PaymentMethod =
  | "cash"
  | "transfer"
  | "qris"
  | "midtrans"
  | "downpayment";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "partial"
  | "failed"
  | "refunded";

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  amount_paid: number;
  amount_remaining: number;
  cash_received: number;
  change_amount: number;
  payment_url: string | null;
  paid_at: string | null;
}

export interface ReceiptData {
  store_name: string;
  store_address: string;
  store_phone: string;
  order_code: string;
  order_type: string;
  cashier: string;
  customer: string;
  table_number: string | null;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    subtotal: number;
    note: string | null;
  }>;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  amount_paid: number;
  change: number;
  payment_status: string;
  paid_at: string;
  created_at: string;
  printed_at: string;
  notes: string | null;
}

export interface MidtransResult {
  snap_token: string;
  order_id: string;
  amount: number;
  client_key: string;
  is_production: boolean;
}
