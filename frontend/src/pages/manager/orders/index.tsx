import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { ordersApi } from "@/api/orders";
import { useDebounce } from "@/hooks/useDebounce";
import type { Order } from "@/types/order";

import { OrderStatsBar } from "./components/OrderStatsBar";
import { OrderFilters } from "./components/OrderFilters";
import { OrderTable } from "./components/OrderTable";
import { OrderStatusDialog } from "./components/OrderStatusDialog";
import { ManagerOrderDetailDialog } from "./components/OrderDetailDialog";

export default function ManagerOrders() {
  // ── Filters ──────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debSearch = useDebounce(search, 400);

  // ── Dialog state ──────────────────────────────────────
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);

  // ── Query ─────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [
      "manager-orders",
      debSearch,
      status,
      orderType,
      dateFrom,
      dateTo,
      page,
    ],
    queryFn: () =>
      ordersApi
        .managerOrders({
          search: debSearch || undefined,
          status: status !== "all" ? status : undefined,
          order_type: orderType !== "all" ? orderType : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          per_page: 20,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-400" />
          Semua Pesanan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor dan kelola semua pesanan masuk
        </p>
      </div>

      {/* Stats */}
      <OrderStatsBar stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <OrderFilters
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        setStatus={(v) => {
          setStatus(v);
          setPage(1);
        }}
        orderType={orderType}
        setOrderType={(v) => {
          setOrderType(v);
          setPage(1);
        }}
        dateFrom={dateFrom}
        setDateFrom={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        dateTo={dateTo}
        setDateTo={(v) => {
          setDateTo(v);
          setPage(1);
        }}
      />

      {/* Table */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        meta={meta}
        onView={setViewOrder}
        onChangeStatus={setStatusOrder}
        onPageChange={setPage}
      />

      {/* Dialogs */}
      <ManagerOrderDetailDialog
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />

      <OrderStatusDialog
        order={statusOrder}
        onClose={() => setStatusOrder(null)}
      />
    </div>
  );
}
