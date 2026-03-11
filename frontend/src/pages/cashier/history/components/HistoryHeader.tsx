import { RefreshCw, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onRefresh: () => void;
  isLoading: boolean;
}

export function HistoryHeader({ onRefresh, isLoading }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-heart-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Riwayat Pesanan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola pesanan yang sudah dibuat
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="border-border text-foreground hover:bg-muted hover:text-foreground"
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </div>
  );
}
