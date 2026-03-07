import { useState } from "react";
import { Wallet } from "lucide-react";
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

interface Props {
  total: number;
  isLoading: boolean;
  onSubmit: (amount: number, method: string) => void;
}

const DP_PERCENTAGES = [25, 30, 50, 75];

export function DownpaymentForm({ total, isLoading, onSubmit }: Props) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState("cash");

  const dp = parseFloat(amount) || 0;
  const remaining = total - dp;
  const isValid = dp > 0 && dp < total;

  return (
    <div className="space-y-4">
      {/* Quick DP percentages */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Persentase DP:</p>
        <div className="flex gap-2 flex-wrap">
          {DP_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setAmount(String(Math.round((total * pct) / 100)))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-300 hover:text-amber-400 transition-colors"
            >
              {pct}% = Rp{" "}
              {Math.round((total * pct) / 100).toLocaleString("id-ID")}
            </button>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Jumlah DP</Label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Masukkan jumlah DP"
            className="pl-9 bg-slate-800 border-slate-700 text-white font-bold h-12 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Method */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Metode Pembayaran DP</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="cash" className="text-slate-300">
              Tunai
            </SelectItem>
            <SelectItem value="transfer" className="text-slate-300">
              Transfer Bank
            </SelectItem>
            <SelectItem value="qris" className="text-slate-300">
              QRIS
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      {dp > 0 && (
        <div className="bg-slate-800 rounded-xl p-3 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Total Tagihan</span>
            <span className="text-white">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>DP Dibayar</span>
            <span className="text-amber-400 font-semibold">
              Rp {dp.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2">
            <span className="text-white font-medium">Sisa Tagihan</span>
            <span className="text-orange-400 font-bold">
              Rp {remaining.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      <Button
        className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
        disabled={!isValid || isLoading}
        onClick={() => onSubmit(dp, method)}
      >
        {isLoading ? "Memproses..." : "✓ Konfirmasi Downpayment"}
      </Button>
    </div>
  );
}
