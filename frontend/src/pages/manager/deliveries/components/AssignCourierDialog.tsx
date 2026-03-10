/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, Phone, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { deliveriesApi } from "@/api/deliveries";
import type { Courier, Delivery } from "@/types/delivery";
import { useState } from "react";

interface Props {
  delivery: Delivery | null;
  onClose: () => void;
}

export function AssignCourierDialog({ delivery, onClose }: Props) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);

  const { data: couriers, isLoading } = useQuery({
    queryKey: ["available-couriers"],
    queryFn: () =>
      deliveriesApi.getAvailableCouriers().then((r) => r.data.data),
    enabled: !!delivery,
  });

  const mutation = useMutation({
    mutationFn: (courierId: number) =>
      deliveriesApi.assignCourier(delivery!.id, courierId),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["manager-deliveries"] });
      handleClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const availableCouriers =
    couriers?.filter((c: Courier) => (c.active_deliveries ?? 0) < 3) || [];

  return (
    <Dialog open={!!delivery} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glow-500/20 flex items-center justify-center">
              <Bike className="w-5 h-5 text-glow-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Tugaskan Kurir
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Pilih kurir untuk pengiriman ini
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Delivery Info */}
        {delivery && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">
                Alamat Pengiriman:
              </span>
            </div>
            <p className="text-sm text-foreground pl-6">{delivery.address}</p>
            <p className="text-xs text-muted-foreground pl-6 mt-1">
              Order #{delivery.order?.order_code}
            </p>
          </div>
        )}

        <div className="space-y-3 py-2 max-h-100 overflow-y-auto pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : availableCouriers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Bike className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Tidak ada kurir tersedia
              </p>
              <p className="text-xs text-muted-foreground">
                Semua kurir sedang bertugas atau offline
              </p>
            </div>
          ) : (
            availableCouriers.map((courier: Courier) => {
              const isSelected = selected === courier.id;
              const activeDeliveries = courier.active_deliveries ?? 0;
              const isAvailable = activeDeliveries === 0;

              return (
                <button
                  key={courier.id}
                  type="button"
                  onClick={() => setSelected(courier.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                    isSelected
                      ? "bg-heart-500/10 border-heart-500 shadow-lg shadow-heart-500/10"
                      : "bg-card border-border hover:border-heart-500/50 hover:bg-muted/50",
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 shrink-0 border-2 border-border">
                    <AvatarImage src={courier.avatar_url} />
                    <AvatarFallback
                      className={cn(
                        "text-white font-bold",
                        isAvailable ? "bg-emerald-500" : "bg-glow-500",
                      )}
                    >
                      {courier.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {courier.name}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-heart-500 shrink-0" />
                      )}
                    </div>

                    {courier.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{courier.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          isAvailable
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-glow-500/10 text-glow-500 border-glow-500/30",
                        )}
                      >
                        {isAvailable
                          ? "Tersedia"
                          : `${activeDeliveries} pengiriman aktif`}
                      </Badge>

                      {activeDeliveries > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {Array.from({ length: activeDeliveries }).map(
                              (_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-glow-500/50 border border-background"
                                />
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            className="flex-1 bg-heart-500 hover:bg-heart-600 text-white font-semibold transition-all"
            disabled={!selected || mutation.isPending}
            onClick={() => selected && mutation.mutate(selected)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menugaskan...
              </>
            ) : (
              "Tugaskan Kurir"
            )}
          </Button>
        </div>

        {/* Info footer */}
        <p className="text-[10px] text-center text-muted-foreground">
          Kurir dapat menangani maksimal 3 pengiriman sekaligus
        </p>
      </DialogContent>
    </Dialog>
  );
}
