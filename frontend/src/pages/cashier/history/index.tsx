import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, RefreshCw, Filter, DollarSign } from "lucide-react";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { Order } from "@/types/order";

type PaymentMethod = "cash" | "transfer" | "qris" | "midtrans" | "downpayment";
type PaymentStatus = "pending" | "paid" | "partial" | "failed" | "refunded";
type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "failed";

export default function CashierHistoryPage() {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<
    PaymentStatus | "all"
  >("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<
    PaymentMethod | "all"
  >("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "cashier-orders-history",
      filterStatus,
      filterPaymentStatus,
      filterPaymentMethod,
      searchCode,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        per_page: 100,
      };

      if (filterStatus !== "all") params.status = filterStatus;
      if (searchCode) params.search = searchCode;

      const res = await ordersApi.cashierOrders(params);
      let orders: Order[] = res.data.data || [];

      // Client-side filtering untuk payment status & method
      if (filterPaymentStatus !== "all") {
        orders = orders.filter(
          (o) => o.payment?.status === filterPaymentStatus,
        );
      }
      if (filterPaymentMethod !== "all") {
        orders = orders.filter(
          (o) => o.payment?.method === filterPaymentMethod,
        );
      }

      return orders;
    },
  });

  const orders: Order[] = data || [];

  // Summary stats
  const totalOrders = orders.length;
  const dpPendingCount = orders.filter(
    (o) =>
      o.payment?.method === "downpayment" && o.payment?.status === "partial",
  ).length;
  const totalDpAmount = orders
    .filter(
      (o) =>
        o.payment?.method === "downpayment" && o.payment?.status === "partial",
    )
    .reduce((sum, o) => sum + (o.payment?.amount_remaining || 0), 0);

  const getPaymentMethodLabel = (method: string | undefined) => {
    const map: Record<string, string> = {
      cash: "Tunai",
      transfer: "Transfer",
      qris: "QRIS",
      midtrans: "Midtrans",
      downpayment: "Uang Muka (DP)",
    };
    return map[method || ""] || "-";
  };

  const getPaymentStatusBadgeColor = (
    status: string | undefined,
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "paid":
        return "secondary";
      case "pending":
        return "destructive";
      case "partial":
        return "outline";
      default:
        return "default";
    }
  };

  const getPaymentStatusLabel = (status: string | undefined) => {
    const map: Record<string, string> = {
      paid: "Lunas",
      pending: "Menunggu",
      partial: "Kurang Bayar",
      failed: "Gagal",
      refunded: "Refund",
    };
    return map[status || ""] || "-";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Pesanan</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola pesanan yang sudah dibuat
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Pesanan</p>
          <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <p className="text-orange-400 text-sm">DP Menunggu Pelunasan</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {dpPendingCount}
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Total Sisa Pembayaran DP</p>
              <p className="text-xl font-bold text-amber-400 mt-1">
                Rp {totalDpAmount.toLocaleString("id-ID")}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-300">Filter & Cari</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by order code */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Cari kode pesanan..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Filter Status */}
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as OrderStatus | "all")}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
              <SelectValue placeholder="Status Pesanan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Payment Status */}
          <Select
            value={filterPaymentStatus}
            onValueChange={(v) =>
              setFilterPaymentStatus(v as PaymentStatus | "all")
            }
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
              <SelectValue placeholder="Status Pembayaran" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="partial">Kurang Bayar</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Payment Method */}
          <Select
            value={filterPaymentMethod}
            onValueChange={(v) =>
              setFilterPaymentMethod(v as PaymentMethod | "all")
            }
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
              <SelectValue placeholder="Metode Pembayaran" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="qris">QRIS</SelectItem>
              <SelectItem value="midtrans">Midtrans</SelectItem>
              <SelectItem value="downpayment">Uang Muka (DP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-slate-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">Tidak ada pesanan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Kode Pesanan
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-300">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Metode
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Status Bayar
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order: Order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-amber-400">
                        {order.order_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {order.customer?.name || "Walk-in"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      Rp {order.total_price?.toLocaleString("id-ID") || 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {getPaymentMethodLabel(order.payment?.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={getPaymentStatusBadgeColor(
                          order.payment?.status,
                        )}
                        className="text-xs"
                      >
                        {getPaymentStatusLabel(order.payment?.status)}
                        {order.payment?.status === "partial" &&
                          order.payment?.amount_remaining && (
                            <span className="ml-1 text-[10px]">
                              (Rp{" "}
                              {order.payment.amount_remaining.toLocaleString(
                                "id-ID",
                              )}
                              )
                            </span>
                          )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {order.created_at
                        ? formatDistanceToNow(new Date(order.created_at), {
                            locale: idLocale,
                            addSuffix: true,
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/cashier/payment/${order.id}`)
                          }
                          title="Lihat detail & proses pembayaran"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Lunasi button - only for partial DP orders */}
                        {order.payment?.status === "partial" &&
                          order.payment?.method === "downpayment" && (
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                              onClick={() =>
                                navigate(`/cashier/payment/${order.id}`)
                              }
                              title="Lunasi pembayaran sisa DP"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Lunasi
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
