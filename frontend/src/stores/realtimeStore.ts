import { create } from "zustand";

export interface LiveOrderEvent {
  id: number;
  order_code: string;
  type: string;
  status: string;
  status_label: string;
  total: string;
  customer: string;
  table_number: string | null;
  created_at: string;
  event_type: "created" | "status_updated";
  old_status?: string;
  new_status?: string;
  received_at: number; // Date.now()
}

interface RealtimeStore {
  liveOrders: LiveOrderEvent[];
  connectionState: "connecting" | "connected" | "disconnected" | "failed";
  addLiveOrder: (event: LiveOrderEvent) => void;
  clearLiveOrders: () => void;
  setConnection: (state: RealtimeStore["connectionState"]) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  liveOrders: [],
  connectionState: "disconnected",

  addLiveOrder: (event) =>
    set((s) => ({
      liveOrders: [event, ...s.liveOrders].slice(0, 50), // max 50 events
    })),

  clearLiveOrders: () => set({ liveOrders: [] }),

  setConnection: (connectionState) => set({ connectionState }),
}));
