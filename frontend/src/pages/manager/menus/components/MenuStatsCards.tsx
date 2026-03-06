import {
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Summary {
  total: number;
  available: number;
  unavailable: number;
  categories: number;
}

const STATS = [
  {
    key: "total",
    label: "Total Menu",
    icon: UtensilsCrossed,
    color: "text-slate-300",
    get: (s: Summary) => s.total,
  },
  {
    key: "available",
    label: "Tersedia",
    icon: CheckCircle,
    color: "text-emerald-400",
    get: (s: Summary) => s.available,
  },
  {
    key: "unavailable",
    label: "Tidak Tersedia",
    icon: XCircle,
    color: "text-red-400",
    get: (s: Summary) => s.unavailable,
  },
  {
    key: "categories",
    label: "Kategori",
    icon: LayoutGrid,
    color: "text-amber-400",
    get: (s: Summary) => s.categories,
  },
];

export function MenuStatsCards({
  summary,
  isLoading,
}: {
  summary?: Summary;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((s) => (
        <Card key={s.key} className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-6 w-8 bg-slate-800" />
              ) : (
                <p className="text-xl font-bold text-white leading-none">
                  {summary ? s.get(summary) : 0}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
