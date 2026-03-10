import { Printer } from "lucide-react";

export function ReceiptEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card border border-border rounded-xl">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
        <Printer className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        Tidak ada order ditemukan
      </p>
      <p className="text-xs text-muted-foreground max-w-sm">
        Coba ubah kata kunci pencarian atau tunggu order baru masuk
      </p>
    </div>
  );
}
