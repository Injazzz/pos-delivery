import { CheckCircle, Circle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

const TIMELINE: Array<{ status: string; label: string; color: string }> = [
  { status: "pending", label: "Pesanan Masuk", color: "text-glow-500" },
  { status: "processing", label: "Dikonfirmasi", color: "text-heart-400" },
  { status: "cooking", label: "Dimasak", color: "text-earth-500" },
  { status: "ready", label: "Siap", color: "text-emerald-500" },
  { status: "on_delivery", label: "Dikirim", color: "text-glow-500" },
  { status: "delivered", label: "Diterima", color: "text-emerald-500" },
];

const STATUS_ORDER = [
  "pending",
  "processing",
  "cooking",
  "ready",
  "on_delivery",
  "delivered",
];

export function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  // Jika status cancelled, tampilkan timeline khusus
  if (isCancelled) {
    return (
      <div className="space-y-3">
        {/* Status sebelumnya (jika ada) */}
        {order.status_logs && order.status_logs.length > 0 && (
          <div className="space-y-1 opacity-60">
            {order.status_logs.slice(0, -1).map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  {order.status_logs && idx < order.status_logs.length - 2 && (
                    <div className="w-0.5 h-6 bg-emerald-500/40 mt-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-foreground">
                    {TIMELINE.find(t => t.status === log.to)?.label || log.to}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(log.updated_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status akhir (cancelled/failed) */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-destructive">
              Pesanan Dibatalkan
            </p>
            {order.status_logs && order.status_logs.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.status_logs[order.status_logs.length - 1].updated_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {TIMELINE.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;

        // Cari log untuk step ini
        const log = order.status_logs?.find((l) => l.to === step.status);
        const stepColor = step.color;

        return (
          <div key={step.status} className="flex gap-3">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
                  isDone
                    ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                    : isCurrent
                      ? cn("bg-heart-500 shadow-md shadow-heart-500/20", stepColor)
                      : "bg-muted border-2 border-border",
                )}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <div className="relative">
                    <Circle className="w-4 h-4 text-white animate-pulse" />
                    <span className="absolute inset-0 rounded-full animate-ping bg-white/20" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {i < TIMELINE.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 mt-1 transition-all",
                    isDone ? "bg-emerald-500/40" : "bg-border",
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn(
              "pb-5 min-w-0 flex-1",
              isCurrent && "animate-pulse"
            )}>
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDone || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="text-[8px] bg-heart-500/10 text-heart-500 px-1.5 py-0.5 rounded-full border border-heart-500/30">
                    Sedang diproses
                  </span>
                )}
              </div>
              
              {log ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(log.updated_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {log.updated_by && log.updated_by !== "System" && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span className="text-xs">oleh {log.updated_by}</span>
                    </>
                  )}
                </div>
              ) : isCurrent && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>Menunggu proses...</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}