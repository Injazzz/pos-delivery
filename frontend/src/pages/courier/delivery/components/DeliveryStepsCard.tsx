/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deliveriesApi } from "@/api/deliveries";
import type { Delivery, DeliveryStatus } from "@/types/delivery";

const STEPS: Array<{
  status: DeliveryStatus;
  label: string;
  desc: string;
  action: string;
  next: DeliveryStatus;
}> = [
  {
    status: "assigned",
    label: "Siap Jemput",
    desc: "Ambil pesanan dari restoran",
    action: "Konfirmasi Pengambilan",
    next: "picked_up",
  },
  {
    status: "picked_up",
    label: "Pesanan Diambil",
    desc: "Mulai perjalanan ke pelanggan",
    action: "Mulai Antar",
    next: "on_way",
  },
  {
    status: "on_way",
    label: "Dalam Perjalanan",
    desc: "Upload foto saat tiba",
    action: "Upload Foto Bukti",
    next: "delivered",
  },
];

const STATUS_ORDER: DeliveryStatus[] = [
  "assigned",
  "picked_up",
  "on_way",
  "delivered",
];

interface Props {
  delivery: Delivery;
  onUploadProof: () => void;
}

export function DeliveryStepsCard({ delivery, onUploadProof }: Props) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: string) =>
      deliveriesApi.updateStatus(delivery.id, status),
    onSuccess: () => {
      toast.success("Status diperbarui.");
      qc.invalidateQueries({ queryKey: ["courier-deliveries"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const currentIdx = STATUS_ORDER.indexOf(delivery.delivery_status);
  const currentStep = STEPS.find((s) => s.status === delivery.delivery_status);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Progress Pengiriman
      </p>

      {/* Steps */}
      <div className="space-y-1">
        {STATUS_ORDER.filter((s) => s !== "failed").map((status, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;

          const LABELS: Record<DeliveryStatus, string> = {
            assigned: "Ambil Pesanan",
            picked_up: "Dalam Perjalanan",
            on_way: "Hampir Tiba",
            delivered: "Terkirim",
            pending: "Menunggu",
            failed: "Gagal",
          };

          return (
            <div key={status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                    isDone
                      ? "bg-emerald-500"
                      : isCurrent
                        ? "bg-accent ring-2 ring-accent/30"
                        : "bg-muted border border-border",
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-3 h-3",
                        isCurrent
                          ? "text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                </div>
                {i < STATUS_ORDER.length - 2 && (
                  <div
                    className={cn(
                      "w-0.5 h-6 mt-1",
                      isDone ? "bg-emerald-500/40" : "bg-muted",
                    )}
                  />
                )}
              </div>
              <div className="pb-4">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDone || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {LABELS[status]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action button */}
      {currentStep && delivery.delivery_status !== "delivered" && (
        <div className="pt-2">
          {delivery.delivery_status === "on_way" ? (
            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
              onClick={onUploadProof}
            >
              📷 Upload Foto Bukti Tiba
            </Button>
          ) : (
            <Button
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(currentStep.next)}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                </>
              ) : (
                currentStep.action
              )}
            </Button>
          )}
        </div>
      )}

      {delivery.delivery_status === "delivered" && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-400">
            Pengiriman selesai!
          </p>
        </div>
      )}
    </div>
  );
}
