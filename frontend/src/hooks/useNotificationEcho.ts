/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { useEcho } from "./useEcho";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";

/**
 * Listen ke Notification broadcast di private channel user.
 * Laravel mengirim `Illuminate\Notifications\Events\BroadcastNotificationCreated`
 * ke channel `private-App.Models.User.{id}`.
 */
export function useNotificationEcho() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEcho(user ? `App.Models.User.${user.id}` : null, [
    {
      // Laravel broadcasts to `.Illuminate\Notifications\Events\BroadcastNotificationCreated`
      event: "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      callback: (data: any) => {
        // Add to local store
        addNotification({
          id: data.id ?? crypto.randomUUID(),
          type: data.type ?? "notification",
          data: {
            title: data.title ?? "Notifikasi Baru",
            message: data.message ?? "",
            order_id: data.order_id,
            order_code: data.order_code,
          },
          read_at: null,
          created_at: new Date().toISOString(),
        });

        // Refresh notification count
        qc.invalidateQueries({ queryKey: ["notification-count"] });
      },
    },
  ]);
}
