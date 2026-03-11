import { Clock, ChefHat, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Stats {
  today_orders: number;
  pending: number;
  processing: number;
  ready: number;
}

interface Props {
  stats?: Stats;
  isLoading: boolean;
}

const STAT_CARDS = [
  {
    label: "Order Hari Ini",
    key: "today_orders",
    icon: TrendingUp,
    iconBg: "bg-heart-500/10",
    iconColor: "text-heart-500",
    valueColor: "text-foreground",
  },
  {
    label: "Menunggu",
    key: "pending",
    icon: Clock,
    iconBg: "bg-glow-500/10",
    iconColor: "text-glow-500",
    valueColor: "text-glow-500",
  },
  {
    label: "Diproses",
    key: "processing",
    icon: ChefHat,
    iconBg: "bg-earth-500/10",
    iconColor: "text-earth-500",
    valueColor: "text-earth-500",
  },
  {
    label: "Siap",
    key: "ready",
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-500",
  },
];

export function StatsCards({ stats, isLoading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STAT_CARDS.map((s) => (
        <Card
          key={s.label}
          className="bg-card border-border overflow-hidden hover:shadow-md hover:shadow-heart-500/5 transition-all group"
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                s.iconBg,
              )}
            >
              <s.icon className={cn("w-4 h-4", s.iconColor)} />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-6 w-8 bg-muted" />
              ) : (
                <p className={cn("text-xl font-bold", s.valueColor)}>
                  {stats?.[s.key as keyof Stats] ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
