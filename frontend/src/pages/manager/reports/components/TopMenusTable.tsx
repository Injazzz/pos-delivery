import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopMenu } from "@/types/report";

interface Props {
  data?: TopMenu[];
  isLoading: boolean;
}

export function TopMenusTable({ data, isLoading }: Props) {
  const maxQty = data?.[0]?.total_qty ?? 1;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-300">
          Menu Terlaris
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 bg-slate-800 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((menu, i) => (
              <div key={menu.menu_id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`
                      text-xs font-bold w-5 text-right shrink-0
                      ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-600"}
                    `}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {menu.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {menu.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white">
                      {menu.total_qty} terjual
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Rp {menu.total_revenue.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden ml-7">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(menu.total_qty / maxQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
