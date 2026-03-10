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
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Beri Ulasan</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pesanan #{order.order_code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star rating */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
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
                        ? "fill-accent text-accent"
                        : "text-muted/50",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground">
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
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
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
