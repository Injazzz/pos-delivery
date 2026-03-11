/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  CreditCard,
  QrCode,
  Landmark,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MidtransResult } from "@/types/payment";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface Props {
  snapData: MidtransResult | null;
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
}

export function MidtransPayment({
  snapData,
  onSuccess,
  onPending,
  onError,
}: Props) {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const snapPayCalledRef = useRef(false);

  // Load Midtrans Snap.js dynamically
  useEffect(() => {
    if (!snapData) return;

    const existing = document.getElementById("midtrans-snap");
    if (existing) {
      setSnapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = snapData.is_production
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", snapData.client_key);
    script.onload = () => setSnapLoaded(true);
    document.head.appendChild(script);

    return () => {
      /* jangan remove, biarkan cached */
    };
  }, [snapData]);

  // Auto-open snap payment when loaded (with delay for safety)
  useEffect(() => {
    if (!snapLoaded || !snapData || snapPayCalledRef.current) return;
    if (!window.snap) return;

    // Add small delay to ensure snap is fully ready
    const timeout = setTimeout(() => {
      if (snapPayCalledRef.current) return;
      snapPayCalledRef.current = true;
      openSnap();
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapLoaded, snapData]);

  const openSnap = () => {
    if (!snapData || !window.snap) return;
    setIsOpening(true);

    window.snap.pay(snapData.snap_token, {
      onSuccess: () => {
        setIsOpening(false);
        onSuccess();
      },
      onPending: () => {
        setIsOpening(false);
        onPending();
      },
      onError: () => {
        setIsOpening(false);
        onError();
      },
      onClose: () => {
        setIsOpening(false);
      },
    });
  };

  if (!snapData) return null;

  return (
    <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-heart-500" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold">Midtrans Payment</h3>
          <p className="text-xs text-muted-foreground">
            Pembayaran online dengan berbagai metode
          </p>
        </div>
      </div>

      {/* Payment Info Card */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            ID Transaksi
          </span>
          <span className="text-foreground font-mono text-xs bg-background px-2 py-1 rounded border border-border">
            {snapData.order_id}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            Jumlah Pembayaran
          </span>
          <span className="text-heart-500 font-bold text-lg">
            Rp {snapData.amount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Available Payment Methods */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Metode Pembayaran:</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 border border-border rounded-lg">
            <CreditCard className="w-4 h-4 text-heart-500" />
            <span className="text-[8px] text-muted-foreground">Kartu</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 border border-border rounded-lg">
            <QrCode className="w-4 h-4 text-glow-500" />
            <span className="text-[8px] text-muted-foreground">QRIS</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 border border-border rounded-lg">
            <Landmark className="w-4 h-4 text-earth-500" />
            <span className="text-[8px] text-muted-foreground">Transfer</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 border border-border rounded-lg">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="text-[8px] text-muted-foreground">E-Wallet</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-heart-500/5 border border-heart-500/20 rounded-lg p-3 text-xs">
        <div className="flex items-start gap-2">
          <ExternalLink className="w-4 h-4 text-heart-500 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Klik tombol di bawah untuk membuka halaman pembayaran Midtrans.
            Pelanggan bisa memilih metode: kartu kredit, QRIS, Transfer Bank,
            GoPay, OVO, Dana, ShopeePay, dan lainnya.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <Button
        className={cn(
          "w-full h-12 text-white font-bold gap-2 transition-all",
          "bg-linear-to-r from-heart-500 to-heart-600 hover:from-heart-600 hover:to-heart-700",
          "relative overflow-hidden group",
          isOpening && "opacity-70 cursor-wait",
        )}
        disabled={isOpening}
        onClick={openSnap}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />

        {isOpening ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Membuka Pembayaran...</span>
          </>
        ) : !snapLoaded ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memuat Midtrans...</span>
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            <span>Buka Halaman Pembayaran</span>
          </>
        )}
      </Button>

      {/* Security Info */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>Pembayaran aman dengan Midtrans</span>
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>SSL Encrypted</span>
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
