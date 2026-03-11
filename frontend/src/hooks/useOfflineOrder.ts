import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pendingOrdersDB } from "@/lib/db";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useOffline } from "./useOffline";

interface OrderItemPayload {
  menu_id: number;
  quantity: number;
  qty?: number; // untuk backward compatibility jika ada
  name?: string; // nama menu untuk referensi offline
  price?: number; // harga untuk perhitungan total offline
  note?: string;
  images?: Array<{ url: string; thumb?: string; medium?: string }>;
  first_image_url?: string;
  [key: string]: unknown; // allow additional fields
}

interface CreateOrderPayload {
  order_type: "dine_in" | "take_away" | "delivery";
  items: OrderItemPayload[];
  customer_id?: number;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  notes?: string;
  table_number?: string;
  [key: string]: unknown; // Allow optional fields
}

interface OfflineOrderResult {
  id: string;
  isOffline: true;
  message: string;
}

type OrderResult = Record<string, unknown> | OfflineOrderResult;

interface CreateOrderReturn {
  orderId?: number | string;
  isOffline: boolean;
}

export function useOfflineOrder() {
  const queryClient = useQueryClient();
  const { isOnline } = useOffline();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await pendingOrdersDB.count();
    setPendingCount(count);
  }, []);

  const mutation = useMutation<OrderResult, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      if (!isOnline) {
        // Simpan ke IndexedDB
        const localId = await pendingOrdersDB.add(
          payload as unknown as Record<string, unknown>,
        );
        await refreshPendingCount();

        return {
          id: localId,
          isOffline: true,
          message:
            "Pesanan disimpan offline dan akan dikirim saat koneksi kembali",
        } as OfflineOrderResult;
      }

      // Online — kirim langsung
      const res = await api.post("/cashier/orders", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      const result = data as OfflineOrderResult;

      if (result.isOffline) {
        toast.warning("Mode Offline", {
          description: result.message,
          duration: 5000,
        });
      } else {
        toast.success("Pesanan berhasil dibuat!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
    onError: (err) => {
      toast.error("Gagal membuat pesanan: " + err.message);
    },
  });

  return {
    createOrder: async (
      payload: CreateOrderPayload,
    ): Promise<CreateOrderReturn> => {
      const result = await mutation.mutateAsync(payload);
      return {
        orderId: String((result as any).id),
        isOffline: (result as OfflineOrderResult).isOffline ?? false,
      };
    },
    isLoading: mutation.isPending,
    isOfflineMode: !isOnline,
    pendingCount,
    refreshPendingCount,
  };
}
