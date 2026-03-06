/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/api/users";
import type { StoreUserPayload, UpdateUserPayload } from "@/types/user";

export const USER_QUERY_KEY = "manager-users";

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [USER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (payload: StoreUserPayload) => usersApi.create(payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal membuat user."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal mengupdate user."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus."),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleStatus(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => {
      toast.success("Password berhasil direset.");
      invalidate();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    resetPasswordMutation,
  };
}
