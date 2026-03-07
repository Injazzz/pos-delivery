/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentMethodData } from "@/types/report";

interface Props {
  data?: PaymentMethodData[];
  isLoading: boolean;
}

export function PaymentMethodChart({ data, isLoading }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-300">
          Metode Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 bg-slate-800 rounded-xl" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data ?? []} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(v: any) => [v, "Transaksi"]}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Total per metode */}
            <div className="mt-3 space-y-1.5">
              {(data ?? []).map((p) => (
                <div key={p.method} className="flex justify-between text-xs">
                  <span className="text-slate-400">{p.label}</span>
                  <span className="text-white font-medium">
                    Rp {p.total.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
