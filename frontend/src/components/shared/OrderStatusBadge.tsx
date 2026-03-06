import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string }> = {
  pending: {
    label: "Menunggu",
    class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  processing: {
    label: "Diproses",
    class: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  cooking: {
    label: "Dimasak",
    class: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  ready: {
    label: "Siap",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  on_delivery: {
    label: "Dikirim",
    class: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  delivered: {
    label: "Diterima",
    class: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
  cancelled: {
    label: "Batal",
    class: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", config.class)}
    >
      {config.label}
    </Badge>
  );
}
