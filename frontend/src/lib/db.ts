import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ─── Schema ──────────────────────────────────────────────────────────────────

export interface PendingOrder {
  id: string; // local UUID
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface CachedMenu {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  image_url: string | null;
  cachedAt: string;
}

export interface OfflineCart {
  id: string; // 'current'
  items: CartItem[];
  updatedAt: string;
}

export interface CartItem {
  menu_id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface SyncLog {
  id?: number;
  type: "order_sync" | "status_update";
  status: "pending" | "success" | "failed";
  data: Record<string, unknown>;
  createdAt: string;
  syncedAt?: string;
  error?: string;
}

interface AppDB extends DBSchema {
  pending_orders: {
    key: string;
    value: PendingOrder;
    indexes: { "by-created": string };
  };
  cached_menus: {
    key: number;
    value: CachedMenu;
    indexes: { "by-category": string };
  };
  offline_cart: {
    key: string;
    value: OfflineCart;
  };
  sync_logs: {
    key: number;
    value: SyncLog;
    indexes: { "by-status": string; "by-type": string };
  };
}

// ─── DB Instance ──────────────────────────────────────────────────────────────

let dbInstance: IDBPDatabase<AppDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AppDB>("pos-app-db", 2, {
    upgrade(db, oldVersion) {
      // v1
      if (oldVersion < 1) {
        const pendingStore = db.createObjectStore("pending_orders", {
          keyPath: "id",
        });
        pendingStore.createIndex("by-created", "createdAt");

        const menuStore = db.createObjectStore("cached_menus", {
          keyPath: "id",
        });
        menuStore.createIndex("by-category", "category");

        db.createObjectStore("offline_cart", { keyPath: "id" });
      }
      // v2 — sync_logs
      if (oldVersion < 2) {
        const logStore = db.createObjectStore("sync_logs", {
          keyPath: "id",
          autoIncrement: true,
        });
        logStore.createIndex("by-status", "status");
        logStore.createIndex("by-type", "type");
      }
    },
  });

  return dbInstance;
}

// ─── Pending Orders ───────────────────────────────────────────────────────────

export const pendingOrdersDB = {
  async add(payload: Record<string, unknown>): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.add("pending_orders", {
      id,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
    return id;
  },

  async getAll(): Promise<PendingOrder[]> {
    const db = await getDB();
    return db.getAllFromIndex("pending_orders", "by-created");
  },

  async updateRetry(id: string, error?: string): Promise<void> {
    const db = await getDB();
    const item = await db.get("pending_orders", id);
    if (!item) return;
    await db.put("pending_orders", {
      ...item,
      retryCount: item.retryCount + 1,
      lastError: error,
    });
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("pending_orders", id);
  },

  async count(): Promise<number> {
    const db = await getDB();
    return db.count("pending_orders");
  },
};

// ─── Cached Menus ─────────────────────────────────────────────────────────────

export const cachedMenusDB = {
  async saveAll(menus: CachedMenu[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("cached_menus", "readwrite");
    await tx.store.clear();
    await Promise.all(menus.map((m) => tx.store.put(m)));
    await tx.done;
  },

  async getAll(): Promise<CachedMenu[]> {
    const db = await getDB();
    return db.getAll("cached_menus");
  },

  async getByCategory(category: string): Promise<CachedMenu[]> {
    const db = await getDB();
    return db.getAllFromIndex("cached_menus", "by-category", category);
  },

  async count(): Promise<number> {
    const db = await getDB();
    return db.count("cached_menus");
  },
};

// ─── Offline Cart ─────────────────────────────────────────────────────────────

export const offlineCartDB = {
  async get(): Promise<OfflineCart | undefined> {
    const db = await getDB();
    return db.get("offline_cart", "current");
  },

  async save(items: CartItem[]): Promise<void> {
    const db = await getDB();
    await db.put("offline_cart", {
      id: "current",
      items,
      updatedAt: new Date().toISOString(),
    });
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.delete("offline_cart", "current");
  },
};

// ─── Sync Logs ────────────────────────────────────────────────────────────────

export const syncLogsDB = {
  async add(log: Omit<SyncLog, "id">): Promise<void> {
    const db = await getDB();
    await db.add("sync_logs", log);
  },

  async getRecent(limit = 50): Promise<SyncLog[]> {
    const db = await getDB();
    const all = await db.getAll("sync_logs");
    return all.slice(-limit).reverse();
  },

  async getPending(): Promise<SyncLog[]> {
    const db = await getDB();
    return db.getAllFromIndex("sync_logs", "by-status", "pending");
  },

  async markSynced(id: number): Promise<void> {
    const db = await getDB();
    const item = await db.get("sync_logs", id);
    if (!item) return;
    await db.put("sync_logs", {
      ...item,
      status: "success",
      syncedAt: new Date().toISOString(),
    });
  },

  async clearOld(daysOld = 7): Promise<void> {
    const db = await getDB();
    const all = await db.getAll("sync_logs");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const tx = db.transaction("sync_logs", "readwrite");
    for (const log of all) {
      if (log.id && new Date(log.createdAt) < cutoff) {
        await tx.store.delete(log.id);
      }
    }
    await tx.done;
  },
};
