import { Banknote, QrCode, Building2, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";

const METHODS: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ElementType;
  desc: string;
  color: string;
}> = [
  {
    value: "cash",
    label: "Tunai",
    icon: Banknote,
    desc: "Bayar langsung",
    color: "text-emerald-400",
  },
  {
    value: "qris",
    label: "QRIS",
    icon: QrCode,
    desc: "Scan kode QR",
    color: "text-blue-400",
  },
  {
    value: "transfer",
    label: "Transfer Bank",
    icon: Building2,
    desc: "Transfer rekening",
    color: "text-violet-400",
  },
  {
    value: "midtrans",
    label: "Midtrans",
    icon: CreditCard,
    desc: "Kartu/e-wallet online",
    color: "text-amber-400",
  },
  {
    value: "downpayment",
    label: "Uang Muka (DP)",
    icon: Wallet,
    desc: "Bayar sebagian dulu",
    color: "text-orange-400",
  },
];

interface Props {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {METHODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onSelect(m.value)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all",
            selected === m.value
              ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
              : "bg-slate-800 border-slate-700 hover:border-slate-600",
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              selected === m.value ? "bg-amber-500/20" : "bg-slate-700",
            )}
          >
            <m.icon
              className={cn(
                "w-5 h-5",
                selected === m.value ? "text-amber-400" : m.color,
              )}
            />
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-semibold",
                selected === m.value ? "text-amber-400" : "text-white",
              )}
            >
              {m.label}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
