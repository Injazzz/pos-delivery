import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

const TIMELINE: Array<{ status: string; label: string }> = [
  { status: "pending", label: "Pesanan Masuk" },
  { status: "processing", label: "Dikonfirmasi" },
  { status: "cooking", label: "Dimasak" },
  { status: "ready", label: "Siap" },
  { status: "on_delivery", label: "Dikirim" },
  { status: "delivered", label: "Diterima" },
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

  return (
    <div className="space-y-1">
      {isCancelled ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <span className="text-destructive text-sm font-medium">
            ✕ Pesanan Dibatalkan
          </span>
        </div>
      ) : (
        TIMELINE.map((step, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;

          // Cari log untuk step ini
          const log = order.status_logs?.find((l) => l.to === step.status);

          return (
            <div key={step.status} className="flex gap-3">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    isDone
                      ? "bg-emerald-500"
                      : isCurrent
                        ? "bg-accent"
                        : "bg-muted border border-border",
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-3 h-3",
                        isCurrent
                          ? "text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-6 mt-1",
                      isDone ? "bg-emerald-500/40" : "bg-muted",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 min-w-0">
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
                {log && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(log.updated_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {log.updated_by !== "System" && ` · ${log.updated_by}`}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
