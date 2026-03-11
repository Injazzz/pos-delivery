import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { HistoryHeader } from "./components/HistoryHeader";
import { HistoryStats } from "./components/HistoryStats";
import { HistoryFilters } from "./components/HistoryFilters";
import { HistoryTable } from "./components/HistoryTable";
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
  const [searchCode, setSearchCode] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<
    PaymentStatus | "all"
  >("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<
    PaymentMethod | "all"
  >("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "cashier-orders-history",
      filterStatus,
      filterPaymentStatus,
      filterPaymentMethod,
      searchCode,
      page,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        per_page: 10,
        page,
      };

      if (filterStatus !== "all") params.status = filterStatus;
      if (searchCode) params.search = searchCode;

      const res = await ordersApi.cashierOrders(params);

      // Data untuk tabel dengan pagination
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

      return {
        data: orders,
        meta: res.data.meta,
        // Total keseluruhan dari API (seharusnya API sudah mengembalikan total)
        totalAllOrders: res.data.meta?.total || orders.length,
      };
    },
  });

  const orders: Order[] = data?.data || [];
  const meta = data?.meta;
  // Gunakan total dari API, bukan dari data yang difilter
  const totalAllOrders = data?.totalAllOrders || orders.length;

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

  const getPaymentStatusBadgeColor = (status: string | undefined): string => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "pending":
        return "bg-glow-500/10 text-glow-500 border-glow-500/30";
      case "partial":
        return "bg-glow-500/10 text-glow-500 border-glow-500/30";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
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

  // Reset page ke 1 ketika filter berubah
  const handleFilterChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T,
  ) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-background min-h-screen space-y-6">
      <HistoryHeader onRefresh={refetch} isLoading={isLoading} />
      {/* Kirim total semua pesanan ke stats */}
      <HistoryStats totalOrders={totalAllOrders} />
      <HistoryFilters
        searchCode={searchCode}
        onSearchChange={(value) => handleFilterChange(setSearchCode, value)}
        filterStatus={filterStatus}
        onStatusChange={(value) => handleFilterChange(setFilterStatus, value)}
        filterPaymentStatus={filterPaymentStatus}
        onPaymentStatusChange={(value) =>
          handleFilterChange(setFilterPaymentStatus, value)
        }
        filterPaymentMethod={filterPaymentMethod}
        onPaymentMethodChange={(value) =>
          handleFilterChange(setFilterPaymentMethod, value)
        }
      />
      <HistoryTable
        orders={orders}
        isLoading={isLoading}
        meta={meta}
        onPageChange={setPage}
        getPaymentMethodLabel={getPaymentMethodLabel}
        getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
        getPaymentStatusLabel={getPaymentStatusLabel}
      />
    </div>
  );
}
