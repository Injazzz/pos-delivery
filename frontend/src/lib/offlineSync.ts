import { pendingOrdersDB, syncLogsDB } from "@/lib/db";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncResult = {
  synced: number;
  failed: number;
  errors: string[];
};

// ─── Sync Pending Orders ──────────────────────────────────────────────────────

export async function syncPendingOrders(): Promise<SyncResult> {
  const pending = await pendingOrdersDB.getAll();

  if (pending.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const result: SyncResult = { synced: 0, failed: 0, errors: [] };

  for (const order of pending) {
    try {
      await api.post("/cashier/orders", order.payload);

      await pendingOrdersDB.remove(order.id);
      await syncLogsDB.add({
        type: "order_sync",
        status: "success",
        data: order.payload,
        createdAt: order.createdAt,
        syncedAt: new Date().toISOString(),
      });

      result.synced++;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";

      // Skip jika sudah retry > 3x
      if (order.retryCount >= 3) {
        await pendingOrdersDB.remove(order.id);
        await syncLogsDB.add({
          type: "order_sync",
          status: "failed",
          data: order.payload,
          createdAt: order.createdAt,
          error: `Max retries exceeded. Last: ${errorMsg}`,
        });
        result.failed++;
        result.errors.push(`Order ${order.id}: max retries exceeded`);
      } else {
        await pendingOrdersDB.updateRetry(order.id, errorMsg);
        result.failed++;
        result.errors.push(`Order ${order.id}: ${errorMsg}`);
      }
    }
  }

  return result;
}

// ─── Cache Menus for Offline ──────────────────────────────────────────────────

export async function cacheMenusForOffline(): Promise<void> {
  try {
    const { cachedMenusDB } = await import("@/lib/db");
    const response = await api.get("/menus", {
      params: { per_page: 999, is_available: true },
    });

    // API returns data grouped by category: { category_name: [...items] }
    // Flatten to array
    const data = response.data.data;
    if (!data || typeof data !== "object") {
      console.warn("[OfflineSync] Invalid response data:", data);
      return;
    }

    const menus = Object.values(data)
      .flat()
      .map((m: unknown) => {
        const item = m as Record<string, unknown>;
        const imageArray = item.images as string[] | null;
        return {
          id: item.id as number,
          name: item.name as string,
          description: item.description as string | null,
          price: item.price as number,
          category: item.category as string,
          is_available: item.is_available as boolean,
          image_url: (item.first_image_url || item.image_url) as string | null,
          stock: item.stock as number,
          preparation_time: (item.preparation_time as number | null) ?? 0,
          first_image_url: item.first_image_url as string | null,
          images: imageArray?.map((url) => ({ url })) ?? [],
          cachedAt: new Date().toISOString(),
        };
      });

    await cachedMenusDB.saveAll(menus);
    console.log(`[OfflineSync] Cached ${menus.length} menus`);
  } catch (err) {
    console.warn("[OfflineSync] Failed to cache menus:", err);
  }
}

// ─── Online Event Handler ─────────────────────────────────────────────────────

let syncInProgress = false;

export async function handleOnline(): Promise<SyncResult | null> {
  if (syncInProgress) return null;
  syncInProgress = true;

  try {
    console.log("[OfflineSync] Back online, syncing pending orders...");
    const result = await syncPendingOrders();

    if (result.synced > 0 || result.failed > 0) {
      console.log(
        `[OfflineSync] Sync complete: ${result.synced} synced, ${result.failed} failed`,
      );
    }

    // Refresh menu cache saat online
    await cacheMenusForOffline();

    return result;
  } finally {
    syncInProgress = false;
  }
}

// ─── Register Sync Listeners ──────────────────────────────────────────────────

export function registerSyncListeners(
  onSyncComplete?: (result: SyncResult) => void,
): () => void {
  const handler = async () => {
    const result = await handleOnline();
    if (result && onSyncComplete) {
      onSyncComplete(result);
    }
  };

  window.addEventListener("online", handler);

  // Sync immediately jika sudah online
  if (navigator.onLine) {
    handleOnline().then((result) => {
      if (result && onSyncComplete) onSyncComplete(result);
    });
  }

  return () => {
    window.removeEventListener("online", handler);
  };
}
