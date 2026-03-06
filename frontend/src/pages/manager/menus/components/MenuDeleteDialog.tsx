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
import type { Menu } from "@/types/menu";

interface Props {
  menu: Menu | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: number) => void;
  isLoading: boolean;
}

export function MenuDeleteDialog({
  menu,
  onOpenChange,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <AlertDialog open={!!menu} onOpenChange={(v) => !v && onOpenChange(false)}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Hapus Menu?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Menu <span className="text-white font-medium">{menu?.name}</span>{" "}
            akan dihapus. Data pesanan yang sudah ada tidak akan terpengaruh.
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
            onClick={() => menu && onConfirm(menu.id)}
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
