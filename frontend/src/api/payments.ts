import apiClient from "@/lib/axios";
import type { MidtransResult, Payment, ReceiptData } from "@/types/payment";

export const paymentsApi = {
  // Cashier
  cashPayment: (orderId: number, cashReceived: number) =>
    apiClient.post<{
      message: string;
      data: Payment;
      receipt_data: ReceiptData;
    }>("/cashier/payments/cash", {
      order_id: orderId,
      cash_received: cashReceived,
    }),

  downpayment: (orderId: number, dpAmount: number, method: string) =>
    apiClient.post<{ message: string; data: Payment }>(
      "/cashier/payments/downpayment",
      { order_id: orderId, dp_amount: dpAmount, method },
    ),

  remaining: (paymentId: number, amount: number, method: string) =>
    apiClient.post<{
      message: string;
      data: Payment;
      receipt_data: ReceiptData;
    }>("/cashier/payments/remaining", {
      payment_id: paymentId,
      amount,
      method,
    }),

  getReceipt: (orderId: number) =>
    apiClient.get<{ data: ReceiptData }>(`/cashier/orders/${orderId}/receipt`),

  // Customer / online
  initiateMidtrans: (orderId: number, amount: number, method: string) =>
    apiClient.post<{ message: string; data: MidtransResult }>(
      "/customer/payments/initiate",
      { order_id: orderId, amount, method },
    ),
};
