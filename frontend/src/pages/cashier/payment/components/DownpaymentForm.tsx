import { useState } from "react";
import {
  Wallet,
  Landmark,
  QrCode,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MidtransPayment } from "./MidtransPayment";
import type { MidtransResult } from "@/types/payment";

interface Props {
  total: number;
  isLoading: boolean;
  onSubmit: (amount: number, method: string) => void;
  isPartialPayment?: boolean;
  snapData?: MidtransResult | null;
  onMidtransSuccess?: () => void;
  onMidtransError?: () => void;
  onMidtransPending?: () => void;
}

const DP_PERCENTAGES = [25, 30, 50, 75];

const METHOD_ICONS: Record<string, LucideIcon> = {
  cash: Wallet,
  transfer: Landmark,
  qris: QrCode,
};

export function DownpaymentForm({
  total,
  isLoading,
  onSubmit,
  isPartialPayment = false,
  snapData,
  onMidtransSuccess,
  onMidtransError,
  onMidtransPending,
}: Props) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState("cash");

  // Show Midtrans payment if snap data is available and user selected midtrans
  const showMidtransPayment = snapData && method === "midtrans";

  // Validate total is a number
  const validTotal = typeof total === "number" && total > 0 ? total : 0;

  // Fungsi untuk memformat angka ke format Indonesia (dengan titik)
  const formatNumber = (value: string): string => {
    // Hapus semua karakter non-digit
    const numbers = value.replace(/\D/g, "");

    // Jika kosong, return string kosong
    if (!numbers) return "";

    // Format dengan titik sebagai pemisah ribuan
    return new Intl.NumberFormat("id-ID").format(parseInt(numbers));
  };

  // Fungsi untuk parse string berformat ke number
  const parseFormattedNumber = (formatted: string): number => {
    return parseInt(formatted.replace(/\D/g, "")) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(formatNumber(String(value)));
  };

  const dp = parseFormattedNumber(amount);
  const remaining = validTotal - dp;

  // Validation depends on whether this is initial DP or remaining payment
  const isValid = isPartialPayment
    ? dp > 0 && dp >= validTotal // For remaining payment, amount must be > 0 and >= remaining
    : dp > 0 && dp < validTotal; // For initial DP, amount must be between 0 and total

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const SelectedIcon = METHOD_ICONS[method] || Wallet;

  // If Midtrans payment is active, show the payment component
  if (showMidtransPayment && snapData) {
    return (
      <MidtransPayment
        snapData={snapData}
        onSuccess={onMidtransSuccess || (() => {})}
        onError={onMidtransError || (() => {})}
        onPending={onMidtransPending || (() => {})}
      />
    );
  }

  return (
    <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-glow-500/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-glow-500" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold">
            {isPartialPayment ? "Pembayaran Sisa" : "Down Payment (DP)"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isPartialPayment
              ? "Lunasi sisa pembayaran pesanan"
              : "Bayar uang muka untuk pesanan"}
          </p>
        </div>
      </div>

      {/* Quick DP percentages - only show for initial DP */}
      {!isPartialPayment && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Persentase DP</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DP_PERCENTAGES.map((pct) => {
              const amountValue = Math.round((validTotal * pct) / 100);
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickAmount(amountValue)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-2 rounded-lg bg-background border border-border",
                    "text-xs text-muted-foreground hover:text-foreground",
                    "hover:border-heart-500/50 hover:bg-muted transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <span className="block font-medium text-sm">{pct}%</span>
                  <span className="text-[9px] text-muted-foreground">
                    {formatCurrency(amountValue)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Amount input */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">
          {isPartialPayment ? "Jumlah Sisa Pembayaran" : "Jumlah DP"}
        </Label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={amount}
            onChange={handleInputChange}
            placeholder={
              isPartialPayment
                ? "Masukkan jumlah sisa pembayaran"
                : "Masukkan jumlah DP"
            }
            disabled={isLoading}
            className={cn(
              "pl-9 bg-background border-border text-foreground font-bold h-12",
              "focus:border-heart-500 focus:ring-heart-500/20 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "text-right", // Rata kanan untuk angka
            )}
          />
        </div>
      </div>

      {/* Method */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Metode Pembayaran</Label>
        <Select value={method} onValueChange={setMethod} disabled={isLoading}>
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem
              value="cash"
              className="text-foreground focus:bg-muted focus:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-heart-500" />
                <span>Tunai</span>
              </div>
            </SelectItem>
            {/* <SelectItem
              value="midtrans"
              className="text-foreground focus:bg-muted focus:text-foreground"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-earth-500" />
                <span>Midtrans</span>
              </div>
            </SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      {dp > 0 && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isPartialPayment ? "bg-emerald-500/20" : "bg-glow-500/20",
              )}
            >
              <SelectedIcon
                className={cn(
                  "w-3 h-3",
                  isPartialPayment ? "text-emerald-500" : "text-glow-500",
                )}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Ringkasan Pembayaran
            </span>
          </div>

          {isPartialPayment ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sisa Tagihan</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(validTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Pembayaran Sekarang
                </span>
                <span className="text-emerald-500 font-semibold">
                  {formatCurrency(dp)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-foreground font-medium">
                    Kekurangan
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      Math.max(0, validTotal - dp) === 0
                        ? "text-emerald-500"
                        : "text-glow-500",
                    )}
                  >
                    {formatCurrency(Math.max(0, validTotal - dp))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(validTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DP Dibayar</span>
                <span className="text-glow-500 font-semibold">
                  {formatCurrency(dp)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-foreground font-medium">
                    Sisa Tagihan
                  </span>
                  <span className="text-glow-500 font-bold">
                    {formatCurrency(Math.max(0, remaining))}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Progress bar */}
          {!isPartialPayment && validTotal > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>DP Terbayar</span>
                <span>{((dp / validTotal) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-glow-500 rounded-full transition-all duration-500"
                  style={{ width: `${(dp / validTotal) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        className={cn(
          "w-full h-12 text-white font-bold gap-2 transition-all",
          "bg-linear-to-r from-glow-500 to-glow-600 hover:from-glow-600 hover:to-glow-700",
          isLoading && "opacity-70 cursor-wait",
        )}
        disabled={!isValid || isLoading}
        onClick={() => onSubmit(dp, method)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Memproses...</span>
          </div>
        ) : (
          <>
            <span>✓</span>
            <span>
              {isPartialPayment
                ? "Konfirmasi Pelunasan"
                : "Konfirmasi Downpayment"}
            </span>
          </>
        )}
      </Button>

      {/* Info footer */}
      <p className="text-[10px] text-center text-muted-foreground">
        {isPartialPayment
          ? "Pastikan jumlah sisa pembayaran sudah benar"
          : "DP minimal 25% dari total tagihan"}
      </p>
    </div>
  );
}
