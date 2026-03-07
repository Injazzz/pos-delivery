import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/types/delivery";

const CONFIG: Record<DeliveryStatus, { label: string; class: string }> = {
  pending: {
    label: "Menunggu",
    class: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
  assigned: {
    label: "Kurir Ditugaskan",
    class: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  picked_up: {
    label: "Diambil",
    class: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  on_way: {
    label: "Dalam Perjalanan",
    class: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  delivered: {
    label: "Terkirim",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  failed: {
    label: "Gagal",
    class: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const c = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", c.class)}>
      {c.label}
    </Badge>
  );
}
