import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ReceiptSearch({ value, onChange }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari kode order, nama pelanggan..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-heart-500 focus:ring-heart-500/20 transition-all"
        />
      </div>
    </div>
  );
}
