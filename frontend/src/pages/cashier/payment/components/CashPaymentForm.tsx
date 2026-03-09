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

  const cash = parseFloat(cashReceived) || 0;
  const change = cash - total;
  const isValid = cash >= total;

  const handleQuick = (amount: number) => {
    const rounded = Math.ceil(total / amount) * amount;
    setCashReceived(String(rounded));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Uang Diterima</Label>
        <div className="relative">
          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="number"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="0"
            disabled={isLoading}
            className="pl-9 bg-slate-800 border-slate-700 text-white text-lg font-bold h-12 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Quick amount buttons */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Nominal cepat:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amount) => {
            const rounded = Math.ceil(total / amount) * amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuick(amount)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rp {rounded.toLocaleString("id-ID")}
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
              : "bg-red-500/10 border-red-500/30",
          )}
        >
          <div className="flex items-center gap-2">
            <Calculator
              className={cn(
                "w-4 h-4",
                isValid ? "text-emerald-400" : "text-red-400",
              )}
            />
            <span className="text-sm font-medium text-white">
              {isValid ? "Kembalian" : "Kurang"}
            </span>
          </div>
          <span
            className={cn(
              "text-lg font-bold",
              isValid ? "text-emerald-400" : "text-red-400",
            )}
          >
            Rp {Math.abs(change).toLocaleString("id-ID")}
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
