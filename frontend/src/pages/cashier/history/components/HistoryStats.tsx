import { Receipt } from "lucide-react";

interface Props {
  totalOrders: number;
}

export function HistoryStats({ totalOrders }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Total Semua Pesanan</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalOrders.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-heart-500/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-heart-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
