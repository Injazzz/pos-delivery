/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/lib/axios";
import type { Order, OrderFilters, StoreOrderPayload } from "@/types/order";
import type { PaginatedResponse } from "@/types/pagination";

interface OrderListResponse extends PaginatedResponse<Order> {
  stats?: {
    today_orders: number;
    today_revenue: number;
    pending: number;
    processing: number;
    ready: number;
  };
}

export const ordersApi = {
  // Customer
  customerOrders: (filters?: OrderFilters) =>
    apiClient.get<OrderListResponse>("/customer/orders", { params: filters }),

  customerCreate: (payload: StoreOrderPayload) =>
    apiClient.post<{ message: string; data: Order }>(
      "/customer/orders",
      payload,
    ),

  customerShow: (id: number) =>
    apiClient.get<{ data: Order }>(`/customer/orders/${id}`),

  customerMarkReceived: (id: number) =>
    apiClient.patch<{ message: string; data: Order }>(
      `/customer/orders/${id}/received`,
    ),

  customerReview: (
    orderId: number,
    data: { rating: number; comment?: string },
  ) => apiClient.post(`/customer/orders/${orderId}/review`, data),

  // Cashier
  cashierOrders: (filters?: OrderFilters) =>
    apiClient.get<OrderListResponse>("/cashier/orders", { params: filters }),

  cashierCreate: (payload: StoreOrderPayload) =>
    apiClient.post<{ message: string; data: Order }>(
      "/cashier/orders",
      payload,
    ),

  cashierUpdateStatus: (id: number, status: string, reason?: string) =>
    apiClient.patch<{ message: string; data: Order }>(
      `/cashier/orders/${id}/status`,
      { status, reason },
    ),

  cashierReceipt: (id: number) =>
    apiClient.get<{ data: any }>(`/cashier/orders/${id}/receipt`),

  // Manager
  managerOrders: (filters?: OrderFilters) =>
    apiClient.get<OrderListResponse>("/manager/orders", { params: filters }),

  managerUpdateStatus: (id: number, status: string, reason?: string) =>
    apiClient.patch<{ message: string; data: Order }>(
      `/manager/orders/${id}/status`,
      { status, reason },
    ),
};
