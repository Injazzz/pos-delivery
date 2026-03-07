/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Printer, Loader2, Usb, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="space-y-4">
      {/* Mode selector */}
      {serial.isSupported && (
        <div className="flex gap-2 p-1 bg-slate-800 rounded-xl">
          {[
            { mode: "window", label: "Browser Print", icon: Monitor },
            { mode: "serial", label: "USB Printer", icon: Usb },
          ].map(({ mode, label, icon: Icon }) => (
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
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all",
                printMode === mode
                  ? "bg-slate-700 text-white font-semibold shadow"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {mode === "serial" && serial.isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Print buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Struk Pelanggan",
            type: "customer" as const,
            color: "bg-blue-600 hover:bg-blue-500",
          },
          {
            label: "Struk Dapur",
            type: "kitchen" as const,
            color: "bg-orange-600 hover:bg-orange-500",
          },
          {
            label: "Cetak Semua",
            type: "both" as const,
            color: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold",
          },
        ].map((btn) => (
          <Button
            key={btn.type}
            disabled={isPrinting}
            className={cn("h-10 text-xs gap-1.5 text-white", btn.color)}
            onClick={() => handlePrint(btn.type)}
          >
            {isPrinting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{btn.label}</span>
          </Button>
        ))}
      </div>

      {/* Preview */}
      <Tabs defaultValue="customer">
        <TabsList className="bg-slate-800 border border-slate-700 w-full">
          <TabsTrigger
            value="customer"
            className="flex-1 text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            Struk Pelanggan
          </TabsTrigger>
          <TabsTrigger
            value="kitchen"
            className="flex-1 text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
          >
            Struk Dapur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-3">
          <div className="bg-white rounded-xl p-2 flex justify-center overflow-hidden">
            <CustomerReceipt ref={customerPreviewRef} data={data} />
          </div>
        </TabsContent>

        <TabsContent value="kitchen" className="mt-3">
          <div className="bg-white rounded-xl p-2 flex justify-center overflow-hidden">
            <KitchenReceipt ref={kitchenPreviewRef} data={data} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Done button */}
      <Button
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
        onClick={onDone}
      >
        ✓ Selesai — Order Berikutnya
      </Button>
    </div>
  );
}
