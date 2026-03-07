/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { paymentsApi } from "@/api/payments";
import { ordersApi } from "@/api/orders";
import type { ReceiptData } from "@/types/payment";

export function usePayment(orderId: number) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const orderQuery = useQuery({
    queryKey: ["cashier-order-detail", orderId],
    queryFn: () =>
      ordersApi
        .cashierOrders({ per_page: 1 })
        .then(() => ordersApi.cashierReceipt(orderId))
        .then((r) => r.data.data),
    enabled: !!orderId,
  });

  const onPaymentSuccess = (data: ReceiptData) => {
    setReceiptData(data);
    setShowReceipt(true);
    qc.invalidateQueries({ queryKey: ["cashier-orders-dashboard"] });
    toast.success("Pembayaran berhasil!");
  };

  const cashMutation = useMutation({
    mutationFn: (cashReceived: number) =>
      paymentsApi.cashPayment(orderId, cashReceived),
    onSuccess: (res) => onPaymentSuccess(res.data.receipt_data),
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const dpMutation = useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: string }) =>
      paymentsApi.downpayment(orderId, amount, method),
    onSuccess: () => {
      toast.success("Downpayment dicatat.");
      navigate("/cashier/dashboard");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const midtransMutation = useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: string }) =>
      paymentsApi.initiateMidtrans(orderId, amount, method),
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  return {
    orderQuery,
    receiptData,
    showReceipt,
    setShowReceipt,
    cashMutation,
    dpMutation,
    midtransMutation,
  };
}
