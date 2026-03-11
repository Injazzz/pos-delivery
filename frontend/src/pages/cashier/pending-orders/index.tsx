import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Trash2,
  Send,
  WifiOff,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { pendingOrdersDB, type PendingOrder } from "@/lib/db";
import { syncPendingOrders } from "@/lib/offlineSync";
import { useOffline } from "@/hooks/useOffline";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isOnline, pendingCount } = useOffline();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const list = await pendingOrdersDB.getAll();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast.error("Tidak ada koneksi internet");
      return;
    }
    setSyncing(true);
    try {
      const result = await syncPendingOrders();
      await loadOrders();
      if (result.synced > 0)
        toast.success(`${result.synced} pesanan berhasil disinkronkan`);
      if (result.failed > 0) toast.error(`${result.failed} pesanan gagal`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    await pendingOrdersDB.remove(id);
    await loadOrders();
    toast.success("Pesanan dihapus dari antrian");
  };

  const getOrderItems = (order: PendingOrder) => {
    const payload = order.payload as {
      items?: Array<{ name: string; quantity: number }>;
    };
    return payload.items ?? [];
  };

  const getOrderTotal = (order: PendingOrder) => {
    const payload = order.payload as {
      items?: Array<{ price: number; quantity: number }>;
    };
    return (payload.items ?? []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-glow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Pesanan Offline
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pesanan yang dibuat saat offline dan belum dikirim ke server
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              disabled={loading}
              className="border-border text-foreground hover:bg-muted hover:text-foreground"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSyncAll}
              disabled={!isOnline || syncing || orders.length === 0}
              className="bg-heart-500 hover:bg-heart-600 text-white"
            >
              <Send
                className={`h-4 w-4 mr-2 ${syncing ? "animate-pulse" : ""}`}
              />
              {syncing ? "Mengirim..." : `Kirim Semua (${orders.length})`}
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {!isOnline && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-glow-500/10 border border-glow-500/30 text-glow-600">
            <WifiOff className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              Tidak ada koneksi. Pesanan akan otomatis dikirim saat online.
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {pendingCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gagal Retry</p>
                  <p className="text-2xl font-bold text-glow-500 mt-1">
                    {orders.filter((o) => o.retryCount > 0).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-glow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-glow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Nilai</p>
                  <p className="text-2xl font-bold text-heart-500 mt-1">
                    Rp{" "}
                    {orders
                      .reduce((sum, o) => sum + getOrderTotal(o), 0)
                      .toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-heart-500/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-heart-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5">
                  <Skeleton className="h-20 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Tidak ada pesanan offline pending
              </p>
              <p className="text-xs text-muted-foreground">
                Pesanan yang dibuat saat offline akan muncul di sini
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const total = getOrderTotal(order);
              const payload = order.payload as {
                type?: string;
                notes?: string;
              };
              const hasError = order.retryCount > 0;

              return (
                <Card
                  key={order.id}
                  className={cn(
                    "bg-card border-border overflow-hidden transition-all",
                    hasError && "border-glow-500/50 bg-glow-500/5",
                  )}
                >
                  <CardHeader className="pb-3 border-b border-border bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium text-foreground">
                          Pesanan #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasError && (
                          <Badge
                            variant="outline"
                            className="bg-glow-500/10 text-glow-600 border-glow-500/30"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Retry {order.retryCount}x
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border"
                        >
                          {payload.type === "dine_in"
                            ? "Dine In"
                            : payload.type === "takeaway"
                              ? "Takeaway"
                              : "Delivery"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.lastError && (
                      <div className="text-xs text-destructive mb-3 bg-destructive/10 p-2 rounded-lg border border-destructive/30">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>Error: {order.lastError}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold text-heart-500 text-base">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
