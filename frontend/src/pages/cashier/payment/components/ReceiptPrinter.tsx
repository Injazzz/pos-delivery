/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import {
  Printer,
  Loader2,
  Usb,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CustomerReceipt } from "@/components/print/CustomerReceipt";
import { KitchenReceipt } from "@/components/print/KitchenReceipt";
import { usePrint } from "@/hooks/usePrint";
import { useSerialPrinter } from "@/hooks/useSerialPrinter";
import { cn } from "@/lib/utils";

interface Props {
  data: any;
  onDone: () => void;
}

export function ReceiptPrinter({ data, onDone }: Props) {
  // Kita masih perlu ref untuk preview
  const customerPreviewRef = useRef<HTMLDivElement>(null);
  const kitchenPreviewRef = useRef<HTMLDivElement>(null);

  // Hook untuk print
  const { print: printCustomer } = usePrint({
    documentTitle: "Struk Pelanggan",
  });
  const { print: printKitchen } = usePrint({
    documentTitle: "Struk Dapur",
  });

  const serial = useSerialPrinter();
  const [printMode, setPrintMode] = useState<"window" | "serial">("window");

  const handlePrint = async (type: "customer" | "kitchen" | "both") => {
    if (printMode === "serial") {
      if (type === "customer") await serial.printCustomerReceipt(data);
      if (type === "kitchen") await serial.printKitchenReceipt(data);
      if (type === "both") await serial.printBoth(data);
      return;
    }

    // window.print() - panggil fungsi print langsung tanpa argumen
    if (type === "customer" || type === "both") {
      printCustomer(); // ✅ Langsung panggil, tanpa argumen
    }
    if (type === "kitchen") {
      printKitchen(); // ✅ Langsung panggil, tanpa argumen
    }
    if (type === "both") {
      // Print customer dulu, lalu kitchen setelah delay
      printCustomer();
      setTimeout(() => printKitchen(), 900);
    }
  };

  const isPrinting = serial.status === "printing";

  return (
    <div className="space-y-5 bg-card p-6 rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
          <Printer className="w-5 h-5 text-heart-500" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold">Cetak Struk</h3>
          <p className="text-xs text-muted-foreground">
            Pilih printer dan jenis struk yang akan dicetak
          </p>
        </div>
      </div>

      {/* Mode selector */}
      {serial.isSupported && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Metode Cetak</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                mode: "window",
                label: "Browser Print",
                icon: Monitor,
                desc: "Cetak melalui dialog browser",
                color: "text-heart-500",
              },
              {
                mode: "serial",
                label: "USB Printer",
                icon: Usb,
                desc: "Cetak langsung ke printer USB",
                color: "text-emerald-500",
              },
            ].map(({ mode, label, icon: Icon, desc, color }) => {
              const isActive = printMode === mode;
              const isConnected = mode === "serial" && serial.isConnected;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPrintMode(mode as "window" | "serial");
                    if (mode === "serial" && !serial.isConnected) {
                      serial.connect();
                    }
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                    isActive
                      ? "border-heart-500/50 bg-heart-500/5"
                      : "border-border bg-card hover:border-heart-500/30 hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isActive ? "bg-heart-500/10" : "bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? color : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isActive ? color : "text-foreground",
                        )}
                      >
                        {label}
                      </p>
                      {isConnected && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[8px]">
                          <CheckCircle2 className="w-2 h-2 mr-0.5" />
                          Terhubung
                        </Badge>
                      )}
                      {mode === "serial" && !serial.isConnected && isActive && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[8px]">
                          <AlertCircle className="w-2 h-2 mr-0.5" />
                          Tidak terhubung
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Print buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Pilih Jenis Struk</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              label: "Struk Pelanggan",
              type: "customer" as const,
              icon: Printer,
              color: "text-heart-500",
              bg: "bg-heart-500",
              desc: "Untuk pelanggan",
            },
            {
              label: "Struk Dapur",
              type: "kitchen" as const,
              icon: Printer,
              color: "text-glow-500",
              bg: "bg-glow-500",
              desc: "Untuk dapur/koki",
            },
            {
              label: "Cetak Semua",
              type: "both" as const,
              icon: Printer,
              color: "text-emerald-500",
              bg: "bg-emerald-500",
              desc: "Cetak kedua struk",
            },
          ].map((btn) => (
            <Button
              key={btn.type}
              disabled={isPrinting}
              className={cn(
                "h-auto py-3 px-4 flex-col items-start gap-1 text-white",
                "hover:scale-105 transition-all",
                btn.bg,
              )}
              onClick={() => handlePrint(btn.type)}
            >
              <div className="flex items-center gap-2 w-full">
                {isPrinting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">{btn.label}</span>
              </div>
              <span className="text-[10px] text-white/80">{btn.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span>Preview Struk</span>
        </p>
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="bg-muted/50 border border-border w-full p-1">
            <TabsTrigger
              value="customer"
              className="flex-1 text-xs data-[state=active]:bg-heart-500 data-[state=active]:text-white text-muted-foreground"
            >
              Struk Pelanggan
            </TabsTrigger>
            <TabsTrigger
              value="kitchen"
              className="flex-1 text-xs data-[state=active]:bg-glow-500 data-[state=active]:text-white text-muted-foreground"
            >
              Struk Dapur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="mt-3">
            <div className="bg-white rounded-xl p-3 flex justify-center overflow-hidden border border-border">
              <CustomerReceipt ref={customerPreviewRef} data={data} />
            </div>
          </TabsContent>

          <TabsContent value="kitchen" className="mt-3">
            <div className="bg-white rounded-xl p-3 flex justify-center overflow-hidden border border-border">
              <KitchenReceipt ref={kitchenPreviewRef} data={data} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Done button */}
      <Button
        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm gap-2"
        onClick={onDone}
      >
        <CheckCircle2 className="w-4 h-4" />
        Selesai — Order Berikutnya
      </Button>
    </div>
  );
}
