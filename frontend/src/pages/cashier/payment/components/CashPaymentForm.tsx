import { useState } from "react";
import { Banknote, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  isLoading: boolean;
  onSubmit: (cashReceived: number) => void;
}

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

export function CashPaymentForm({ total, isLoading, onSubmit }: Props) {
  const [cashReceived, setCashReceived] = useState<string>("");

  // Fungsi untuk memformat angka ke format Indonesia (dengan titik)
  const formatNumber = (value: string): string => {
    // Hapus semua karakter non-digit
    const numbers = value.replace(/\D/g, "");

    // Jika kosong, return string kosong
    if (!numbers) return "";

    // Format dengan titik sebagai pemisah ribuan
    return new Intl.NumberFormat("id-ID").format(parseInt(numbers));
  };

  // Fungsi untuk mengubah string berformat ke number
  const parseFormattedNumber = (formatted: string): number => {
    // Hapus semua karakter non-digit dan convert ke number
    return parseInt(formatted.replace(/\D/g, "")) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setCashReceived(formatted);
  };

  const cash = parseFormattedNumber(cashReceived);
  const change = cash - total;
  const isValid = cash >= total;

  const handleQuick = (amount: number) => {
    const rounded = Math.ceil(total / amount) * amount;
    setCashReceived(formatNumber(String(rounded)));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4 bg-card p-6 rounded-xl shadow-md border border-border">
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Uang Diterima</Label>
        <div className="relative">
          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={cashReceived}
            onChange={handleInputChange}
            placeholder="0"
            disabled={isLoading}
            className="pl-9 bg-background border-border text-foreground text-lg font-bold h-12 focus:border-heart-500 disabled:opacity-50 disabled:cursor-not-allowed text-right"
          />
        </div>
      </div>

      {/* Quick amount buttons */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Nominal cepat:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amount) => {
            const rounded = Math.ceil(total / amount) * amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuick(amount)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-background border border-border hover:border-heart-500/50 text-xs text-muted-foreground hover:text-heart-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rp {formatCurrency(rounded).replace("Rp", "").trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kembalian */}
      {cash > 0 && (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-xl border",
            isValid
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-destructive/10 border-destructive/30",
          )}
        >
          <div className="flex items-center gap-2">
            <Calculator
              className={cn(
                "w-4 h-4",
                isValid ? "text-emerald-500" : "text-destructive",
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {isValid ? "Kembalian" : "Kurang"}
            </span>
          </div>
          <span
            className={cn(
              "text-lg font-bold",
              isValid ? "text-emerald-500" : "text-destructive",
            )}
          >
            {formatCurrency(Math.abs(change))}
          </span>
        </div>
      )}

      <Button
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base gap-2"
        disabled={!isValid || isLoading}
        onClick={() => onSubmit(cash)}
      >
        {isLoading ? "Memproses..." : "✓ Konfirmasi Pembayaran Tunai"}
      </Button>
    </div>
  );
}
