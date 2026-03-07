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
    color: "text-slate-400",
  },
  {
    key: "assigned",
    label: "Kurir Ditugaskan",
    icon: UserCheck,
    color: "text-blue-400",
  },
  {
    key: "on_way",
    label: "Dalam Perjalanan",
    icon: Bike,
    color: "text-violet-400",
  },
  {
    key: "delivered",
    label: "Terkirim",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  { key: "failed", label: "Gagal", icon: XCircle, color: "text-red-400" },
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
        <Card key={s.key} className="bg-slate-900 border-slate-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-5 w-6 bg-slate-800" />
              ) : (
                <p className="text-lg font-bold text-white leading-none">
                  {summary?.[s.key as keyof DeliverySummary] ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {s.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
