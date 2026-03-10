import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi } from "@/api/deliveries";
import { useDebounce } from "@/hooks/useDebounce";
import { DeliveryStatsBar } from "./components/DeliveryStatsBar";
import { DeliveryTable } from "./components/DeliveryTable";
import { AssignCourierDialog } from "./components/AssignCourierDialog";
import { DeliveryDetailDialog } from "./components/DeliveryDetailDialog";
import type { Delivery } from "@/types/delivery";
import { DeliveryFilters } from "./components/DeliveryFilters";
import { Truck } from "lucide-react";

export default function ManagerDeliveriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [assignTarget, setAssignTarget] = useState<Delivery | null>(null);
  const [viewTarget, setViewTarget] = useState<Delivery | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["manager-deliveries", debouncedSearch, statusFilter, page],
    queryFn: () =>
      deliveriesApi
        .managerList({
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          per_page: 15,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });

  const handlePageReset = () => setPage(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Truck className="w-6 h-6 text-amber-400" />
          Manajemen Pengiriman
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor dan kelola semua pengiriman
        </p>
      </div>

      <DeliveryStatsBar summary={data?.summary} isLoading={isLoading} />

      <DeliveryFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onPageReset={handlePageReset}
      />

      <DeliveryTable
        deliveries={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onAssign={setAssignTarget}
        onView={setViewTarget}
        onPageChange={setPage}
      />

      <AssignCourierDialog
        delivery={assignTarget}
        onClose={() => setAssignTarget(null)}
      />

      <DeliveryDetailDialog
        delivery={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
