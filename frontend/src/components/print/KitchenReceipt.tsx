import { forwardRef } from "react";
import { PrintLayout } from "./PrintLayout";

interface KitchenReceiptProps {
  data: {
    order: {
      order_code: string;
      type: string;
      table_number: string | null;
      notes: string | null;
      created_at: string;
      items: Array<{
        name: string;
        quantity: number;
        notes: string | null;
      }>;
    };
  };
}

export const KitchenReceipt = forwardRef<HTMLDivElement, KitchenReceiptProps>(
  function KitchenReceipt({ data }, ref) {
    // Guard against undefined data
    if (!data?.order) {
      return <div className="p-4 text-red-600">Error: Data tidak tersedia</div>;
    }

    const time = new Date(data.order.created_at).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const typeMap: Record<string, string> = {
      dine_in: "MAKAN DI TEMPAT",
      takeaway: "BAWA PULANG",
      delivery: "DELIVERY",
    };

    return (
      <PrintLayout ref={ref}>
        {/* Header dapur */}
        <div className="text-center py-2">
          <p className="text-xl font-bold">** DAPUR **</p>
          <p className="text-[10px] mt-0.5">{time}</p>
        </div>

        {/* Order number besar */}
        <div className="text-center border-t border-b border-black py-2 my-1">
          <p className="text-2xl font-black tracking-widest">
            {data.order.order_code}
          </p>
          <p className="text-sm font-bold mt-1">
            {typeMap[data.order.type] ?? data.order.type}
          </p>
          {data.order.table_number && (
            <p className="text-xl font-black mt-1">
              MEJA: {data.order.table_number}
            </p>
          )}
        </div>

        {"=".repeat(40)}

        {/* Items — besar & jelas */}
        <div className="mt-2 space-y-3">
          {data.order.items.map((item, i) => (
            <div
              key={i}
              className="border-b border-dashed border-gray-400 pb-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl font-black w-8 shrink-0 text-right">
                  {item.quantity}x
                </span>
                <span className="text-base font-bold leading-tight">
                  {item.name}
                </span>
              </div>
              {item.notes && (
                <p className="text-sm italic pl-10 text-gray-700">
                  ↳ {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {"=".repeat(40)}

        {/* Order notes */}
        {data.order.notes && (
          <div className="mt-2 border border-black p-1.5">
            <p className="text-xs font-bold">CATATAN PESANAN:</p>
            <p className="text-sm">{data.order.notes}</p>
          </div>
        )}

        <div className="text-center mt-3 text-xs">
          {"-".repeat(40)}
          <p>Selesaikan segera!</p>
        </div>
      </PrintLayout>
    );
  },
);
