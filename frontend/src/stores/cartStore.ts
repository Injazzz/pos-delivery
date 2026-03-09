import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Menu } from "@/types/menu";
import type { OrderType } from "@/types/order";

export interface CartItem {
  menu: Menu;
  qty: number;
  note: string;
}

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string;
  notes: string;

  addItem: (menu: Menu, qty?: number, note?: string) => void;
  removeItem: (menuId: number) => void;
  updateQty: (menuId: number, qty: number) => void;
  updateNote: (menuId: number, note: string) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (v: string) => void;
  setDeliveryInfo: (
    info: Partial<
      Pick<CartState, "deliveryAddress" | "deliveryCity" | "deliveryNotes">
    >,
  ) => void;
  setNotes: (v: string) => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "dine_in",
      tableNumber: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryNotes: "",
      notes: "",

      addItem: (menu, qty = 1, note = "") => {
        set((state) => {
          const existing = state.items.find((i) => i.menu.id === menu.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menu.id === menu.id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { menu, qty, note }] };
        });
      },

      removeItem: (menuId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menu.id !== menuId),
        })),

      updateQty: (menuId, qty) => {
        if (qty <= 0) {
          get().removeItem(menuId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menu.id === menuId ? { ...i, qty } : i,
          ),
        }));
      },

      updateNote: (menuId, note) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menu.id === menuId ? { ...i, note } : i,
          ),
        })),

      clearCart: () =>
        set({ items: [], tableNumber: "", deliveryAddress: "", notes: "" }),

      setOrderType: (orderType) => set({ orderType }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setDeliveryInfo: (info) => set(info),
      setNotes: (notes) => set({ notes }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.menu.price * i.qty, 0),
    }),
    { name: "pos-cart" },
  ),
);
