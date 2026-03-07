import { UserPlus, Eye, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Delivery } from "@/types/delivery";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";

interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
}

interface Props {
  deliveries: Delivery[];
  isLoading: boolean;
  meta?: Meta;
  onAssign: (delivery: Delivery) => void;
  onView: (delivery: Delivery) => void;
  onPageChange: (page: number) => void;
}

export function DeliveryTable({
  deliveries,
  isLoading,
  meta,
  onAssign,
  onView,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr_120px] gap-3 px-4 py-2 text-xs text-slate-500 uppercase tracking-wider font-medium">
        <span>Order</span>
        <span>Alamat</span>
        <span>Kurir</span>
        <span>Status</span>
        <span className="text-right">Aksi</span>
      </div>

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 bg-slate-800 rounded-xl" />
        ))}

      {!isLoading && deliveries.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Tidak ada data pengiriman</p>
        </div>
      )}

      {!isLoading &&
        deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors"
          >
            {/* Mobile layout */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {delivery.order?.order_code}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {delivery.address}
                  </p>
                </div>
                <DeliveryStatusBadge status={delivery.delivery_status} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {delivery.courier?.name ?? (
                    <span className="text-amber-400 italic">
                      Belum ditugaskan
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  {!delivery.courier && (
                    <Button
                      size="sm"
                      className="h-7 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs"
                      onClick={() => onAssign(delivery)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" /> Assign
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                    onClick={() => onView(delivery)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr_120px] gap-3 items-center">
              <div>
                <p className="text-sm font-semibold text-white">
                  {delivery.order?.order_code}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {delivery.order?.customer}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {delivery.address}
                </p>
                {delivery.city && (
                  <p className="text-xs text-slate-600">{delivery.city}</p>
                )}
              </div>
              <div>
                {delivery.courier ? (
                  <div>
                    <p className="text-xs text-white">
                      {delivery.courier.name}
                    </p>
                    {delivery.courier.phone && (
                      <p className="text-xs text-slate-500">
                        {delivery.courier.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-amber-400 italic">
                    Belum ditugaskan
                  </span>
                )}
              </div>
              <DeliveryStatusBadge status={delivery.delivery_status} />
              <div className="flex items-center justify-end gap-1.5">
                {!delivery.courier && (
                  <Button
                    size="sm"
                    className="h-7 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs gap-1"
                    onClick={() => onAssign(delivery)}
                  >
                    <UserPlus className="w-3 h-3" /> Assign
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-slate-700 text-slate-400 hover:bg-slate-800"
                  onClick={() => onView(delivery)}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400 pt-2">
          <span className="text-xs">
            {meta.from}–{meta.to} dari {meta.total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-white">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
