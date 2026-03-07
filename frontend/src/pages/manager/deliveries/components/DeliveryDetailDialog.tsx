/* eslint-disable @typescript-eslint/no-explicit-any */

import { MapPin, Phone, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DeliveryStatusBadge } from "@/components/shared/DeliveryStatusBadge";
import type { Delivery } from "@/types/delivery";

interface Props {
  delivery: Delivery | null;
  onClose: () => void;
}

export function DeliveryDetailDialog({ delivery, onClose }: Props) {
  if (!delivery) return null;

  return (
    <Dialog open={!!delivery} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Detail Pengiriman</span>
            <DeliveryStatusBadge status={delivery.delivery_status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kode Order", value: delivery.order?.order_code ?? "-" },
              { label: "Total", value: delivery.order?.total ?? "-" },
              {
                label: "Pelanggan",
                value: delivery.order?.customer ?? "Walk-in",
              },
              {
                label: "Ongkir",
                value: `Rp ${delivery.delivery_fee.toLocaleString("id-ID")}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-white font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <Separator className="bg-slate-800" />

          {/* Alamat */}
          <div className="flex gap-3">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white">{delivery.address}</p>
              {delivery.city && (
                <p className="text-xs text-slate-500 mt-0.5">{delivery.city}</p>
              )}
              {delivery.delivery_notes && (
                <p className="text-xs text-slate-500 italic mt-1">
                  Catatan: {delivery.delivery_notes}
                </p>
              )}
            </div>
          </div>

          {/* Kurir info */}
          {delivery.courier && (
            <>
              <Separator className="bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {delivery.courier.avatar_url ? (
                    <img
                      src={delivery.courier.avatar_url}
                      alt={delivery.courier.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {delivery.courier.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {delivery.courier.name}
                  </p>
                  {delivery.courier.phone && (
                    <a
                      href={`tel:${delivery.courier.phone}`}
                      className="text-xs text-blue-400 flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3" /> {delivery.courier.phone}
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator className="bg-slate-800" />
          <div className="space-y-2 text-xs">
            <p className="text-slate-500 uppercase tracking-wider font-medium">
              Timeline
            </p>
            {[
              {
                label: "Dibuat",
                value: new Date(delivery.created_at).toLocaleString("id-ID"),
              },
              delivery.picked_up_at && {
                label: "Diambil kurir",
                value: new Date(delivery.picked_up_at).toLocaleString("id-ID"),
              },
              delivery.delivered_at && {
                label: "Terkirim",
                value: new Date(delivery.delivered_at).toLocaleString("id-ID"),
              },
            ]
              .filter(Boolean)
              .map((row: any) => (
                <div
                  key={row.label}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{row.label}:</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
          </div>

          {/* Proof photo */}
          {delivery.proof_image_url && (
            <>
              <Separator className="bg-slate-800" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                  Foto Bukti Pengiriman
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={delivery.proof_image_url}
                    alt="Bukti pengiriman"
                    className="w-full max-h-64 object-cover"
                  />
                </div>
                {delivery.proof_image_timestamp && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(delivery.proof_image_timestamp).toLocaleString(
                      "id-ID",
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
