interface Props {
  totalOrders: number;
}

export function ReceiptFooter({ totalOrders }: Props) {
  return (
    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-3">
      <span>Total {totalOrders} order dapat dicetak ulang</span>
      <span>Halaman 1 dari 1</span>
    </div>
  );
}
