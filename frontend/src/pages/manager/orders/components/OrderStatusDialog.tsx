/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ordersApi } from "@/api/orders";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import type { Order, OrderStatus } from "@/types/order";

const ALL_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "cooking", label: "Dimasak" },
  { value: "ready", label: "Siap" },
  { value: "on_delivery", label: "Dikirim" },
  { value: "delivered", label: "Diterima" },
  { value: "cancelled", label: "Dibatalkan" },
];

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderStatusDialog({ order, onClose }: Props) {
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      ordersApi.managerUpdateStatus(
        order!.id,
        newStatus as string,
        reason || undefined,
      ),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["manager-orders"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal mengubah status."),
  });

  const handleClose = () => {
    setNewStatus("");
    setReason("");
    onClose();
  };

  const availableStatuses = ALL_STATUSES.filter(
    (s) => s.value !== order?.status,
  );

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Ubah Status Pesanan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Pesanan{" "}
            <span className="text-white font-medium">{order.order_code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status saat ini */}
          <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2.5">
            <span className="text-xs text-slate-500">Status saat ini</span>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Pilih status baru */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Status Baru</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as OrderStatus)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
                <SelectValue placeholder="Pilih status baru..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {availableStatuses.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="text-slate-300"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alasan (opsional, wajib jika cancel) */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">
              Alasan{newStatus === "cancelled" ? " (wajib)" : " (opsional)"}
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan perubahan status..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={handleClose}
          >
            Batal
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            disabled={
              !newStatus ||
              mutation.isPending ||
              (newStatus === "cancelled" && !reason)
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Menyimpan..." : "Ubah Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
