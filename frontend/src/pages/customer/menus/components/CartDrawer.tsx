import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function CartDrawer({ open, onClose, onCheckout, isLoading }: Props) {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCartStore();

  const TAX_RATE = 0.11;
  const sub = subtotal();
  const tax = Math.round(sub * TAX_RATE);
  const total = sub + tax;
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-card border-border w-full sm:max-w-md flex flex-col p-0"
        aria-describedby="cart"
      >
        <SheetHeader className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-heart-500/10 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-heart-500" />
              </div>
              <span className="text-base font-semibold">Keranjang</span>
              {items.length > 0 && (
                <Badge className="bg-heart-500 text-white text-xs font-bold px-2 py-0.5">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Keranjang kosong
                </p>
                <p className="text-xs text-muted-foreground max-w-50">
                  Pilih menu dari daftar untuk menambahkan ke keranjang
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.menu.id}
                className="flex items-start gap-3 p-3 bg-muted/50 border border-border rounded-xl hover:border-heart-500/30 transition-all group"
              >
                {/* Image */}
                {item.menu.first_image_url ? (
                  <img
                    src={item.menu.first_image_url}
                    alt={item.menu.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                    <Receipt className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.menu.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        @ {item.menu.formatted_price}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-heart-500 shrink-0">
                      Rp {(item.menu.price * item.qty).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-7 h-7 border-border text-foreground hover:bg-muted"
                      onClick={() => updateQty(item.menu.id, item.qty - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="text-sm font-bold text-foreground w-6 text-center">
                      {item.qty}
                    </span>

                    <Button
                      size="icon"
                      variant="outline"
                      className="w-7 h-7 border-border text-foreground hover:bg-muted"
                      onClick={() => updateQty(item.menu.id, item.qty + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.menu.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-4">
            {/* Price breakdown */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Rincian Pembayaran
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">
                    Rp {sub.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak (11%)</span>
                  <span className="text-foreground font-medium">
                    Rp {tax.toLocaleString("id-ID")}
                  </span>
                </div>
                <Separator className="bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-heart-500">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Sudah termasuk pajak
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-heart-500 hover:bg-heart-600 text-white font-bold text-base gap-2 transition-all group"
              disabled={isLoading}
              onClick={onCheckout}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Info tambahan */}
            <p className="text-[10px] text-center text-muted-foreground">
              Pesanan akan diproses setelah konfirmasi pembayaran
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
