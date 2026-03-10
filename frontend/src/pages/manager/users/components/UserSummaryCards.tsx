import { Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types/user";

interface Props {
  summary?: UserSummary;
  isLoading: boolean;
}

const STATS = [
  {
    key: "total",
    label: "Total Pengguna",
    icon: Users,
    iconColor: "text-heart-500",
    bgColor: "bg-heart-500/10",
    valueColor: "text-foreground",
    getValue: (s: UserSummary) => s.total,
  },
  {
    key: "active",
    label: "Aktif",
    icon: UserCheck,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    valueColor: "text-emerald-500",
    getValue: (s: UserSummary) => s.active,
  },
  {
    key: "inactive",
    label: "Nonaktif",
    icon: UserX,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
    valueColor: "text-destructive",
    getValue: (s: UserSummary) => s.inactive,
  },
  {
    key: "kasir",
    label: "Kasir",
    icon: ShieldCheck,
    iconColor: "text-earth-500",
    bgColor: "bg-earth-500/10",
    valueColor: "text-earth-500",
    getValue: (s: UserSummary) => s.by_role?.kasir ?? 0,
  },
];

export function UserSummaryCards({ summary, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat) => (
        <Card
          key={stat.key}
          className="bg-card border-border overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4 flex items-center gap-3">
            {/* Icon dengan background */}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                stat.bgColor,
              )}
            >
              <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <Skeleton className="h-7 w-12 bg-muted mb-1" />
              ) : (
                <p
                  className={cn(
                    "text-xl font-bold leading-none",
                    stat.valueColor,
                  )}
                >
                  {summary ? stat.getValue(summary) : 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate mt-1">
                {stat.label}
              </p>
            </div>

            {/* Decorative gradient line */}
            <div
              className={cn(
                "w-1 h-8 rounded-full self-center",
                stat.key === "total"
                  ? "bg-heart-500"
                  : stat.key === "active"
                    ? "bg-emerald-500"
                    : stat.key === "inactive"
                      ? "bg-destructive"
                      : "bg-earth-500",
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
