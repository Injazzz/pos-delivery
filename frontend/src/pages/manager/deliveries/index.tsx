import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deliveriesApi } from "@/api/deliveries";
import { useDebounce } from "@/hooks/useDebounce";
import { DeliveryStatsBar } from "./components/DeliveryStatsBar";
import { DeliveryTable } from "./components/DeliveryTable";
import { AssignCourierDialog } from "./components/AssignCourierDialog";
import { DeliveryDetailDialog } from "./components/DeliveryDetailDialog";
import type { Delivery } from "@/types/delivery";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manajemen Pengiriman</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor dan kelola semua pengiriman
        </p>
      </div>

      <DeliveryStatsBar summary={data?.summary} isLoading={isLoading} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Cari kode order..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {[
              { value: "all", label: "Semua Status" },
              { value: "pending", label: "Menunggu Kurir" },
              { value: "assigned", label: "Kurir Ditugaskan" },
              { value: "picked_up", label: "Diambil" },
              { value: "on_way", label: "Dalam Perjalanan" },
              { value: "delivered", label: "Terkirim" },
              { value: "failed", label: "Gagal" },
            ].map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-slate-300"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
