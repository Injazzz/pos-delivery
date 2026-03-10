/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  MapPin,
  Phone,
  Clock,
  Package,
  User,
  Bike,
  Camera,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Delivery } from "@/types/delivery";

interface Props {
  delivery: Delivery | null;
  onClose: () => void;
}

export function DeliveryDetailDialog({ delivery, onClose }: Props) {
  if (!delivery) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseRupiah = (rupiah: string) => {
    if (!rupiah) return 0;
    return parseInt(rupiah.replace(/[^0-9]/g, "")) || 0;
  };

  const totalBayar = delivery.order?.total
    ? parseRupiah(delivery.order.total) + delivery.delivery_fee
    : delivery.delivery_fee;

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={!!delivery} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto pt-10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-glow-500/20 flex items-center justify-center">
                <Bike className="w-5 h-5 text-glow-500" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg">
                  Detail Pengiriman
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  #{delivery.order?.order_code}
                </p>
              </div>
            </div>
            <DeliveryStatusBadge status={delivery.delivery_status} />
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Order Summary Card */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Ringkasan Pesanan
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Total Pesanan",
                  value: delivery.order?.total ? delivery.order.total : "-",
                  color: "text-heart-500",
                },
                {
                  label: "Ongkos Kirim",
                  value: formatCurrency(delivery.delivery_fee),
                  color: "text-glow-500",
                },
                {
                  label: "Total Bayar",
                  value: formatCurrency(totalBayar),
                  color: "text-emerald-500",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-muted rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className={cn("text-sm font-bold mt-0.5", color)}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-heart-500/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-heart-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                {delivery.order?.customer ?? "Walk-in"}
              </p>
              {delivery.order?.customer_phone && (
                <a
                  href={`tel:${delivery.order.customer_phone}`}
                  className="text-xs text-muted-foreground hover:text-heart-500 flex items-center gap-1 mt-0.5"
                >
                  <Phone className="w-3 h-3" />
                  {delivery.order.customer_phone}
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-earth-500/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-earth-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">{delivery.address}</p>
              {delivery.city && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {delivery.city}
                </p>
              )}
              {delivery.delivery_notes && (
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] bg-muted text-muted-foreground border-border"
                >
                  <span className="flex items-center gap-1">
                    <span>Catatan: {delivery.delivery_notes}</span>
                  </span>
                </Badge>
              )}
            </div>
          </div>

          {/* Courier Info */}
          {delivery.courier && (
            <>
              <Separator className="bg-border" />
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 border-2 border-border">
                  <AvatarImage src={delivery.courier.avatar_url} />
                  <AvatarFallback className="bg-glow-500/20 text-glow-500">
                    {delivery.courier.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {delivery.courier.name}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    Kurir Pengiriman
                  </p>
                  {delivery.courier.phone && (
                    <a
                      href={`tel:${delivery.courier.phone}`}
                      className="text-xs text-heart-500 hover:text-heart-600 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {delivery.courier.phone}
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Timeline Pengiriman
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: Calendar,
                  label: "Dibuat",
                  time: delivery.created_at,
                  color: "text-muted-foreground",
                },
                delivery.picked_up_at && {
                  icon: Bike,
                  label: "Diambil kurir",
                  time: delivery.picked_up_at,
                  color: "text-glow-500",
                },
                delivery.delivered_at && {
                  icon: CheckCircle,
                  label: "Terkirim",
                  time: delivery.delivered_at,
                  color: "text-emerald-500",
                },
              ]
                .filter(Boolean)
                .map((item: any, index, array) => {
                  const Icon = item.icon;
                  const isLast = index === array.length - 1;

                  return (
                    <div key={item.label} className="flex gap-3">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            item.color.replace("text", "bg") + "/10",
                          )}
                        >
                          <Icon className={cn("w-3 h-3", item.color)} />
                        </div>
                        {!isLast && (
                          <div className="absolute top-6 left-3 w-px h-8 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(item.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Proof Photo */}
          {delivery.proof_image_url && (
            <>
              <Separator className="bg-border" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Bukti Pengiriman
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={delivery.proof_image_url}
                    alt="Bukti pengiriman"
                    className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {delivery.proof_image_timestamp && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDateTime(delivery.proof_image_timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CheckCircle icon needs to be imported
import { CheckCircle } from "lucide-react";
