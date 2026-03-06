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
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Hapus Pengguna?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Akun <span className="text-white font-medium">{user?.name}</span>{" "}
            akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500 text-white"
            disabled={isLoading}
            onClick={() => user && onConfirm(user.id)}
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
