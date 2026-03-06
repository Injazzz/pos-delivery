/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ordersApi } from "@/api/orders";
import type { Order } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function ReviewDialog({ order, onClose }: Props) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () => ordersApi.customerReview(order!.id, { rating, comment }),
    onSuccess: () => {
      toast.success("Ulasan berhasil dikirim. Terima kasih!");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal mengirim ulasan."),
  });

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Beri Ulasan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Pesanan #{order.order_code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star rating */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-slate-400">
              Seberapa puas dengan pesanan ini?
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-700",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-white">
              {
                ["", "Sangat Kecewa", "Kecewa", "Cukup", "Puas", "Sangat Puas"][
                  hovered || rating
                ]
              }
            </p>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Ceritakan pengalaman Anda (opsional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Kirim Ulasan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
