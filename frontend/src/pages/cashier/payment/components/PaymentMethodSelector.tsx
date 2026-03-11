import { Banknote, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payment";

const METHODS: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ElementType;
  desc: string;
  color: string;
  bgColor: string;
}> = [
  {
    value: "cash",
    label: "Tunai",
    icon: Banknote,
    desc: "Bayar langsung",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  // {
  //   value: "qris",
  //   label: "QRIS",
  //   icon: QrCode,
  //   desc: "Scan kode QR",
  //   color: "text-blue-400",
  //   bgColor: "bg-blue-400/10",
  // },
  // {
  //   value: "transfer",
  //   label: "Transfer Bank",
  //   icon: Building2,
  //   desc: "Transfer rekening",
  //   color: "text-violet-400",
  //   bgColor: "bg-violet-400/10",
  // },
  {
    value: "midtrans",
    label: "Midtrans",
    icon: CreditCard,
    desc: "Qris/Transfer/e-wallet",
    color: "text-heart-500",
    bgColor: "bg-heart-500/10",
  },
  {
    value: "downpayment",
    label: "Uang Muka (DP)",
    icon: Wallet,
    desc: "Bayar sebagian",
    color: "text-glow-500",
    bgColor: "bg-glow-500/10",
  },
];

interface Props {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
  allowDownpaymentRemaining?: boolean;
}

export function PaymentMethodSelector({
  selected,
  onSelect,
  disabled = false,
  allowDownpaymentRemaining = false,
}: Props) {
  // If only downpayment remaining is allowed, only show downpayment
  if (allowDownpaymentRemaining) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-muted-foreground text-sm mb-2">Pembayaran Sisa:</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-glow-500/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-glow-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Uang Muka (DP)
            </p>
            <p className="text-xs text-glow-500">Pelunasan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {METHODS.map((m) => {
        const isSelected = selected === m.value;

        return (
          <button
            key={m.value}
            type="button"
            onClick={() => !disabled && onSelect(m.value)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl border-2 text-center transition-all",
              "hover:shadow-lg",
              disabled && "opacity-50 cursor-not-allowed",
              isSelected
                ? [
                    m.bgColor,
                    `border-${m.color.replace("text-", "")}/30`,
                    "shadow-lg",
                  ]
                : "bg-card border-border hover:border-heart-500/30 hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isSelected ? m.bgColor : "bg-muted",
              )}
            >
              <m.icon
                className={cn(
                  "w-6 h-6",
                  isSelected ? m.color : "text-muted-foreground",
                )}
              />
            </div>

            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? m.color : "text-foreground",
                )}
              >
                {m.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
