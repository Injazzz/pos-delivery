/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEcho } from "./useEcho";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types/auth";

export function useDeliveryEcho() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const isManager = user?.role === UserRole.Manager;
  const isKurir = user?.role === UserRole.Kurir;
  const isCustomer = user?.role === UserRole.Pelanggan;

  const channel = isManager
    ? "manager"
    : isKurir
      ? `courier.${user?.id}`
      : isCustomer
        ? `customer.${user?.id}`
        : null;

  useEcho(channel, [
    {
      event: "delivery.status.updated",
      callback: (data: any) => {
        qc.invalidateQueries({ queryKey: ["manager-deliveries"] });
        qc.invalidateQueries({ queryKey: ["courier-deliveries"] });
        qc.invalidateQueries({ queryKey: ["customer-orders"] });

        const statusLabels: Record<string, string> = {
          assigned: "Kurir ditugaskan",
          picked_up: "Pesanan diambil kurir",
          on_way: "Kurir dalam perjalanan",
          delivered: "Pesanan telah tiba! ✅",
          failed: "Pengiriman gagal",
        };

        const label = statusLabels[data.new_status] ?? data.new_status;

        if (isManager) {
          toast.info(`🚴 ${data.order_code} — ${label}`, { duration: 4000 });
        }

        if (isCustomer) {
          toast.success(`🚴 ${label}`, {
            description: `Order ${data.order_code}`,
            duration: 6000,
          });
        }

        if (isKurir) {
          toast.info(`Status diperbarui: ${label}`, { duration: 3000 });
        }
      },
    },
  ]);
}
