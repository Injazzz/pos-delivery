import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";

interface CartSummaryProps {
  orderType: "dine_in" | "take_away" | "delivery";
  onOrderTypeChange: (type: "dine_in" | "take_away" | "delivery") => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  tableNumber: string;
  onTableNumberChange: (table: string) => void;
  deliveryAddress: string;
  onDeliveryAddressChange: (address: string) => void;
  deliveryCity: string;
  onDeliveryCityChange: (city: string) => void;
  deliveryNotes: string;
  onDeliveryNotesChange: (notes: string) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  isOffline?: boolean;
}

export function CartSummary({
  orderType,
  onOrderTypeChange,
  notes,
  onNotesChange,
  tableNumber,
  onTableNumberChange,
  deliveryAddress,
  onDeliveryAddressChange,
  deliveryCity,
  onDeliveryCityChange,
  deliveryNotes,
  onDeliveryNotesChange,
  onSubmit,
  isSubmitting = false,
  isOffline = false,
}: CartSummaryProps) {
  const { items, removeItem, updateQty, updateNote, subtotal } = useCartStore();

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
      {/* Order type selector */}
      <div className="mb-3 space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Tipe Pesanan
        </label>
        <div className="flex gap-2">
          {(["dine_in", "take_away", "delivery"] as const).map((type) => (
            <Button
              key={type}
              variant={orderType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onOrderTypeChange(type)}
              className={`text-xs flex-1 ${
                orderType === type
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600"
              }`}
            >
              {type === "dine_in"
                ? "Dine In"
                : type === "take_away"
                  ? "Takeaway"
                  : "Delivery"}
            </Button>
          ))}
        </div>
      </div>

      {/* Conditional fields based on order type */}
      {orderType === "dine_in" && (
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Nomor Meja *
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            placeholder="Contoh: A1, T5"
            disabled={isSubmitting}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
        </div>
      )}

      {orderType === "delivery" && (
        <div className="mb-3 space-y-1.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Alamat Pengiriman *
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => onDeliveryAddressChange(e.target.value)}
              placeholder="Alamat lengkap pengiriman..."
              disabled={isSubmitting}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Kota
            </label>
            <input
              type="text"
              value={deliveryCity}
              onChange={(e) => onDeliveryCityChange(e.target.value)}
              placeholder="Contoh: Jakarta, Bandung"
              disabled={isSubmitting}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Catatan Pengiriman
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => onDeliveryNotesChange(e.target.value)}
              placeholder="Contoh: Depan pintu, hub ke nomor..."
              disabled={isSubmitting}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6 text-slate-500 hover:text-red-400 hover:bg-transparent"
                  onClick={() => removeItem(item.menu.id)}
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="w-full bg-slate-700 border-0 rounded px-2 py-1 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      {/* Catatan order */}
      <div className="mb-3">
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Catatan untuk pesanan..."
          rows={2}
          disabled={isSubmitting}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-xs resize-none disabled:opacity-50"
        />
      </div>

      {/* Price summary */}
      <div className="bg-slate-800 rounded-lg p-3 space-y-1.5 text-sm mb-3">
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

      {/* Submit button */}
      <Button
        onClick={onSubmit}
        disabled={items.length === 0 || isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "Memproses..."
          : isOffline
            ? "Simpan Offline"
            : "Buat Pesanan"}
      </Button>
    </div>
  );
}
