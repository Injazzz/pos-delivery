import { useState } from "react";
import {
  UtensilsCrossed,
  Package,
  Bike,
  MapPin,
  Home,
  AlertCircle,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  {
    value: "dine_in",
    label: "Makan di Tempat",
    desc: "Nikmati langsung di restoran",
    icon: UtensilsCrossed,
    color: "text-earth-500",
    bgColor: "bg-earth-500/10",
    borderColor: "border-earth-500/30",
  },
  {
    value: "take_away",
    label: "Bawa Pulang",
    desc: "Dibungkus untuk dibawa",
    icon: Package,
    color: "text-heart-500",
    bgColor: "bg-heart-500/10",
    borderColor: "border-heart-500/30",
  },
  {
    value: "delivery",
    label: "Antar ke Rumah",
    desc: "Diantarkan ke alamat Anda",
    icon: Bike,
    color: "text-glow-500",
    bgColor: "bg-glow-500/10",
    borderColor: "border-glow-500/30",
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
  const [localTableNumber, setLocalTableNumber] = useState(tableNumber);
  const [localDeliveryAddress, setLocalDeliveryAddress] =
    useState(deliveryAddress);
  const [localDeliveryCity, setLocalDeliveryCity] = useState(deliveryCity);
  const [localDeliveryNotes, setLocalDeliveryNotes] = useState(deliveryNotes);

  const selectedType = ORDER_TYPES.find((t) => t.value === localType);

  const isValid =
    localType === "take_away" ||
    (localType === "dine_in" && localTableNumber.trim() !== "") ||
    (localType === "delivery" && localDeliveryAddress.trim() !== "");

  const handleConfirm = () => {
    setOrderType(localType);
    setTableNumber(localTableNumber);
    setDeliveryInfo({
      deliveryAddress: localDeliveryAddress,
      deliveryCity: localDeliveryCity,
      deliveryNotes: localDeliveryNotes,
    });
    onConfirm();
  };

  const handleClose = () => {
    // Reset to store values
    setLocalType(orderType);
    setLocalTableNumber(tableNumber);
    setLocalDeliveryAddress(deliveryAddress);
    setLocalDeliveryCity(deliveryCity);
    setLocalDeliveryNotes(deliveryNotes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                selectedType?.bgColor || "bg-muted",
              )}
            >
              {selectedType ? (
                <selectedType.icon
                  className={cn("w-5 h-5", selectedType.color)}
                />
              ) : (
                <Home className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Pilih Tipe Pesanan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Bagaimana Anda ingin menikmati pesanan?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type selection */}
          <div className="grid grid-cols-3 gap-3">
            {ORDER_TYPES.map((t) => {
              const isSelected = localType === t.value;

              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setLocalType(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all",
                    "hover:scale-105 hover:shadow-lg",
                    isSelected
                      ? [t.bgColor, t.borderColor, "shadow-lg"]
                      : "bg-card border-border hover:border-muted-foreground/30 hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      isSelected ? t.bgColor : "bg-muted",
                    )}
                  >
                    <t.icon
                      className={cn(
                        "w-5 h-5",
                        isSelected ? t.color : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isSelected ? t.color : "text-foreground",
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">
                      {t.desc}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <Badge
                      className={cn(
                        "absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full flex items-center justify-center",
                        t.bgColor,
                        t.color,
                        "border-2 border-background",
                      )}
                    >
                      ✓
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dine-in: table number */}
          {localType === "dine_in" && (
            <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-earth-500/10 flex items-center justify-center">
                  <UtensilsCrossed className="w-3 h-3 text-earth-500" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Informasi Meja
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  Nomor Meja <span className="text-heart-500">*</span>
                </Label>
                <Input
                  value={localTableNumber}
                  onChange={(e) => setLocalTableNumber(e.target.value)}
                  placeholder="Contoh: A1, B3, VIP-1"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-earth-500 focus:ring-earth-500/20"
                />
                {!localTableNumber.trim() && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Nomor meja wajib diisi</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery: address */}
          {localType === "delivery" && (
            <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-glow-500/10 flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-glow-500" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Informasi Pengiriman
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    Alamat Lengkap <span className="text-heart-500">*</span>
                  </Label>
                  <Input
                    value={localDeliveryAddress}
                    onChange={(e) => setLocalDeliveryAddress(e.target.value)}
                    placeholder="Jalan, Nomor, RT/RW, Kelurahan"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-glow-500 focus:ring-glow-500/20"
                  />
                  {!localDeliveryAddress.trim() && (
                    <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Alamat wajib diisi</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">
                    Kota (opsional)
                  </Label>
                  <Input
                    value={localDeliveryCity}
                    onChange={(e) => setLocalDeliveryCity(e.target.value)}
                    placeholder="Nama kota"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-glow-500 focus:ring-glow-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">
                    Catatan Pengiriman (opsional)
                  </Label>
                  <Input
                    value={localDeliveryNotes}
                    onChange={(e) => setLocalDeliveryNotes(e.target.value)}
                    placeholder="Patokan, lantai, dll"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-glow-500 focus:ring-glow-500/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            className={cn(
              "text-white font-semibold transition-all min-w-35",
              selectedType?.value === "dine_in" &&
                "bg-earth-500 hover:bg-earth-600",
              selectedType?.value === "take_away" &&
                "bg-heart-500 hover:bg-heart-600",
              selectedType?.value === "delivery" &&
                "bg-glow-500 hover:bg-glow-600",
              !selectedType && "bg-muted text-muted-foreground",
            )}
            disabled={!isValid || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </div>
            ) : (
              "Konfirmasi Pesanan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
