import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PowerOff,
  Power,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ROLE_CONFIG } from "../types";
import type { User } from "@/types/user";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  users: User[];
  isLoading: boolean;
  meta?: PaginationMeta;
  isToggling: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (id: number) => void;
  onResetPassword: (user: User) => void;
  onPageChange: (page: number) => void;
}

export function UserTable({
  users,
  isLoading,
  meta,
  isToggling,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">
                Pengguna
              </TableHead>
              <TableHead className="text-slate-400 font-medium">Role</TableHead>
              <TableHead className="text-slate-400 font-medium hidden md:table-cell">
                No HP
              </TableHead>
              <TableHead className="text-slate-400 font-medium">
                Status
              </TableHead>
              <TableHead className="text-slate-400 font-medium hidden lg:table-cell">
                Terdaftar
              </TableHead>
              <TableHead className="text-slate-400 font-medium text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-slate-800">
                  <TableCell>
                    <Skeleton className="h-9 w-48 bg-slate-800 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 bg-slate-800 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28 bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 bg-slate-800 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 bg-slate-800 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty state */}
            {!isLoading && users.length === 0 && (
              <TableRow className="border-slate-800">
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <span className="text-3xl">👤</span>
                    <p className="text-sm">Tidak ada pengguna ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-slate-800 hover:bg-slate-900/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-amber-500/20 text-amber-300 text-xs font-semibold">
                          {user.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        ROLE_CONFIG[user.role]?.color,
                      )}
                    >
                      {ROLE_CONFIG[user.role]?.label ?? user.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-slate-400 text-sm">
                    {user.phone ?? <span className="text-slate-600">—</span>}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px]",
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30",
                      )}
                    >
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-slate-900 border-slate-700 text-slate-200"
                      >
                        <DropdownMenuItem
                          className="gap-2 text-sm hover:bg-slate-800 cursor-pointer"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          Edit Pengguna
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="gap-2 text-sm hover:bg-slate-800 cursor-pointer"
                          onClick={() => onResetPassword(user)}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          Reset Password
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700" />

                        <DropdownMenuItem
                          className="gap-2 text-sm hover:bg-slate-800 cursor-pointer"
                          onClick={() => onToggleStatus(user.id)}
                          disabled={isToggling}
                        >
                          {user.status === "active" ? (
                            <>
                              <PowerOff className="w-3.5 h-3.5 text-orange-400" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5 text-emerald-400" />
                              Aktifkan
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700" />

                        <DropdownMenuItem
                          className="gap-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus Pengguna
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Menampilkan {meta.from}–{meta.to} dari {meta.total} pengguna
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 text-xs text-white bg-slate-800 rounded-md border border-slate-700">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
