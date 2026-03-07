/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRealtimeStore } from "@/stores/realtimeStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function RealtimeOrderFeed() {
  const { liveOrders, clearLiveOrders } = useRealtimeStore();

  if (liveOrders.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Live Events</span>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            {liveOrders.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-slate-500 hover:text-slate-300"
          onClick={clearLiveOrders}
        >
          Hapus semua
        </Button>
      </div>

      {/* Events list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {liveOrders.map((ev, i) => (
          <div
            key={`${ev.id}-${ev.received_at}`}
            className={cn(
              "flex items-start gap-3 px-3 py-2 rounded-lg border text-xs transition-all",
              ev.event_type === "created"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-blue-500/5 border-blue-500/20",
              i === 0 && "ring-1 ring-amber-500/20",
            )}
          >
            <span className="text-base shrink-0 mt-0.5">
              {ev.event_type === "created" ? "🛎️" : "🔄"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">
                  {ev.order_code}
                </span>
                <OrderStatusBadge status={ev.status as any} />
              </div>
              <p className="text-slate-400 mt-0.5 truncate">
                {ev.customer}
                {ev.table_number && ` · Meja ${ev.table_number}`}
              </p>
            </div>
            <div className="text-slate-600 shrink-0 text-right">
              <p>{ev.total}</p>
              <p className="text-[10px] mt-0.5">
                {formatDistanceToNow(ev.received_at, {
                  addSuffix: true,
                  locale: localeId,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
