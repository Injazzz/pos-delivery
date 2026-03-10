import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

import { menusApi } from "@/api/menus";
import { useDebounce } from "@/hooks/useDebounce";
import type { Menu, MenuFilters } from "@/types/menu";

import { MENU_QUERY_KEY, useMenuMutations } from "./hooks/useMenuMutations";
import { MenuStatsCards } from "./components/MenuStatsCards";
import { MenuFiltersBar } from "./components/MenuFiltersBar";
import { MenuGrid } from "./components/MenuGrid";
import { MenuFormDialog } from "./components/MenuFormDialog";
import { MenuDeleteDialog } from "./components/MenuDeleteDialog";
import { MenuImageUploadDialog } from "./components/MenuImageUpload";
import type { MenuForm } from "./schemas";

export default function ManagerMenus() {
  const [filters, setFilters] = useState<MenuFilters>({
    page: 1,
    per_page: 20,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [imageTarget, setImageTarget] = useState<Menu | null>(null);

  const updateFilters = (patch: Partial<MenuFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const { data, isLoading } = useQuery({
    queryKey: [MENU_QUERY_KEY, { ...filters, search: debouncedSearch }],
    queryFn: () =>
      menusApi
        .getAll({ ...filters, search: debouncedSearch || undefined })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    uploadImagesMutation,
    deleteImageMutation,
  } = useMenuMutations();

  const handleCreate = (data: MenuForm) => {
    createMutation.mutate(data, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (data: MenuForm) => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.id, payload: data },
      {
        onSuccess: () => setEditTarget(null),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteTarget(null) });
  };

  const handleUploadImages = (menuId: number, files: File[]) => {
    uploadImagesMutation.mutate(
      { id: menuId, files },
      {
        onSuccess: () => setImageTarget(null),
      },
    );
  };

  const handleDeleteImage = (menuId: number, mediaId: number) => {
    deleteImageMutation.mutate({ menuId, mediaId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-400" />
            Manajemen Menu
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola daftar makanan dan minuman
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Menu
        </Button>
      </div>

      <MenuStatsCards summary={data?.summary} isLoading={isLoading} />

      <MenuFiltersBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={updateFilters}
        categories={data?.categories ?? []}
      />

      <MenuGrid
        menus={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onManageImages={setImageTarget}
        onPageChange={(page) => updateFilters({ page })}
      />

      <MenuFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        categories={data?.categories ?? []}
      />

      <MenuFormDialog
        mode="edit"
        menu={editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        categories={data?.categories ?? []}
      />

      <MenuDeleteDialog
        menu={deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <MenuImageUploadDialog
        menu={imageTarget}
        onOpenChange={(v) => !v && setImageTarget(null)}
        onUpload={handleUploadImages}
        onDeleteImage={handleDeleteImage}
        isUploading={uploadImagesMutation.isPending}
        isDeleting={deleteImageMutation.isPending}
      />
    </div>
  );
}
