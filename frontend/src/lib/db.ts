/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface POSDatabase extends DBSchema {
  orders: {
    key: string;
    value: {
      id: string;
      data: any;
      synced: boolean;
      createdAt: number;
    };
  };
  menus: {
    key: string;
    value: any;
  };
  cart: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<POSDatabase>;

export async function getDB() {
  if (!db) {
    db = await openDB<POSDatabase>("pos-delivery", 1, {
      upgrade(db) {
        db.createObjectStore("orders", { keyPath: "id" });
        db.createObjectStore("menus", { keyPath: "id" });
        db.createObjectStore("cart", { keyPath: "id" });
      },
    });
  }
  return db;
}

// Simpan order offline saat tidak ada koneksi
export async function saveOrderOffline(order: any) {
  const database = await getDB();
  await database.put("orders", {
    id: `offline_${Date.now()}`,
    data: order,
    synced: false,
    createdAt: Date.now(),
  });
}

// Ambil semua order yang belum sync
export async function getUnsyncedOrders() {
  const database = await getDB();
  const all = await database.getAll("orders");
  return all.filter((o) => !o.synced);
}
