/* eslint-disable @typescript-eslint/no-unused-vars */
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/hooks/useOffline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOnline, isSyncing, pendingCount, syncNow, lastSyncAt } =
    useOffline();

  // Sembunyikan jika online dan tidak ada pending
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm transition-all",
        !isOnline
          ? "bg-orange-500/10 border-b border-orange-500/20 text-orange-600"
          : "bg-blue-500/10 border-b border-blue-500/20 text-blue-600",
        className,
      )}
    >
      {!isOnline ? (
        <WifiOff className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}

      <span className="flex-1">
        {!isOnline ? (
          <>
            <strong>Mode Offline</strong> — Data akan disinkronkan saat koneksi
            kembali.
          </>
        ) : pendingCount > 0 ? (
          <>
            Koneksi kembali. <strong>{pendingCount} pesanan offline</strong>{" "}
            menunggu sinkronisasi.
          </>
        ) : null}
      </span>

      {pendingCount > 0 && (
        <Badge variant="outline" className="shrink-0 text-xs">
          {pendingCount} pending
        </Badge>
      )}

      {lastSyncAt && (
        <span className="text-xs opacity-60 shrink-0">
          Sync: {lastSyncAt.toLocaleTimeString("id-ID")}
        </span>
      )}

      {isOnline && pendingCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 shrink-0"
          onClick={syncNow}
          disabled={isSyncing}
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isSyncing && "animate-spin")}
          />
          {isSyncing ? "Syncing..." : "Sync Sekarang"}
        </Button>
      )}
    </div>
  );
}

// ─── Compact Indicator untuk Navbar ──────────────────────────────────────────

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {!isOnline ? (
        <>
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-500 font-medium">Offline</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
          <span className="text-blue-500">Syncing...</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span className="text-amber-500">{pendingCount} pending</span>
        </>
      )}
    </div>
  );
}
