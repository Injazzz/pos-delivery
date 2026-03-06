import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";

export function CartSummary() {
  const {
    items,
    removeItem,
    updateQty,
    updateNote,
    subtotal,
    notes,
    setNotes,
  } = useCartStore();

  const TAX_RATE = 0.11;
  const sub = subtotal();
  const tax = sub * TAX_RATE;
  const total = sub + tax;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 py-12">
        <ShoppingCart className="w-10 h-10" />
        <p className="text-sm">Keranjang kosong</p>
        <p className="text-xs text-center">
          Pilih menu dari daftar di sebelah kiri
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {items.map((item) => (
          <div
            key={item.menu.id}
            className="bg-slate-800 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.menu.name}
                </p>
                <p className="text-xs text-amber-400">
                  Rp {(item.menu.price * item.qty).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
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
                  className="w-6 h-6 text-slate-500 hover:text-red-400 hover:bg-transparent"
                  onClick={() => removeItem(item.menu.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Catatan item */}
            <input
              type="text"
              value={item.note}
              onChange={(e) => updateNote(item.menu.id, e.target.value)}
              placeholder="Catatan (opsional)..."
              className="w-full bg-slate-700 border-0 rounded px-2 py-1 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        ))}
      </div>

      {/* Catatan order */}
      <div className="mb-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan untuk pesanan..."
          rows={2}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-xs resize-none"
        />
      </div>

      {/* Price summary */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span>Rp {sub.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Pajak 11%</span>
          <span>Rp {Math.round(tax).toLocaleString("id-ID")}</span>
        </div>
        <Separator className="bg-slate-700" />
        <div className="flex justify-between font-bold">
          <span className="text-white">Total</span>
          <span className="text-amber-400">
            Rp {Math.round(total).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}
