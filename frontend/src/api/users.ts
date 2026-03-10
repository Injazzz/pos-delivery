import apiClient from "@/lib/axios";
import type { PaginatedResponse } from "@/types/pagination";
import type {
  StoreUserPayload,
  UpdateUserPayload,
  User,
  UserFilters,
} from "@/types/user";

export const usersApi = {
  getAll: (filters?: UserFilters) =>
    apiClient.get<PaginatedResponse<User>>("/manager/users", {
      params: filters,
    }),

  getOne: (id: number) => apiClient.get<{ data: User }>(`/manager/users/${id}`),

  create: (payload: StoreUserPayload) =>
    apiClient.post<{ message: string; data: User }>("/manager/users", payload),

  update: (id: number, payload: UpdateUserPayload) =>
    apiClient.put<{ message: string; data: User }>(
      `/manager/users/${id}`,
      payload,
    ),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/manager/users/${id}`),

  toggleStatus: (id: number) =>
    apiClient.patch<{ message: string; data: User }>(
      `/manager/users/${id}/toggle-status`,
    ),

  resetPassword: (id: number, password: string) =>
    apiClient.post(`/manager/users/${id}/reset-password`, {
      password,
      password_confirmation: password,
    }),
};
