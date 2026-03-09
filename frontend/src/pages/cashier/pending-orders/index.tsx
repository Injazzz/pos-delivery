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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pesanan Offline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pesanan yang dibuat saat offline dan belum dikirim ke server
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
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
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            Tidak ada koneksi. Pesanan akan otomatis dikirim saat online.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-orange-500">
              {orders.filter((o) => o.retryCount > 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Gagal Retry</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-500">
              Rp
              {orders
                .reduce((sum, o) => sum + getOrderTotal(o), 0)
                .toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Order List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Tidak ada pesanan offline pending
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = getOrderItems(order);
            const total = getOrderTotal(order);
            const payload = order.payload as { type?: string; notes?: string };

            return (
              <Card
                key={order.id}
                className={order.retryCount > 0 ? "border-orange-200" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">
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
                      {order.retryCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-300"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Retry {order.retryCount}x
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {payload.type === "dine_in"
                          ? "Dine In"
                          : payload.type === "takeaway"
                            ? "Takeaway"
                            : "Delivery"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
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
                    <p className="text-xs text-red-500 mb-2 bg-red-50 p-2 rounded">
                      Error: {order.lastError}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      Rp{total.toLocaleString("id-ID")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2"
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
  );
}
