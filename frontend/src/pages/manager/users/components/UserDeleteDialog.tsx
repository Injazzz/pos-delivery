import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/types/user";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  user: User | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: number) => void;
  isLoading: boolean;
}

export function UserDeleteDialog({
  user,
  onOpenChange,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <AlertDialog open={!!user} onOpenChange={(v) => !v && onOpenChange(false)}>
      <AlertDialogContent className="bg-card border-border max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-foreground text-lg">
                Hapus Pengguna?
              </AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Akun{" "}
            <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
              {user?.name}
            </span>{" "}
            akan dihapus secara permanen dari sistem.
            <br />
            <span className="block mt-2 text-xs">Tindakan ini akan:</span>
          </AlertDialogDescription>

          <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-1">
            <li>Menghapus semua data pengguna</li>
            <li>Membatalkan sesi login yang aktif</li>
            <li>Tidak dapat dikembalikan atau dipulihkan</li>
          </ul>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            className="bg-muted border-border text-foreground hover:bg-muted/80 hover:text-foreground transition-all"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all min-w-25"
            disabled={isLoading}
            onClick={() => user && onConfirm(user.id)}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </div>
            ) : (
              "Ya, Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
