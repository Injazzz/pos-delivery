/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/escpos.ts

/**
 * ESC/POS command constants & builder
 * Compatible dengan: Epson TM-T82, SNBC BTP-R880NP,
 *                    Xprinter XP-58, dan printer thermal umum.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const ESC = 0x1b;
export const GS = 0x1d;
export const FS = 0x1c;
export const LF = 0x0a;
export const CR = 0x0d;
export const HT = 0x09;

// Init & reset
export const INIT = [ESC, 0x40];
export const RESET = [ESC, 0x40];

// Text align
export const ALIGN_LEFT = [ESC, 0x61, 0x00];
export const ALIGN_CENTER = [ESC, 0x61, 0x01];
export const ALIGN_RIGHT = [ESC, 0x61, 0x02];

// Font size
export const FONT_NORMAL = [GS, 0x21, 0x00];
export const FONT_DOUBLE_W = [GS, 0x21, 0x10];
export const FONT_DOUBLE_H = [GS, 0x21, 0x01];
export const FONT_DOUBLE = [GS, 0x21, 0x11];

// Bold
export const BOLD_ON = [ESC, 0x45, 0x01];
export const BOLD_OFF = [ESC, 0x45, 0x00];

// Underline
export const UNDERLINE_ON = [ESC, 0x2d, 0x01];
export const UNDERLINE_OFF = [ESC, 0x2d, 0x00];

// Cut paper
export const CUT_FULL = [GS, 0x56, 0x00];
export const CUT_PARTIAL = [GS, 0x56, 0x01];

// Cash drawer
export const CASH_DRAWER = [ESC, 0x70, 0x00, 0x19, 0xfa];

// Feed
export const FEED_1 = [ESC, 0x64, 0x01];
export const FEED_3 = [ESC, 0x64, 0x03];
export const FEED_5 = [ESC, 0x64, 0x05];

// ── Builder class ─────────────────────────────────────────────────────────────

export class EscPosBuilder {
  private buffer: number[] = [];

  // Flush buffer ke Uint8Array
  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  private push(...cmds: number[][]): this {
    for (const cmd of cmds) this.buffer.push(...cmd);
    return this;
  }

  private text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  // ── Public methods ──────────────────────────────────────────────────────────

  init(): this {
    return this.push(INIT);
  }
  lf(n = 1): this {
    for (let i = 0; i < n; i++) this.buffer.push(LF);
    return this;
  }
  cut(): this {
    return this.push(FEED_3, CUT_PARTIAL);
  }
  cashDrawer(): this {
    return this.push(CASH_DRAWER);
  }

  alignLeft(): this {
    return this.push(ALIGN_LEFT);
  }
  alignCenter(): this {
    return this.push(ALIGN_CENTER);
  }
  alignRight(): this {
    return this.push(ALIGN_RIGHT);
  }

  bold(on = true): this {
    return this.push(on ? BOLD_ON : BOLD_OFF);
  }
  fontSize(size: "normal" | "double-w" | "double-h" | "double"): this {
    const map = {
      normal: FONT_NORMAL,
      "double-w": FONT_DOUBLE_W,
      "double-h": FONT_DOUBLE_H,
      double: FONT_DOUBLE,
    };
    return this.push(map[size]);
  }

  println(str: string): this {
    return this.text(str).lf();
  }

  divider(char = "-", width = 42): this {
    return this.println(char.repeat(width));
  }

  // Kolom kiri + kanan (untuk item + harga)
  columns(left: string, right: string, width = 42): this {
    const pad = width - right.length;
    const line = left.substring(0, pad).padEnd(pad) + right;
    return this.println(line);
  }

  // Header toko
  storeHeader(name: string, address: string, phone: string): this {
    return this.alignCenter()
      .bold(true)
      .fontSize("double-w")
      .println(name)
      .fontSize("normal")
      .bold(false)
      .println(address)
      .println(phone)
      .alignLeft();
  }

  // Receipt header info
  receiptInfo(orderCode: string, dateStr: string, cashier: string): this {
    return this.divider()
      .columns("No. Order:", orderCode)
      .columns("Tanggal:", dateStr)
      .columns("Kasir:", cashier)
      .divider();
  }

  // Satu item order
  item(name: string, qty: number, price: number, subtotal: number): this {
    const formatter = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

    this.println(name.substring(0, 30));
    this.columns(`  ${qty}x ${formatter(price)}`, formatter(subtotal));
    return this;
  }

  // Totals section
  totals(opts: {
    subtotal: number;
    discount?: number;
    tax?: number;
    delivery?: number;
    total: number;
    paid?: number;
    change?: number;
  }): this {
    const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
    const { subtotal, discount, tax, delivery, total, paid, change } = opts;

    this.divider();
    this.columns("Subtotal:", fmt(subtotal));
    if (discount) this.columns("Diskon:", `-${fmt(discount)}`);
    if (tax) this.columns("Pajak:", fmt(tax));
    if (delivery) this.columns("Ongkir:", fmt(delivery));
    this.divider("-", 42);
    this.bold(true);
    this.fontSize("double-w");
    this.columns("TOTAL:", fmt(total));
    this.fontSize("normal");
    this.bold(false);

    if (paid !== undefined) {
      this.divider();
      this.columns("Tunai:", fmt(paid));
      this.bold(true);
      this.columns("Kembalian:", fmt(change ?? 0));
      this.bold(false);
    }
    return this;
  }

  // Footer
  footer(message = "Terima kasih atas kunjungan Anda!"): this {
    return this.lf()
      .alignCenter()
      .println(message)
      .println("*".repeat(16))
      .alignLeft();
  }
}

// ── Helper: format receipt data → EscPos buffer ───────────────────────────────

export function buildCustomerReceipt(data: any): Uint8Array {
  const b = new EscPosBuilder();
  const date = new Date(data.order.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  b.init();
  b.storeHeader(
    data.store.name ?? "Toko",
    data.store.address ?? "",
    data.store.phone ?? "",
  );
  b.receiptInfo(data.order.order_code, date, data.cashier ?? "-");

  data.order.items.forEach((item: any) => {
    b.item(item.name, item.quantity, item.price, item.subtotal);
  });

  b.totals({
    subtotal: data.order.subtotal,
    discount: data.order.discount_amount,
    total: data.order.total,
    paid: data.payment?.amount_paid,
    change: data.payment?.change_amount,
  });

  if (data.order.delivery_address) {
    b.lf();
    b.println("Alamat Pengiriman:");
    b.println(data.order.delivery_address.substring(0, 42));
  }

  b.footer();
  b.cut();

  return b.build();
}

export function buildKitchenReceipt(data: any): Uint8Array {
  const b = new EscPosBuilder();
  const date = new Date(data.order.created_at).toLocaleString("id-ID", {
    timeStyle: "short",
  });

  b.init();
  b.alignCenter();
  b.bold(true);
  b.fontSize("double");
  b.println("** DAPUR **");
  b.fontSize("normal");
  b.bold(false);
  b.lf();

  b.alignLeft();
  b.bold(true);
  b.fontSize("double-w");
  b.println(data.order.order_code);
  b.fontSize("normal");
  b.bold(false);

  b.columns("Waktu:", date);
  b.columns(
    "Jenis:",
    data.order.type === "dine_in"
      ? "Makan di Tempat"
      : data.order.type === "takeaway"
        ? "Dibawa Pulang"
        : "Delivery",
  );
  if (data.order.table_number) {
    b.bold(true);
    b.columns("MEJA:", data.order.table_number);
    b.bold(false);
  }
  b.divider("=");

  data.order.items.forEach((item: any) => {
    b.bold(true);
    b.fontSize("double-h");
    b.println(`${item.quantity}x ${item.name}`);
    b.fontSize("normal");
    b.bold(false);
    if (item.notes) {
      b.println(`   >> ${item.notes}`);
    }
    b.lf();
  });

  b.divider("=");
  if (data.order.notes) {
    b.println(`Catatan: ${data.order.notes}`);
  }
  b.cut();

  return b.build();
}
