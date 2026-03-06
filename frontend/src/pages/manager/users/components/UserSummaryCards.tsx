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
    color: "text-slate-300",
    getValue: (s: UserSummary) => s.total,
  },
  {
    key: "active",
    label: "Aktif",
    icon: UserCheck,
    color: "text-emerald-400",
    getValue: (s: UserSummary) => s.active,
  },
  {
    key: "inactive",
    label: "Nonaktif",
    icon: UserX,
    color: "text-red-400",
    getValue: (s: UserSummary) => s.inactive,
  },
  {
    key: "kasir",
    label: "Kasir",
    icon: ShieldCheck,
    color: "text-blue-400",
    getValue: (s: UserSummary) => s.by_role?.kasir ?? 0,
  },
];

export function UserSummaryCards({ summary, isLoading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat) => (
        <Card key={stat.key} className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-6 w-8 bg-slate-800" />
              ) : (
                <p className="text-xl font-bold text-white leading-none">
                  {summary ? stat.getValue(summary) : 0}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
