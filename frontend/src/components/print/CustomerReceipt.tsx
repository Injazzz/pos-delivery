import { forwardRef } from "react";
import { PrintLayout } from "./PrintLayout";

interface ReceiptData {
  store: {
    name: string;
    address: string;
    phone: string;
  };
  order: {
    id: number;
    order_code: string;
    type: string;
    table_number: string | null;
    created_at: string;
    notes: string | null;
    subtotal: number;
    discount_amount: number;
    total: number;
    delivery_fee?: number;
    delivery_address?: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
      notes: string | null;
    }>;
  };
  payment: {
    method: string;
    method_label: string;
    amount_paid: number;
    change_amount: number;
    is_partial: boolean;
    paid_amount: number;
    remaining: number;
  } | null;
  cashier: string;
}

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function Divider({
  char = "-",
  width = 40,
}: {
  char?: string;
  width?: number;
}) {
  return <div className="my-0.5">{char.repeat(width)}</div>;
}

export const CustomerReceipt = forwardRef<
  HTMLDivElement,
  { data: ReceiptData }
>(function CustomerReceipt({ data }, ref) {
  // Guard against undefined data
  if (!data?.order) {
    return <div className="p-4 text-red-600">Error: Data tidak tersedia</div>;
  }

  const date = new Date(data.order.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderTypeLabel: Record<string, string> = {
    dine_in: "Makan di Tempat",
    takeaway: "Dibawa Pulang",
    delivery: "Delivery",
  };

  return (
    <PrintLayout ref={ref}>
      {/* Header */}
      <div className="text-center py-1">
        <p className="text-base font-bold uppercase tracking-wide">
          {data.store.name}
        </p>
        <p className="text-[10px]">{data.store.address}</p>
        <p className="text-[10px]">{data.store.phone}</p>
      </div>

      <Divider />

      {/* Order info */}
      <div className="space-y-0.5">
        <Row left="No. Order" right={data.order.order_code} bold />
        <Row left="Tanggal" right={date} />
        <Row left="Kasir" right={data.cashier} />
        <Row
          left="Jenis"
          right={orderTypeLabel[data.order.type] ?? data.order.type}
        />
        {data.order.table_number && (
          <Row left="Meja" right={data.order.table_number} bold />
        )}
      </div>

      <Divider />

      {/* Items */}
      <div className="space-y-1.5">
        {data.order.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between gap-1">
              <span className="flex-1 font-semibold truncate">{item.name}</span>
              <span>{fmt(item.subtotal)}</span>
            </div>
            <div className="text-[10px] text-gray-600 pl-1">
              {item.quantity}x @ {fmt(item.price)}
            </div>
            {item.notes && (
              <div className="text-[10px] italic pl-1">* {item.notes}</div>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* Totals */}
      <div className="space-y-0.5">
        <Row left="Subtotal" right={fmt(data.order.subtotal)} />
        {data.order.discount_amount > 0 && (
          <Row left="Diskon" right={`-${fmt(data.order.discount_amount)}`} />
        )}
        {(data.order.delivery_fee ?? 0) > 0 && (
          <Row left="Ongkir" right={fmt(data.order.delivery_fee!)} />
        )}
      </div>

      <Divider char="=" />

      <Row left="TOTAL" right={fmt(data.order.total)} bold large />

      {/* Payment */}
      {data.payment && (
        <>
          <Divider />
          <div className="space-y-0.5">
            <Row left="Bayar" right={data.payment.method_label} />
            {data.payment.amount_paid > 0 && (
              <Row left="Jumlah Bayar" right={fmt(data.payment.amount_paid)} />
            )}
            {data.payment.change_amount > 0 && (
              <Row
                left="Kembalian"
                right={fmt(data.payment.change_amount)}
                bold
              />
            )}
            {data.payment.is_partial && (
              <>
                <Row
                  left="Sudah Dibayar"
                  right={fmt(data.payment.paid_amount)}
                />
                <Row
                  left="Sisa Tagihan"
                  right={fmt(data.payment.remaining)}
                  bold
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Delivery address */}
      {data.order.delivery_address && (
        <>
          <Divider />
          <div className="text-[10px]">
            <p className="font-bold">Alamat Pengiriman:</p>
            <p>{data.order.delivery_address}</p>
          </div>
        </>
      )}

      {/* Notes */}
      {data.order.notes && (
        <>
          <Divider />
          <p className="text-[10px] italic">Catatan: {data.order.notes}</p>
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-3 pb-2">
        <Divider />
        <p className="text-[10px] mt-1">Terima kasih atas kunjungan Anda!</p>
        <p className="text-[10px]">Selamat menikmati 😊</p>
        <div className="mt-1">{"* ".repeat(10)}</div>
      </div>
    </PrintLayout>
  );
});

// ── Helper components ─────────────────────────────────────────────────────────

function Row({
  left,
  right,
  bold = false,
  large = false,
}: {
  left: string;
  right: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-2 ${bold ? "font-bold" : ""} ${large ? "text-sm" : ""}`}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
