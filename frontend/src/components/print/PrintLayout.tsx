import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Container thermal 80mm.
 * Semua receipt harus dibungkus dengan ini agar print layout konsisten.
 */
interface PrintLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  function PrintLayout({ children, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          // Screen: preview card
          "bg-white text-black font-mono text-[11px] leading-tight",
          "w-75.5 mx-auto", // 80mm ≈ 302px at 96dpi
          // Print: full width thermal
          "print:w-full print:mx-0",
          className,
        )}
        style={{ fontFamily: '"Courier New", Courier, monospace' }}
      >
        {children}
      </div>
    );
  },
);
