/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-4 space-y-3 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>ID Transaksi</span>
          <span className="text-white font-mono text-xs">
            {snapData.order_id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Jumlah</span>
          <span className="text-amber-400 font-bold">
            Rp {snapData.amount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300">
        Klik tombol di bawah untuk membuka halaman pembayaran Midtrans.
        Pelanggan bisa memilih metode: kartu kredit, Qris, Transfer, GoPay, OVO,
        Dana, ShopeePay, dan lainnya.
      </div>

      <Button
        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2"
        disabled={!snapLoaded || isOpening}
        onClick={openSnap}
      >
        {!snapLoaded || isOpening ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" /> Buka Halaman Pembayaran
          </>
        )}
      </Button>
    </div>
  );
}
