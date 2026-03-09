import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-slate-900 border-slate-700 w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              Keranjang
              {items.length > 0 && (
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Kosongkan
              </button>
            )}
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
              <ShoppingCart className="w-10 h-10" />
              <p className="text-sm">Keranjang kosong</p>
              <p className="text-xs text-center">
                Pilih menu dari daftar untuk menambahkan ke keranjang
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.menu.id}
                className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl"
              >
                {/* Image */}
                {item.menu.first_image_url && (
                  <img
                    src={item.menu.first_image_url}
                    alt={item.menu.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.menu.name}
                  </p>
                  <p className="text-xs text-amber-400 mt-0.5">
                    Rp {(item.menu.price * item.qty).toLocaleString("id-ID")}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="icon"
                      className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => updateQty(item.menu.id, item.qty - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-bold text-white w-5 text-center">
                      {item.qty}
                    </span>
                    <Button
                      size="icon"
                      className="w-6 h-6 bg-amber-500 hover:bg-amber-400 text-slate-950"
                      onClick={() => updateQty(item.menu.id, item.qty + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 ml-auto text-slate-500 hover:text-red-400 hover:bg-transparent"
                      onClick={() => removeItem(item.menu.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-800 space-y-3">
            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rp {sub.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pajak (11%)</span>
                <span>Rp {tax.toLocaleString("id-ID")}</span>
              </div>
              <Separator className="bg-slate-700 my-1" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-white">Total</span>
                <span className="text-amber-400">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2"
              disabled={isLoading}
              onClick={onCheckout}
            >
              {isLoading ? (
                "Memproses..."
              ) : (
                <>
                  Pesan Sekarang
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
