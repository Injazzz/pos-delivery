/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { notificationsApi, type AppNotification } from "@/api/notifications";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: AppNotification) => void; // dipanggil dari WebSocket
}

export const useNotificationStore = create<NotificationState>((set, _get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationsApi.getAll();
      set({
        notifications: res.data.data,
        unreadCount: res.data.meta.unread_count,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch (_) {}
  },

  markAsRead: async (id) => {
    await notificationsApi.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await notificationsApi.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await notificationsApi.delete(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // Dipanggil saat ada event WebSocket masuk (Module 8)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
