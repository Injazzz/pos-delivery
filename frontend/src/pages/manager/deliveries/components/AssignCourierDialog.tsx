/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, Phone, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
      onClose();
      setSelected(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  return (
    <Dialog open={!!delivery} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Tugaskan Kurir</DialogTitle>
          <DialogDescription className="text-slate-400">
            Order #{delivery?.order?.order_code} · {delivery?.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (couriers ?? []).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bike className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Tidak ada kurir aktif tersedia</p>
            </div>
          ) : (
            (couriers ?? []).map((courier: Courier) => (
              <button
                key={courier.id}
                type="button"
                onClick={() => setSelected(courier.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  selected === courier.id
                    ? "bg-amber-500/10 border-amber-500 shadow-amber-500/10 shadow-lg"
                    : "bg-slate-800 border-slate-700 hover:border-slate-600",
                )}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {courier.avatar_url ? (
                    <img
                      src={courier.avatar_url}
                      alt={courier.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {courier.name[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {courier.name}
                  </p>
                  {courier.phone && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {courier.phone}
                    </div>
                  )}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] shrink-0",
                    (courier.active_deliveries ?? 0) === 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30",
                  )}
                >
                  {(courier.active_deliveries ?? 0) === 0
                    ? "Tersedia"
                    : `${courier.active_deliveries} aktif`}
                </Badge>

                {selected === courier.id && (
                  <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            disabled={!selected || mutation.isPending}
            onClick={() => selected && mutation.mutate(selected)}
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Tugaskan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
