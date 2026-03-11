/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Loader2, Sparkles, ThumbsUp, MessageSquare } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ordersApi } from "@/api/orders";
import type { Order } from "@/types/order";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const RATING_LABELS = [
  "Sangat Kecewa",
  "Kecewa",
  "Cukup",
  "Puas",
  "Sangat Puas",
];

const RATING_EMOJIS = ["😞", "😕", "😐", "😊", "🥰"];

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

  const selectedRating = hovered || rating;
  const ratingLabel = RATING_LABELS[selectedRating - 1];
  const ratingEmoji = RATING_EMOJIS[selectedRating - 1];

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glow-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-glow-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Beri Ulasan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Pesanan #{order.order_code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Order summary */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-heart-500/10 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-heart-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Pesanan</p>
                <p className="text-sm font-semibold text-foreground">
                  {order.formatted_total}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-muted text-muted-foreground border-border"
              >
                {order.items?.length} item
              </Badge>
            </div>
          </div>

          {/* Star rating */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Seberapa puas dengan pesanan ini?
            </p>

            <div className="relative">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-all hover:scale-125 focus:outline-none group"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-all",
                        star <= (hovered || rating)
                          ? "fill-glow-500 text-glow-500 drop-shadow-lg"
                          : "text-muted-foreground/30 hover:text-muted-foreground/50",
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Rating indicator */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge
                  className={cn(
                    "px-3 py-1 text-xs font-medium border",
                    selectedRating >= 4
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : selectedRating >= 3
                        ? "bg-glow-500/10 text-glow-500 border-glow-500/30"
                        : "bg-destructive/10 text-destructive border-destructive/30",
                  )}
                >
                  <span className="mr-1">{ratingEmoji}</span>
                  {ratingLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Tambahkan Komentar (Opsional)
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {comment.length}/500
              </span>
            </div>
            <Textarea
              placeholder="Ceritakan pengalaman Anda, apa yang Anda suka atau saran untuk kami..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={4}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-glow-500 focus:ring-glow-500/20"
            />
          </div>

          {/* Quick feedback suggestions */}
          {!comment && (
            <div className="flex flex-wrap gap-2">
              {[
                "Makanan enak",
                "Pelayanan cepat",
                "Porsi pas",
                "Harga sesuai",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setComment(suggestion)}
                  className="px-2 py-1 text-[10px] bg-muted hover:bg-muted/80 text-foreground rounded-full border border-border transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all flex-1"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            className={cn(
              "flex-1 bg-glow-500 hover:bg-glow-600 text-white font-semibold gap-2 transition-all",
              mutation.isPending && "opacity-70 cursor-wait",
            )}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Kirim Ulasan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Import Label
import { Label } from "@/components/ui/label";
