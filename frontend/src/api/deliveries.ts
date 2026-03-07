/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/lib/axios";
import type { Courier, Delivery, DeliverySummary } from "@/types/delivery";
import type { PaginatedResponse } from "@/types/pagination";

interface DeliveryListResponse extends PaginatedResponse<Delivery> {
  summary?: DeliverySummary;
  active?: Delivery[];
}

export const deliveriesApi = {
  // Manager
  managerList: (params?: Record<string, any>) =>
    apiClient.get<DeliveryListResponse>("/manager/deliveries", { params }),

  assignCourier: (deliveryId: number, courierId: number) =>
    apiClient.post<{ message: string; data: Delivery }>(
      `/manager/deliveries/${deliveryId}/assign`,
      { courier_id: courierId },
    ),

  getAvailableCouriers: () =>
    apiClient.get<{ data: Courier[] }>("/manager/couriers/available"),

  // Courier
  courierList: (params?: Record<string, any>) =>
    apiClient.get<DeliveryListResponse>("/courier/deliveries", { params }),

  updateStatus: (deliveryId: number, status: string, notes?: string) =>
    apiClient.patch<{ message: string; data: Delivery }>(
      `/courier/deliveries/${deliveryId}/status`,
      { status, notes },
    ),

  uploadProof: (deliveryId: number, imageFile: File) => {
    const form = new FormData();
    form.append("proof_image", imageFile);
    return apiClient.post<{ message: string; data: Delivery }>(
      `/courier/deliveries/${deliveryId}/proof`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
