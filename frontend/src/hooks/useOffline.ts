import { useEffect, useState, useCallback, useRef } from "react";
import { pendingOrdersDB } from "@/lib/db";
import {
  syncPendingOrders,
  cacheMenusForOffline,
  type SyncResult,
} from "@/lib/offlineSync";
import { toast } from "sonner";

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  lastSyncAt: Date | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    pendingCount: 0,
    isSyncing: false,
    lastSyncResult: null,
    lastSyncAt: null,
  });

  const wasOfflineRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await pendingOrdersDB.count();
    setState((prev) => ({ ...prev, pendingCount: count }));
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || state.isSyncing) return;

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const result = await syncPendingOrders();
      await refreshPendingCount();

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncResult: result,
        lastSyncAt: new Date(),
      }));

      if (result.synced > 0) {
        toast.success(`${result.synced} pesanan offline berhasil disinkronkan`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} pesanan gagal disinkronkan`);
      }

      return result;
    } catch {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [state.isSyncing, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = async () => {
      setState((prev) => ({ ...prev, isOnline: true }));

      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        toast.success("Koneksi kembali! Menyinkronkan data...", {
          duration: 3000,
        });

        // Auto sync
        setState((prev) => ({ ...prev, isSyncing: true }));
        try {
          const result = await syncPendingOrders();
          await cacheMenusForOffline();
          await refreshPendingCount();

          setState((prev) => ({
            ...prev,
            isSyncing: false,
            wasOffline: false,
            lastSyncResult: result,
            lastSyncAt: new Date(),
          }));

          if (result.synced > 0) {
            toast.success(`${result.synced} pesanan offline berhasil dikirim`);
          }
        } catch {
          setState((prev) => ({ ...prev, isSyncing: false }));
        }
      }
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setState((prev) => ({ ...prev, isOnline: false, wasOffline: true }));
      toast.warning("Tidak ada koneksi internet. Mode offline aktif.", {
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshPendingCount]);

  return {
    ...state,
    syncNow,
    refreshPendingCount,
  };
}
