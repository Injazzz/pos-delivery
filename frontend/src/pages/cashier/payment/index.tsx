/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { PaymentSummary } from "./components/PaymentSummary";
import { CashPaymentForm } from "./components/CashPaymentForm";
import { DownpaymentForm } from "./components/DownpaymentForm";
import { MidtransPayment } from "./components/MidtransPayment";
import { ReceiptPrinter } from "./components/ReceiptPrinter";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentMethod } from "@/types/payment";
import type { MidtransResult, ReceiptData } from "@/types/payment";

export default function CashierPayment() {
  const { id: orderId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const id = Number(orderId);

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [snapData, setSnapData] = useState<MidtransResult | null>(null);
  const [snapPaymentType, setSnapPaymentType] = useState<
    "full" | "dp" | "remaining"
  >("full");

  // Re-fetch order detail properly
  const { data: fullOrder, isLoading } = useQuery({
    queryKey: ["cashier-order-full", id],
    queryFn: () =>
      ordersApi
        .cashierOrders({ per_page: 100 })
        .then((r) => r.data.data.find((o: any) => o.id === id)),
    enabled: !!id,
  });

  // Cash
  const cashMutation = useMutation({
    mutationFn: (cash: number) => paymentsApi.cashPayment(id, cash),
    onSuccess: (res) => setReceiptData(res.data.receipt_data),
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  // Downpayment
  const dpMutation = useMutation({
    mutationFn: ({ amount, m }: { amount: number; m: string }) =>
      paymentsApi.downpayment(id, amount, m),
    onSuccess: () => {
      toast.success("Downpayment dicatat.");
      qc.invalidateQueries({ queryKey: ["cashier-order-full", id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  // Remaining Payment (Pelunasan)
  const remainingMutation = useMutation({
    mutationFn: ({ amount, m }: { amount: number; m: string }) =>
      paymentsApi.remaining(fullOrder?.payment?.id as number, amount, m),
    onSuccess: (res) => {
      setReceiptData(res.data.receipt_data);
      qc.invalidateQueries({ queryKey: ["cashier-order-full", id] });
      toast.success("Pelunasan berhasil dicatat!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  // Midtrans
  const midtransMutation = useMutation({
    mutationFn: ({ amount, m }: { amount: number; m: string }) =>
      paymentsApi.initiateMidtrans(id, amount, m),
    onSuccess: (res) => {
      setSnapData(res.data.data);
      setSnapPaymentType("full");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  // Downpayment with Midtrans (untuk DP)
  const dpMidtransMutation = useMutation({
    mutationFn: ({ amount, m }: { amount: number; m: string }) =>
      paymentsApi.initiateMidtrans(id, amount, m),
    onSuccess: (res) => {
      setSnapData(res.data.data);
      setSnapPaymentType("dp");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  // Remaining payment with Midtrans (untuk Pelunasan)
  const remainingMidtransMutation = useMutation({
    mutationFn: ({ amount, m }: { amount: number; m: string }) =>
      paymentsApi.initiateMidtrans(id, amount, m),
    onSuccess: (res) => {
      setSnapData(res.data.data);
      setSnapPaymentType("remaining");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (isLoading || !fullOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-heart-500" />
      </div>
    );
  }

  // Payment already completed (status = 'paid')
  const paymentStatus = fullOrder.payment?.status;
  const isPaymentComplete = paymentStatus === "paid";
  const isPartialPayment = paymentStatus === "partial";

  // Show receipt when payment succeeds
  if (receiptData) {
    return (
      <div className="max-w-2xl mx-auto">
        <ReceiptPrinter
          data={receiptData}
          onDone={() => setReceiptData(null)}
        />
      </div>
    );
  }

  // Show read-only state if payment is already completed
  if (isPaymentComplete) {
    // For DP payments, show both the DP method and the actual payment method
    const methodLabel = (method?: string) => {
      const map: Record<string, string> = {
        cash: "Tunai",
        transfer: "Transfer Bank",
        qris: "QRIS",
        midtrans: "Midtrans",
        downpayment: "Uang Muka (DP)",
      };
      return map[method || "cash"] || method || "Tidak diketahui";
    };

    const isDownpaymentMethod = fullOrder.payment?.method === "downpayment";

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pembayaran sudah selesai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left: Read-only payment info */}
          <div className="space-y-5">
            <div className="bg-card border border-emerald-500/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <p className="text-sm font-semibold text-foreground">
                  Status Pembayaran:{" "}
                  <span className="text-emerald-500">LUNAS</span>
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {isDownpaymentMethod ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Metode Pembayaran:
                      </span>
                      <span className="text-glow-500 font-semibold">
                        {methodLabel(fullOrder.payment?.method)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        DP Awal Dibayar:
                      </span>
                      <span className="text-heart-500 font-bold">
                        Rp{" "}
                        {(fullOrder.payment?.amount_paid || 0).toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Pelunasan Dibayar:
                      </span>
                      <span className="text-heart-500 font-bold">
                        Rp{" "}
                        {(
                          (fullOrder.payment?.amount || 0) -
                          (fullOrder.payment?.amount_paid || 0)
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="text-foreground font-medium">
                        Total Pembayaran:
                      </span>
                      <span className="text-emerald-500 font-bold">
                        Rp{" "}
                        {(fullOrder.payment?.amount || 0).toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Metode Pembayaran:
                      </span>
                      <span className="text-foreground font-semibold">
                        {methodLabel(fullOrder.payment?.method)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Jumlah Dibayar:
                      </span>
                      <span className="text-heart-500 font-bold">
                        Rp{" "}
                        {(fullOrder.payment?.amount || 0).toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">
                    Tanggal Pembayaran:
                  </span>
                  <span className="text-foreground font-semibold">
                    {fullOrder.payment?.paid_at
                      ? new Date(fullOrder.payment.paid_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:sticky lg:top-6 h-fit">
            <PaymentSummary order={fullOrder} />
          </div>
        </div>
      </div>
    );
  }

  const total =
    fullOrder.payment?.status === "partial"
      ? fullOrder.payment.amount_remaining
      : fullOrder.total_price;

  // For partial payment, only show downpayment remaining form
  const showDownpaymentRemaining =
    isPartialPayment && fullOrder.payment?.method === "downpayment";

  const handleMidtransInit = () => {
    const m = method === "downpayment" ? "midtrans" : (method ?? "midtrans");
    midtransMutation.mutate({ amount: total, m });
  };

  // Handle downpayment submission (DP awal)
  const handleDownpaymentSubmit = (amount: number, m: string) => {
    if (m === "midtrans") {
      // Untuk midtrans, initiate link pembayaran
      dpMidtransMutation.mutate({ amount, m });
    } else {
      // Untuk cash/transfer/qris, proses langsung
      dpMutation.mutate({ amount, m });
    }
  };

  // Handle remaining payment submission (Pelunasan)
  const handleRemainingSubmit = (amount: number, m: string) => {
    if (m === "midtrans") {
      // Untuk midtrans, initiate link pembayaran
      remainingMidtransMutation.mutate({ amount, m });
    } else {
      // Untuk cash/transfer/qris, proses langsung
      remainingMutation.mutate({ amount, m });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {showDownpaymentRemaining
            ? "Selesaikan pembayaran sisa DP"
            : "Pilih metode dan proses pembayaran"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: Method + Form */}
        <div className="space-y-5">
          {/* Only show method selector if NOT doing pelunasan */}
          {!showDownpaymentRemaining && (
            <div className="">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Metode Pembayaran
              </p>
              <PaymentMethodSelector
                selected={method}
                onSelect={setMethod}
                disabled={isPartialPayment && method !== "downpayment"}
              />
            </div>
          )}

          {/* Pelunasan Form - Auto show for partial DP */}
          {showDownpaymentRemaining && (
            <div className="">
              <div className="space-y-3 mb-4">
                <p className="text-sm font-semibold text-glow-500">
                  Pelunasan Uang Muka (DP)
                </p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      DP Sebelumnya:
                    </span>
                    <span className="text-foreground font-semibold">
                      Rp{" "}
                      {(fullOrder.payment?.amount_paid || 0).toLocaleString(
                        "id-ID",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sisa Pembayaran:
                    </span>
                    <span className="text-glow-500 font-bold">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <DownpaymentForm
                total={total}
                isLoading={
                  remainingMutation.isPending ||
                  remainingMidtransMutation.isPending
                }
                onSubmit={handleRemainingSubmit}
                isPartialPayment={true}
                snapData={
                  snapPaymentType === "remaining" ? snapData : undefined
                }
                onMidtransSuccess={() => {
                  toast.success(
                    "Pelunasan berhasil! Menunggu konfirmasi webhook.",
                  );
                  qc.invalidateQueries({
                    queryKey: ["cashier-order-full", id],
                  });
                }}
                onMidtransError={() => {
                  toast.error("Pembayaran gagal.");
                  setSnapData(null);
                }}
                onMidtransPending={() => {
                  toast.info("Pembayaran pending. Akan dikonfirmasi otomatis.");
                  qc.invalidateQueries({
                    queryKey: ["cashier-order-full", id],
                  });
                }}
              />
            </div>
          )}

          {/* Default form when method is selected */}
          {method && !showDownpaymentRemaining && (
            <div className="">
              {method === "cash" && (
                <CashPaymentForm
                  total={total}
                  isLoading={cashMutation.isPending}
                  onSubmit={(cash) => cashMutation.mutate(cash)}
                />
              )}

              {method === "downpayment" && (
                <DownpaymentForm
                  total={total}
                  isLoading={
                    dpMutation.isPending || dpMidtransMutation.isPending
                  }
                  onSubmit={handleDownpaymentSubmit}
                  isPartialPayment={false}
                  snapData={snapPaymentType === "dp" ? snapData : undefined}
                  onMidtransSuccess={() => {
                    // Reset form after successful Midtrans payment
                    setReceiptData(null);
                  }}
                  onMidtransError={() => {
                    setSnapData(null);
                  }}
                  onMidtransPending={() => {
                    // Optional: handle pending state
                  }}
                />
              )}

              {(method === "midtrans" ||
                method === "qris" ||
                method === "transfer") && (
                <div className="space-y-4">
                  {!snapData ? (
                    <div className="space-y-3">
                      {method === "transfer" && (
                        <div className="bg-card border border-border rounded-xl p-4 text-sm space-y-2">
                          <p className="text-foreground font-semibold">
                            Info Transfer Bank
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>
                              Bank BCA —{" "}
                              <span className="text-foreground font-mono">
                                1234567890
                              </span>
                            </p>
                            <p>
                              A/N:{" "}
                              <span className="text-foreground">
                                PT Nama Toko
                              </span>
                            </p>
                            <p className="text-glow-500 mt-2 text-xs">
                              ⚠️ Konfirmasi transfer via Midtrans atau upload
                              bukti ke kasir
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        className="w-full h-12 bg-heart-500 hover:bg-heart-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        disabled={midtransMutation.isPending}
                        onClick={handleMidtransInit}
                      >
                        {midtransMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Memproses...
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4" /> Buat Link Pembayaran
                          </div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <MidtransPayment
                      snapData={snapData}
                      onSuccess={() => {
                        toast.success("Pembayaran berhasil!");
                        // Refresh data berdasarkan tipe pembayaran
                        if (
                          snapPaymentType === "dp" ||
                          snapPaymentType === "remaining"
                        ) {
                          qc.invalidateQueries({
                            queryKey: ["cashier-order-full", id],
                          });
                          // Untuk DP/remaining yang berhasil di midtrans, tunggu webhook
                          // Jangan close snap dialog sekarang
                        } else {
                          // Full payment
                          qc.invalidateQueries({
                            queryKey: ["cashier-order-full", id],
                          });
                        }
                      }}
                      onPending={() => {
                        toast.info(
                          "Pembayaran pending. Akan dikonfirmasi otomatis.",
                        );
                        // Refresh data
                        qc.invalidateQueries({
                          queryKey: ["cashier-order-full", id],
                        });
                      }}
                      onError={() => {
                        toast.error("Pembayaran gagal.");
                        setSnapData(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="lg:sticky lg:top-6 h-fit">
          <PaymentSummary order={fullOrder} />
        </div>
      </div>
    </div>
  );
}
