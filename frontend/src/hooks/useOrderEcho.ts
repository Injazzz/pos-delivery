/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEcho } from "./useEcho";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types/auth";

/**
 * Kasir & Manager: subscribe ke channel 'cashier'
 * Pelanggan: subscribe ke 'customer.{userId}'
 */
export function useOrderEcho() {
  const qc = useQueryClient();
  const addLiveOrder = useRealtimeStore((s) => s.addLiveOrder);
  const user = useAuthStore((s) => s.user);

  const isCashierOrManager =
    user?.role === UserRole.Kasir || user?.role === UserRole.Manager;

  const isCustomer = user?.role === UserRole.Pelanggan;

  // Channel selection
  const channel = isCashierOrManager
    ? "cashier"
    : isCustomer
      ? `customer.${user?.id}`
      : null;

  useEcho(channel, [
    {
      event: "order.created",
      callback: (data: any) => {
        // Refresh queries
        qc.invalidateQueries({ queryKey: ["cashier-orders"] });
        qc.invalidateQueries({ queryKey: ["manager-orders"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

        // Add to live feed
        addLiveOrder({
          ...data,
          event_type: "created",
          received_at: Date.now(),
        });

        // Toast
        if (isCashierOrManager) {
          toast.info(`🛎️ Order baru masuk — ${data.order_code}`, {
            description: `${data.customer} · ${data.total}`,
            duration: 6000,
          });
        }
      },
    },
    {
      event: "order.status.updated",
      callback: (data: any) => {
        qc.invalidateQueries({ queryKey: ["cashier-orders"] });
        qc.invalidateQueries({ queryKey: ["manager-orders"] });
        qc.invalidateQueries({ queryKey: ["customer-orders"] });
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
        qc.invalidateQueries({ queryKey: ["order", data.id] });

        addLiveOrder({
          ...data,
          status: data.new_status,
          event_type: "status_updated",
          received_at: Date.now(),
        });

        // Customer: toast status update
        if (isCustomer) {
          toast.success(`📦 Order ${data.order_code} — ${data.status_label}`, {
            duration: 5000,
          });
        }
      },
    },
  ]);
}
