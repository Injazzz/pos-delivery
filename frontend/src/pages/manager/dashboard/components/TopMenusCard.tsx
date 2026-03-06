// src/pages/manager/dashboard/components/TopMenusCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { TopMenu } from "@/types/dashboard";

interface Props {
  data?: TopMenu[];
  isLoading: boolean;
}

export function TopMenusCard({ data, isLoading }: Props) {
  const maxQty = data?.[0]?.total_qty ?? 1;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm font-semibold">
          Menu Terlaris — 30 Hari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-2 w-full bg-slate-800 rounded-full" />
              </div>
            ))
          : (data ?? []).map((menu, i) => (
              <div key={menu.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-600 w-4 shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-xs text-white truncate">
                      {menu.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 border-slate-700 text-slate-500 shrink-0"
                    >
                      {menu.category}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 shrink-0">
                    {menu.total_qty}x
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${(menu.total_qty / maxQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
