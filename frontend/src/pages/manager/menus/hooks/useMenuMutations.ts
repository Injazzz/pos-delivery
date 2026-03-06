/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { menusApi } from "@/api/menus";
import type { StoreMenuPayload, UpdateMenuPayload } from "@/types/menu";

export const MENU_QUERY_KEY = "manager-menus";

export function useMenuMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (payload: StoreMenuPayload) => menusApi.create(payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal membuat menu."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMenuPayload }) =>
      menusApi.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal mengupdate menu."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menusApi.delete(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus menu."),
  });

  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      menusApi.uploadImages(id, files),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal upload gambar."),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ menuId, mediaId }: { menuId: number; mediaId: number }) =>
      menusApi.deleteImage(menuId, mediaId),
    onSuccess: () => {
      toast.success("Gambar dihapus.");
      invalidate();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus gambar."),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    uploadImagesMutation,
    deleteImageMutation,
  };
}
