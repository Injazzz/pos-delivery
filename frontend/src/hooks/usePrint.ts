import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface UsePrintOptions {
  documentTitle?: string;
  onBeforePrint?: () => void | Promise<void>;
  onAfterPrint?: () => void;
}

/**
 * Wrapper ringan untuk react-to-print.
 * Mengembalikan ref yang harus dipasang ke elemen yang akan dicetak.
 */
export function usePrint<T extends HTMLElement = HTMLDivElement>(
  opts: UsePrintOptions = {},
) {
  const ref = useRef<T>(null);

  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: opts.documentTitle ?? "Struk",
    onBeforePrint: opts.onBeforePrint
      ? async () => {
          await opts.onBeforePrint!();
        }
      : undefined,
    onAfterPrint: opts.onAfterPrint,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        html, body {
          width: 80mm;
          margin: 0;
          padding: 0;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return { ref, print: handlePrint };
}
