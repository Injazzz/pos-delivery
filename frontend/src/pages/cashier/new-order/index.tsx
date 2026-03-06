import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuSelector } from "./components/MenuSelector";
import { CartSummary } from "./components/CartSummary";
import { useCartStore } from "@/stores/cartStore";
import { ordersApi } from "@/api/orders";
import type { Menu } from "@/types/menu";

type OrderType = "dine_in" | "take_away" | "delivery";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const {
    items,
    orderType,
    tableNumber,
    deliveryAddress,
    deliveryCity,
    notes,
    addItem,
    clearCart,
    totalItems,
    subtotal,
    setOrderType,
    setTableNumber,
    setDeliveryInfo,
  } = useCartStore();

  const createMutation = useMutation({
    mutationFn: () =>
      ordersApi.cashierCreate({
        order_type: orderType,
        notes,
        table_number: orderType === "dine_in" ? tableNumber : undefined,
        delivery_address:
          orderType === "delivery" ? deliveryAddress : undefined,
        delivery_city: orderType === "delivery" ? deliveryCity : undefined,
        items: items.map((i) => ({
          menu_id: i.menu.id,
          qty: i.qty,
          note: i.note,
        })),
      }),
    onSuccess: (res) => {
      toast.success("Pesanan berhasil dibuat!");
      clearCart();
      navigate(`/cashier/payment/${res.data.data.id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? "Gagal membuat pesanan."),
  });

  const handleAddMenu = (menu: Menu) => {
    addItem(menu);
    toast.success(`${menu.name} ditambahkan`, { duration: 1000 });
  };

  // Nilai yang dihitung
  const subtotalValue = subtotal();
  const taxValue = subtotalValue * 0.11;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalValue = subtotalValue + taxValue;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pesanan Baru</h1>
          <p className="text-slate-400 text-sm mt-1">
            Pilih menu dan buat pesanan
          </p>
        </div>
      </div>

      {/* Order type + info */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-slate-400 text-sm whitespace-nowrap">
            Tipe:
          </Label>
          <Select
            value={orderType}
            onValueChange={(v: OrderType) => setOrderType(v)}
          >
            <SelectTrigger className="w-36 h-8 bg-slate-900 border-slate-700 text-slate-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="dine_in" className="text-slate-300">
                Dine In
              </SelectItem>
              <SelectItem value="take_away" className="text-slate-300">
                Take Away
              </SelectItem>
              <SelectItem value="delivery" className="text-slate-300">
                Delivery
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orderType === "dine_in" && (
          <div className="flex items-center gap-2">
            <Label className="text-slate-400 text-sm whitespace-nowrap">
              No. Meja:
            </Label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Mis: A1"
              className="w-24 h-8 bg-slate-900 border-slate-700 text-white text-sm"
            />
          </div>
        )}

        {orderType === "delivery" && (
          <div className="flex items-center gap-2 flex-1">
            <Label className="text-slate-400 text-sm whitespace-nowrap">
              Alamat:
            </Label>
            <Input
              value={deliveryAddress}
              onChange={(e) =>
                setDeliveryInfo({ deliveryAddress: e.target.value })
              }
              placeholder="Alamat pengiriman"
              className="flex-1 h-8 bg-slate-900 border-slate-700 text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Main layout: Menu picker | Cart */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 min-h-0">
        {/* Left: Menu selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col min-h-0">
          <MenuSelector onAdd={handleAddMenu} />
        </div>

        {/* Right: Cart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">
                Keranjang
              </span>
              {totalItems() > 0 && (
                <Badge className="bg-amber-500 text-slate-950 text-[10px] h-4 px-1.5">
                  {totalItems()}
                </Badge>
              )}
            </div>
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

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <CartSummary />
          </div>

          {items.length > 0 && (
            <Button
              className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                "Memproses..."
              ) : (
                <>
                  Lanjut ke Pembayaran
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
