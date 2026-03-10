import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PowerOff,
  Power,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  UserCog,
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

// Role badge colors configuration
const ROLE_BADGE_COLORS: Record<string, string> = {
  manager: "bg-heart-500/10 text-heart-500 border-heart-500/30",
  kasir: "bg-earth-500/10 text-earth-500 border-earth-500/30",
  kurir: "bg-glow-500/10 text-glow-500 border-glow-500/30",
  pelanggan: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

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
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium">
                Pengguna
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Role
              </TableHead>
              <TableHead className="text-muted-foreground font-medium hidden md:table-cell">
                No HP
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">
                Terdaftar
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32 bg-muted" />
                        <Skeleton className="h-3 w-24 bg-muted" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 bg-muted rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty state */}
            {!isLoading && users.length === 0 && (
              <TableRow className="border-border hover:bg-muted/50">
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <UserCog className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Tidak ada pengguna ditemukan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coba ubah filter pencarian atau tambah pengguna baru
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-border hover:bg-muted/50 transition-colors group"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 shrink-0 ring-2 ring-border">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            user.role === "manager"
                              ? "bg-heart-500/20 text-heart-500"
                              : user.role === "kasir"
                                ? "bg-earth-500/20 text-earth-500"
                                : user.role === "kurir"
                                  ? "bg-glow-500/20 text-glow-500"
                                  : "bg-emerald-500/20 text-emerald-500",
                          )}
                        >
                          {user.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium border",
                        ROLE_BADGE_COLORS[user.role] ||
                          "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {ROLE_CONFIG[user.role]?.label ?? user.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <span
                      className={cn(
                        "text-sm",
                        user.phone
                          ? "text-foreground"
                          : "text-muted-foreground italic",
                      )}
                    >
                      {user.phone ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : "bg-destructive/10 text-destructive border-destructive/30",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            user.status === "active"
                              ? "bg-emerald-500"
                              : "bg-destructive",
                          )}
                        />
                        {user.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-popover border-border"
                      >
                        <DropdownMenuItem
                          className="gap-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          Edit Pengguna
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="gap-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => onResetPassword(user)}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                          Reset Password
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenuItem
                          className="gap-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => onToggleStatus(user.id)}
                          disabled={isToggling}
                        >
                          {user.status === "active" ? (
                            <>
                              <PowerOff className="w-3.5 h-3.5 text-glow-500" />
                              <span>Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Aktifkan</span>
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenuItem
                          className="gap-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground order-2 sm:order-1">
            Menampilkan {meta.from}–{meta.to} dari {meta.total} pengguna
          </span>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-all"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(3, meta.last_page) }, (_, i) => {
                const pageNumber = meta.current_page - 1 + i;
                if (pageNumber < 1 || pageNumber > meta.last_page) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant={
                      pageNumber === meta.current_page ? "default" : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "w-7 h-7 p-0 text-xs",
                      pageNumber === meta.current_page
                        ? "bg-heart-500 hover:bg-heart-600 text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-all"
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
