import { Skeleton } from "@/components/ui/skeleton";

export function ReceiptSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
            </div>
            <Skeleton className="h-8 w-20 bg-muted rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
