import { Clock, Bike, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DeliverySummary } from "@/types/delivery";

const STATS = [
  {
    key: "pending",
    label: "Menunggu Kurir",
    icon: Clock,
    iconBg: "bg-glow-500/10",
    iconColor: "text-glow-500",
    valueColor: "text-glow-500",
  },
  {
    key: "assigned",
    label: "Kurir Ditugaskan",
    icon: UserCheck,
    iconBg: "bg-heart-500/10",
    iconColor: "text-heart-500",
    valueColor: "text-heart-500",
  },
  {
    key: "on_way",
    label: "Dalam Perjalanan",
    icon: Bike,
    iconBg: "bg-earth-500/10",
    iconColor: "text-earth-500",
    valueColor: "text-earth-500",
  },
  {
    key: "delivered",
    label: "Terkirim",
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-500",
  },
  {
    key: "failed",
    label: "Gagal",
    icon: XCircle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    valueColor: "text-destructive",
  },
];

export function DeliveryStatsBar({
  summary,
  isLoading,
}: {
  summary?: DeliverySummary;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {STATS.map((s) => (
        <Card
          key={s.key}
          className="bg-card border-border overflow-hidden hover:shadow-md hover:shadow-heart-500/5 transition-all group"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Icon dengan background */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  s.iconBg,
                )}
              >
                <s.icon className={cn("w-5 h-5", s.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-12 bg-muted mb-1" />
                    <Skeleton className="h-3 w-16 bg-muted" />
                  </>
                ) : (
                  <>
                    <p
                      className={cn(
                        "text-xl font-bold leading-none",
                        s.valueColor,
                      )}
                    >
                      {summary?.[s.key as keyof DeliverySummary] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {s.label}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
