import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrint } from "@/hooks/usePrint";
import { useSerialPrinter } from "@/hooks/useSerialPrinter";
import { CustomerReceipt } from "./CustomerReceipt";
import { KitchenReceipt } from "./KitchenReceipt";
import apiClient from "@/lib/axios";

interface Props {
  orderId: number | null;
  onClose: () => void;
}

export function ReprintDialog({ orderId, onClose }: Props) {
  const customerRef = useRef<HTMLDivElement>(null);
  const kitchenRef = useRef<HTMLDivElement>(null);

  const { print: printCustomer } = usePrint({
    documentTitle: "Struk Pelanggan",
  });
  const { print: printKitchen } = usePrint({ documentTitle: "Struk Dapur" });

  const serial = useSerialPrinter();

  const { data, isLoading } = useQuery({
    queryKey: ["receipt", orderId],
    queryFn: () =>
      apiClient.get(`/orders/${orderId}/receipt`).then((r) => r.data.data),
    enabled: !!orderId,
  });

  const handleWindowPrint = (type: "customer" | "kitchen" | "both") => {
    if (type === "customer" || type === "both") {
      printCustomer();
    }
    if (type === "kitchen" || type === "both") {
      setTimeout(
        () => {
          printKitchen();
        },
        type === "both" ? 800 : 0,
      );
    }
  };

  const handleSerialPrint = async (type: "customer" | "kitchen" | "both") => {
    if (!data) return;
    if (type === "customer") await serial.printCustomerReceipt(data);
    if (type === "kitchen") await serial.printKitchenReceipt(data);
    if (type === "both") await serial.printBoth(data);
  };

  return (
    <Dialog open={!!orderId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            Cetak Struk — {data?.order?.order_code ?? "..."}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Print buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                className="h-10 bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5"
                onClick={() => handleWindowPrint("customer")}
              >
                <Printer className="w-3.5 h-3.5" /> Struk Pelanggan
              </Button>
              <Button
                className="h-10 bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5"
                onClick={() => handleWindowPrint("kitchen")}
              >
                <Printer className="w-3.5 h-3.5" /> Struk Dapur
              </Button>
              <Button
                className="h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                onClick={() => handleWindowPrint("both")}
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Semua
              </Button>
            </div>

            {/* ESC/POS section */}
            {serial.isSupported && (
              <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">
                    Direct Print (USB/Serial)
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        serial.isConnected ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500">
                      {serial.status === "connected"
                        ? "Terhubung"
                        : serial.status === "connecting"
                          ? "Menghubungkan..."
                          : serial.status === "printing"
                            ? "Mencetak..."
                            : "Tidak terhubung"}
                    </span>
                  </div>
                </div>

                {!serial.isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                    onClick={serial.connect}
                  >
                    🔌 Hubungkan Printer USB
                  </Button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Pelanggan",
                        fn: () => handleSerialPrint("customer"),
                      },
                      {
                        label: "Dapur",
                        fn: () => handleSerialPrint("kitchen"),
                      },
                      { label: "Semua", fn: () => handleSerialPrint("both") },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                        disabled={serial.status === "printing"}
                        onClick={btn.fn}
                      >
                        {serial.status === "printing" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          btn.label
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preview tabs */}
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
                <div className="bg-white rounded-xl overflow-hidden p-2 flex justify-center">
                  <CustomerReceipt ref={customerRef} data={data} />
                </div>
              </TabsContent>

              <TabsContent value="kitchen" className="mt-3">
                <div className="bg-white rounded-xl overflow-hidden p-2 flex justify-center">
                  <KitchenReceipt ref={kitchenRef} data={data} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">
            Data struk tidak ditemukan.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
