import {
  UserPlus,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Delivery } from "@/types/delivery";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { cn } from "@/lib/utils";

interface Meta {
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  per_page: number;
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
  const perPage = meta?.per_page || 20;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium">
                Order
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Alamat
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Kurir
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading Skeleton */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24 bg-muted" />
                      <Skeleton className="h-3 w-16 bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                      <Skeleton className="h-4 w-20 bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 bg-muted ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Data Rows */}
            {!isLoading &&
              deliveries.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className="border-border hover:bg-muted/50 transition-colors group"
                >
                  {/* Order Info */}
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {delivery.order?.order_code}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {delivery.order?.customer}
                      </p>
                    </div>
                  </TableCell>

                  {/* Address */}
                  <TableCell>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground line-clamp-1">
                          {delivery.address}
                        </p>
                        {delivery.city && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {delivery.city}
                          </p>
                        )}
                        {delivery.delivery_notes && (
                          <p className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">
                            Catatan: {delivery.delivery_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Courier */}
                  <TableCell>
                    {delivery.courier ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={delivery.courier.avatar_url} />
                          <AvatarFallback className="bg-heart-500/20 text-heart-500 text-xs">
                            {delivery.courier.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {delivery.courier.name}
                          </p>
                          {delivery.courier.phone && (
                            <a
                              href={`tel:${delivery.courier.phone}`}
                              className="text-[10px] text-muted-foreground hover:text-heart-500 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {delivery.courier.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-glow-500/10 text-glow-500 border-glow-500/30 text-[10px]"
                      >
                        Belum ditugaskan
                      </Badge>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <DeliveryStatusBadge status={delivery.delivery_status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!delivery.courier && (
                        <Button
                          size="sm"
                          className="h-8 px-3 bg-heart-500 hover:bg-heart-600 text-white text-xs gap-1"
                          onClick={() => onAssign(delivery)}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onView(delivery)}
                        title="Lihat detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty State */}
            {!isLoading && deliveries.length === 0 && (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Tidak ada data pengiriman
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Belum ada pengiriman yang perlu ditangani
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground order-2 sm:order-1">
            Menampilkan {meta.from}–{meta.to} dari {meta.total} pengiriman
            <span className="text-[10px] ml-1">({perPage} per halaman)</span>
          </span>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs px-3 py-1 bg-muted rounded-md border border-border text-foreground">
              {meta.current_page} / {meta.last_page}
            </span>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-8 h-8 bg-background border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-30 disabled:hover:bg-background",
                "transition-all",
              )}
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
