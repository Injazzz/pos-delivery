/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useEffect, useRef } from "react";
import { thermalPrinter } from "@/lib/thermalPrinter";
import { buildCustomerReceipt, buildKitchenReceipt } from "@/lib/escpos";
import type { PrinterStatus } from "@/lib/thermalPrinter";

export function useSerialPrinter() {
  const [status, setStatus] = useState<PrinterStatus>(
    thermalPrinter.isSupported ? "idle" : "unsupported",
  );

  const [lastError, setLastError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Update status dari thermalPrinter
  useEffect(() => {
    mountedRef.current = true;

    // Polling status setiap 500ms
    const interval = setInterval(() => {
      if (mountedRef.current) {
        setStatus(thermalPrinter.status);
      }
    }, 500);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-connect saat mount
  useEffect(() => {
    if (!thermalPrinter.isSupported) return;

    let isSubscribed = true;

    const doAutoConnect = async () => {
      try {
        const ok = await thermalPrinter.autoConnect();
        if (isSubscribed && ok) {
          setStatus("connected");
          setLastError(null);
        }
      } catch (error) {
        if (isSubscribed) {
          setLastError("Auto-connect failed");
        }
      }
    };

    doAutoConnect();

    return () => {
      isSubscribed = false;
      thermalPrinter.disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    setLastError(null);
    try {
      const ok = await thermalPrinter.connect();
      setStatus(ok ? "connected" : "idle");
      if (!ok) setLastError("Failed to connect");
      return ok;
    } catch (error) {
      setLastError("Connection error");
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await thermalPrinter.disconnect();
    setStatus("idle");
    setLastError(null);
  }, []);

  const printCustomerReceipt = useCallback(async (receiptData: any) => {
    setLastError(null);

    if (!thermalPrinter.isConnected) {
      const ok = await thermalPrinter.connect();
      if (!ok) {
        setLastError("Printer not connected");
        return false;
      }
    }

    try {
      const buffer = buildCustomerReceipt(receiptData);
      const ok = await thermalPrinter.print(buffer);
      setStatus(thermalPrinter.status);
      if (!ok) setLastError("Print failed");
      return ok;
    } catch (error) {
      setLastError("Print error");
      return false;
    }
  }, []);

  const printKitchenReceipt = useCallback(async (receiptData: any) => {
    setLastError(null);

    if (!thermalPrinter.isConnected) {
      const ok = await thermalPrinter.connect();
      if (!ok) {
        setLastError("Printer not connected");
        return false;
      }
    }

    try {
      const buffer = buildKitchenReceipt(receiptData);
      const ok = await thermalPrinter.print(buffer);
      setStatus(thermalPrinter.status);
      if (!ok) setLastError("Print failed");
      return ok;
    } catch (error) {
      setLastError("Print error");
      return false;
    }
  }, []);

  const printBoth = useCallback(async (receiptData: any) => {
    setLastError(null);

    if (!thermalPrinter.isConnected) {
      const ok = await thermalPrinter.connect();
      if (!ok) {
        setLastError("Printer not connected");
        return false;
      }
    }

    try {
      const customerBuf = buildCustomerReceipt(receiptData);
      const kitchenBuf = buildKitchenReceipt(receiptData);

      const combined = new Uint8Array(customerBuf.length + kitchenBuf.length);
      combined.set(customerBuf, 0);
      combined.set(kitchenBuf, customerBuf.length);

      const ok = await thermalPrinter.print(combined);
      setStatus(thermalPrinter.status);
      if (!ok) setLastError("Print failed");
      return ok;
    } catch (error) {
      setLastError("Print error");
      return false;
    }
  }, []);

  const clearStoredInfo = useCallback(() => {
    thermalPrinter.clearStoredInfo();
  }, []);

  return {
    status,
    isSupported: thermalPrinter.isSupported,
    isConnected: thermalPrinter.isConnected,
    lastError,
    connect,
    disconnect,
    printCustomerReceipt,
    printKitchenReceipt,
    printBoth,
    clearStoredInfo,
  };
}
