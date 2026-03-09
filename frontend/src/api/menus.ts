import apiClient from "@/lib/axios";
import type {
  Menu,
  MenuFilters,
  StoreMenuPayload,
  UpdateMenuPayload,
} from "@/types/menu";
import type { PaginatedResponse } from "@/types/pagination";

interface MenuListResponse extends PaginatedResponse<Menu> {
  summary: {
    total: number;
    available: number;
    unavailable: number;
    categories: number;
  };
  categories: string[];
}

export const menusApi = {
  // Manager endpoints
  getAll: (filters?: MenuFilters) =>
    apiClient.get<MenuListResponse>("/manager/menus", { params: filters }),

  getOne: (id: number) => apiClient.get<{ data: Menu }>(`/manager/menus/${id}`),

  create: (payload: StoreMenuPayload) =>
    apiClient.post<{ message: string; data: Menu }>("/manager/menus", payload),

  update: (id: number, payload: UpdateMenuPayload) =>
    apiClient.put<{ message: string; data: Menu }>(
      `/manager/menus/${id}`,
      payload,
    ),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/manager/menus/${id}`),

  uploadImages: (id: number, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images[]", f));
    return apiClient.post<{ message: string; data: Menu }>(
      `/manager/menus/${id}/images`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  deleteImage: (menuId: number, mediaId: number) =>
    apiClient.delete<{ message: string }>(
      `/manager/menus/${menuId}/images/${mediaId}`,
    ),

  // Public/shared endpoints
  getPublic: (params?: { search?: string; category?: string }) =>
    apiClient.get<MenuListResponse>("/menus", { params }),

  getPublicOne: (id: number) => apiClient.get<{ data: Menu }>(`/menus/${id}`),
};
