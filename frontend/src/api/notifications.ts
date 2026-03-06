/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/lib/axios";

export interface AppNotification {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    order_id?: number;
    order_code?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  data: AppNotification[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    unread_count: number;
  };
}

export const notificationsApi = {
  getAll: (page = 1) =>
    apiClient.get<NotificationResponse>("/notifications", { params: { page } }),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count"),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch("/notifications/read-all"),

  delete: (id: string) => apiClient.delete(`/notifications/${id}`),

  deleteAll: () => apiClient.delete("/notifications"),
};
