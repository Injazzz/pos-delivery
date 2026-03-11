/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/api/payments";
import type { MidtransResult } from "@/types/payment";
import type { Order } from "@/types/order";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

export function CustomerPaymentDialog({
  order,
  open,
  onOpenChange,
  onPaymentSuccess,
}: Props) {
  const qc = useQueryClient();
  const snapPayTriggeredRef = useRef(false);

  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("Order not found");
      const response = await paymentsApi.customerInitiate(
        order.id,
        order.total_price,
        "midtrans",
      );
      return response.data.data as MidtransResult;
    },
    onSuccess: (snapData: MidtransResult) => {
      loadSnapAndPay(snapData);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Gagal memulai pembayaran");
      snapPayTriggeredRef.current = false;
    },
    retry: 0, // Disable auto-retry
  });

  // Load Snap.js script dynamically
  const loadSnapAndPay = (snapData: MidtransResult) => {
    // Prevent duplicate snap.pay() calls
    if (snapPayTriggeredRef.current) return;
    snapPayTriggeredRef.current = true;

    const existing = document.getElementById("midtrans-snap");
    if (existing && window.snap) {
      triggerSnapPay(snapData);
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = snapData.is_production
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", snapData.client_key);
    script.onload = () => triggerSnapPay(snapData);
    script.onerror = () => {
      toast.error("Gagal memuat Midtrans");
      snapPayTriggeredRef.current = false;
    };
    document.head.appendChild(script);
  };

  const triggerSnapPay = (snapData: MidtransResult) => {
    if (!window.snap) {
      toast.error("Midtrans tidak tersedia");
      snapPayTriggeredRef.current = false;
      return;
    }

    // Close dialog immediately when payment modal is about to open
    onOpenChange(false);

    // Small delay to ensure dialog closes first
    setTimeout(() => {
      window.snap.pay(snapData.snap_token, {
        onSuccess: () => {
          handlePaymentSuccess();
        },
        onPending: () => {
          toast.info("Pembayaran sedang diproses...");
        },
        onError: () => {
          handlePaymentError();
        },
        onClose: () => {
          snapPayTriggeredRef.current = false;
        },
      });
    }, 300);
  };

  const handlePaymentSuccess = () => {
    toast.success("Pembayaran berhasil!!");
    qc.invalidateQueries({ queryKey: ["customer-orders"] });
    onPaymentSuccess();
  };

  const handlePaymentError = () => {
    toast.error("Pembayaran gagal");
    snapPayTriggeredRef.current = false;
  };

  if (!order) return null;

  // Simple confirmation dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Nomor Pesanan</p>
            <p className="font-bold text-foreground text-lg">
              {order.order_code}
            </p>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Total Bayar</p>
            <p className="font-bold text-heart-500 text-2xl">
              {order.formatted_total}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              disabled={initiatePaymentMutation.isPending}
              onClick={() => initiatePaymentMutation.mutate()}
            >
              {initiatePaymentMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuka Midtrans...</span>
                </div>
              ) : (
                "Lanjutkan Pembayaran"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={initiatePaymentMutation.isPending}
            >
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
