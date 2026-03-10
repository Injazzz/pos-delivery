import { useState } from "react";
import { UtensilsCrossed, Package, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { OrderType } from "@/types/order";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ORDER_TYPES: Array<{
  value: OrderType;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    value: "dine_in",
    label: "Makan di Tempat",
    desc: "Nikmati langsung di restoran",
    icon: UtensilsCrossed,
  },
  {
    value: "take_away",
    label: "Bawa Pulang",
    desc: "Dibungkus untuk dibawa",
    icon: Package,
  },
  {
    value: "delivery",
    label: "Antar ke Rumah",
    desc: "Diantarkan ke alamat Anda",
    icon: Bike,
  },
];

export function OrderTypeDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  const {
    orderType,
    tableNumber,
    deliveryAddress,
    deliveryCity,
    deliveryNotes,
    setOrderType,
    setTableNumber,
    setDeliveryInfo,
  } = useCartStore();

  const [localType, setLocalType] = useState<OrderType>(orderType);

  const isValid =
    localType === "take_away" ||
    (localType === "dine_in" && tableNumber.trim() !== "") ||
    (localType === "delivery" && deliveryAddress.trim() !== "");

  const handleConfirm = () => {
    setOrderType(localType);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Pilih Tipe Pesanan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bagaimana Anda ingin menikmati pesanan?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Type selection */}
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setLocalType(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all",
                  localType === t.value
                    ? "bg-accent/10 border-accent"
                    : "bg-muted border-border hover:border-border/80",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    localType === t.value ? "bg-accent/20" : "bg-muted",
                  )}
                >
                  <t.icon
                    className={cn(
                      "w-5 h-5",
                      localType === t.value
                        ? "text-accent"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-[10px] font-semibold leading-tight",
                    localType === t.value ? "text-accent" : "text-foreground",
                  )}
                >
                  {t.label}
                </p>
              </button>
            ))}
          </div>

          {/* Dine-in: table number */}
          {localType === "dine_in" && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">
                Nomor Meja <span className="text-primary">*</span>
              </Label>
              <Input
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Contoh: A1, B3, VIP-1"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent"
              />
            </div>
          )}

          {/* Delivery: address */}
          {localType === "delivery" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  Alamat Pengiriman <span className="text-primary">*</span>
                </Label>
                <Input
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryInfo({ deliveryAddress: e.target.value })
                  }
                  placeholder="Jalan, Nomor, RT/RW, Kelurahan"
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Kota</Label>
                <Input
                  value={deliveryCity}
                  onChange={(e) =>
                    setDeliveryInfo({ deliveryCity: e.target.value })
                  }
                  placeholder="Nama kota"
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  Catatan Pengiriman
                </Label>
                <Input
                  value={deliveryNotes}
                  onChange={(e) =>
                    setDeliveryInfo({ deliveryNotes: e.target.value })
                  }
                  placeholder="Patokan, lantai, dll (opsional)"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            disabled={!isValid || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Memproses..." : "Konfirmasi Pesanan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
