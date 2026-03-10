import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { usersApi } from "@/api/users";
import { useDebounce } from "@/hooks/useDebounce";
import type { User, UserFilters } from "@/types/user";

import { useUserMutations, USER_QUERY_KEY } from "./hooks/useUserMutations";
import { UserSummaryCards } from "./components/UserSummaryCards";
import { UserFiltersBar } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { UserCreateDialog } from "./components/UserFormDialog";
import { UserEditDialog } from "./components/UserFormDialog";
import { UserDeleteDialog } from "./components/UserDeleteDialog";
import { UserResetPasswordDialog } from "./components/UserResetPasswordDialog";

import type {
  StoreUserForm,
  UpdateUserForm,
  ResetPasswordForm,
} from "./schemas";

export default function UsersPage() {
  // ── Filters ───────────────────────────────────
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    per_page: 15,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const updateFilters = (patch: Partial<UserFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  // ── Dialog state ──────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetPwTarget, setResetPwTarget] = useState<User | null>(null);

  // ── Server state ──────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [USER_QUERY_KEY, { ...filters, search: debouncedSearch }],
    queryFn: () =>
      usersApi
        .getAll({ ...filters, search: debouncedSearch || undefined })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  // ── Mutations ─────────────────────────────────
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    resetPasswordMutation,
  } = useUserMutations();

  // ── Handlers ──────────────────────────────────
  const handleCreate = (data: StoreUserForm) => {
    createMutation.mutate(data, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleUpdate = (data: UpdateUserForm) => {
    if (!editTarget) return;
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    updateMutation.mutate(
      { id: editTarget.id, payload },
      {
        onSuccess: () => setEditTarget(null),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleResetPassword = (userId: number, data: ResetPasswordForm) => {
    resetPasswordMutation.mutate(
      { id: userId, password: data.password },
      {
        onSuccess: () => setResetPwTarget(null),
      },
    );
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users2 className="w-6 h-6 text-amber-400" />
            Manajemen Pengguna
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola semua akun pengguna sistem
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Summary cards */}
      <UserSummaryCards summary={data?.summary} isLoading={isLoading} />

      {/* Filters */}
      <UserFiltersBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={updateFilters}
      />

      {/* Table */}
      <UserTable
        users={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        isToggling={toggleMutation.isPending}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onToggleStatus={(id) => toggleMutation.mutate(id)}
        onResetPassword={setResetPwTarget}
        onPageChange={(page) => updateFilters({ page })}
      />

      {/* Dialogs */}
      <UserCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      <UserEditDialog
        user={editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <UserDeleteDialog
        user={deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <UserResetPasswordDialog
        user={resetPwTarget}
        onOpenChange={(v) => !v && setResetPwTarget(null)}
        onSubmit={handleResetPassword}
        isLoading={resetPasswordMutation.isPending}
      />
    </div>
  );
}
