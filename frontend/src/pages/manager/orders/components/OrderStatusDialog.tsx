/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle, ArrowRight, History } from "lucide-react";
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
import { cn } from "@/lib/utils";

const ALL_STATUSES: Array<{
  value: OrderStatus;
  label: string;
  color: string;
}> = [
  { value: "pending", label: "Menunggu", color: "text-glow-500" },
  { value: "processing", label: "Diproses", color: "text-heart-400" },
  { value: "cooking", label: "Dimasak", color: "text-earth-500" },
  { value: "ready", label: "Siap", color: "text-emerald-500" },
  { value: "on_delivery", label: "Dikirim", color: "text-glow-500" },
  { value: "delivered", label: "Diterima", color: "text-emerald-500" },
  { value: "cancelled", label: "Dibatalkan", color: "text-destructive" },
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
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-heart-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Ubah Status Pesanan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Pesanan{" "}
                <span className="font-semibold text-foreground">
                  {order.order_code}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Status saat ini */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status Saat Ini</p>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Pilih status baru */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Status Baru
            </Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as OrderStatus)}
            >
              <SelectTrigger
                className={cn(
                  "bg-background border-border text-foreground hover:bg-muted/50",
                  "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
                  newStatus && "border-heart-500/50",
                )}
              >
                <SelectValue placeholder="Pilih status baru..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableStatuses.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className={cn(
                      "focus:bg-muted focus:text-foreground",
                      s.color,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          s.color.replace("text", "bg"),
                        )}
                      />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alasan (opsional, wajib jika cancel) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">
                Alasan
              </Label>
              {newStatus === "cancelled" && (
                <div className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Wajib diisi</span>
                </div>
              )}
            </div>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                newStatus === "cancelled"
                  ? "Alasan pembatalan..."
                  : "Alasan perubahan status (opsional)"
              }
              rows={3}
              className={cn(
                "bg-background border-border text-foreground placeholder:text-muted-foreground",
                "focus:border-heart-500 focus:ring-heart-500/20 transition-all resize-none",
                newStatus === "cancelled" &&
                  !reason &&
                  "border-destructive focus:border-destructive",
              )}
            />
            {newStatus === "cancelled" && !reason && (
              <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-destructive" />
                Alasan wajib diisi untuk pembatalan
              </p>
            )}
          </div>

          {/* Info tambahan */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground">
                Perubahan status akan dicatat dalam riwayat pesanan dan
                {newStatus === "cancelled"
                  ? " akan membatalkan pesanan secara permanen."
                  : " akan memproses pesanan ke tahap berikutnya."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            className={cn(
              "transition-all min-w-30",
              newStatus === "cancelled"
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-heart-500 hover:bg-heart-600 text-white",
            )}
            disabled={
              !newStatus ||
              mutation.isPending ||
              (newStatus === "cancelled" && !reason.trim())
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending
              ? "Menyimpan..."
              : newStatus === "cancelled"
                ? "Batalkan Pesanan"
                : "Ubah Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
