import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentMethod = "cash" | "transfer" | "qris" | "midtrans" | "downpayment";
type PaymentStatus = "pending" | "paid" | "partial" | "failed" | "refunded";
type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "failed";

interface Props {
  searchCode: string;
  onSearchChange: (value: string) => void;
  filterStatus: OrderStatus | "all";
  onStatusChange: (value: OrderStatus | "all") => void;
  filterPaymentStatus: PaymentStatus | "all";
  onPaymentStatusChange: (value: PaymentStatus | "all") => void;
  filterPaymentMethod: PaymentMethod | "all";
  onPaymentMethodChange: (value: PaymentMethod | "all") => void;
}

export function HistoryFilters({
  searchCode,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPaymentStatus,
  onPaymentStatusChange,
  filterPaymentMethod,
  onPaymentMethodChange,
}: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Filter & Cari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search by order code */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode pesanan..."
            value={searchCode}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20"
          />
        </div>

        {/* Filter Status */}
        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20">
            <SelectValue placeholder="Status Pesanan" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Payment Status */}
        <Select
          value={filterPaymentStatus}
          onValueChange={onPaymentStatusChange}
        >
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20">
            <SelectValue placeholder="Status Pembayaran" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="partial">Kurang Bayar</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Payment Method */}
        <Select
          value={filterPaymentMethod}
          onValueChange={onPaymentMethodChange}
        >
          <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted/50 focus:border-heart-500 focus:ring-heart-500/20">
            <SelectValue placeholder="Metode Pembayaran" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Semua Metode</SelectItem>
            <SelectItem value="cash">Tunai</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="qris">QRIS</SelectItem>
            <SelectItem value="midtrans">Midtrans</SelectItem>
            <SelectItem value="downpayment">Uang Muka (DP)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
