/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Web Serial API wrapper untuk thermal printer.
 * Hanya berfungsi di browser yang support Web Serial (Chrome/Edge desktop).
 */

// Import types dari @types/w3c-web-serial
/// <reference types="w3c-web-serial" />

type ParityType = "none" | "even" | "odd";

// Tipe yang sesuai dengan SerialOptions
type DataBitsType = 7 | 8;
type StopBitsType = 1 | 2;

export type PrinterStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "printing"
  | "error"
  | "unsupported";

export interface SerialPrinterConfig {
  baudRate?: number;
  dataBits?: DataBitsType;
  stopBits?: StopBitsType;
  parity?: ParityType;
}

interface StoredPrinterInfo {
  portId: string;
  vendorId?: number;
  productId?: number;
  lastConnected: number;
  deviceName?: string;
}

class ThermalPrinterManager {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  status: PrinterStatus = "idle";

  // Storage key
  private readonly STORAGE_KEY = "thermal_printer_last";

  get isSupported(): boolean {
    return "serial" in navigator;
  }

  get isConnected(): boolean {
    return this.status === "connected" || this.status === "printing";
  }

  /**
   * Auto-connect ke printer terakhir atau printer pertama yang ditemukan
   */
  async autoConnect(config: SerialPrinterConfig = {}): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      // Coba reconnect dari storage dulu
      const storedInfo = this.getStoredPrinterInfo();
      const ports = await navigator.serial.getPorts();

      if (ports.length === 0) return false;

      // Urutan prioritas:
      // 1. Port yang sama dengan yang terakhir dipakai
      // 2. Port pertama yang bisa dibuka

      // Cari port yang cocok dengan stored info
      if (storedInfo) {
        for (const port of ports) {
          const info = port.getInfo();
          if (
            info.usbVendorId === storedInfo.vendorId &&
            info.usbProductId === storedInfo.productId
          ) {
            // Coba buka port ini
            const success = await this.tryConnectPort(port, config);
            if (success) return true;
          }
        }
      }

      // Jika tidak ada yang cocok atau gagal, coba semua port
      for (const port of ports) {
        const success = await this.tryConnectPort(port, config);
        if (success) {
          // Simpan info untuk下次
          this.savePrinterInfo(port);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn("[ThermalPrinter] Auto-connect error:", error);
      return false;
    }
  }

  /**
   * Coba connect ke port tertentu
   */
  private async tryConnectPort(
    port: SerialPort,
    config: SerialPrinterConfig,
  ): Promise<boolean> {
    try {
      // Cek apakah port sudah dipakai
      if (this.port === port && this.isConnected) {
        return true;
      }

      // Validasi dan konversi nilai default
      const dataBits = this.validateDataBits(config.dataBits ?? 8);
      const stopBits = this.validateStopBits(config.stopBits ?? 1);

      await port.open({
        baudRate: config.baudRate ?? 9600,
        dataBits: dataBits,
        stopBits: stopBits,
        parity: config.parity ?? "none",
      });

      this.port = port;
      this.writer = port.writable!.getWriter();
      this.status = "connected";

      // Setup disconnect handler
      this.setupDisconnectHandler();

      return true;
    } catch {
      // Port mungkin sudah dipakai atau error lain
      return false;
    }
  }

  /**
   * Validasi nilai dataBits
   */
  private validateDataBits(value: number): 7 | 8 {
    if (value === 7) return 7;
    return 8; // default ke 8 jika bukan 7
  }

  /**
   * Validasi nilai stopBits
   */
  private validateStopBits(value: number): 1 | 2 {
    if (value === 2) return 2;
    return 1; // default ke 1 jika bukan 2
  }

  /**
   * Setup handler untuk disconnection
   */
  private setupDisconnectHandler(): void {
    if (!this.port) return;

    // Monitor jika port tiba-tiba disconnect
    const monitorDisconnect = async () => {
      try {
        while (this.port && this.status === "connected") {
          // Coba write dummy data untuk test connection
          await new Promise((resolve) => setTimeout(resolve, 5000));

          if (this.writer) {
            try {
              // Test connection dengan menulis empty buffer
              await this.writer.write(new Uint8Array([]));
            } catch {
              // Jika error, berarti disconnect
              this.handleDisconnect();
              break;
            }
          }
        }
      } catch {
        this.handleDisconnect();
      }
    };

    monitorDisconnect();
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(): void {
    if (this.status === "connected" || this.status === "printing") {
      this.status = "error";
      this.port = null;
      this.writer = null;

      // Coba reconnect setelah 3 detik
      setTimeout(() => {
        if (!this.isConnected) {
          this.autoConnect();
        }
      }, 3000);
    }
  }

  /**
   * Simpan info printer untuk auto-connect berikutnya
   */
  private savePrinterInfo(port: SerialPort): void {
    try {
      const info = port.getInfo();
      const printerInfo: StoredPrinterInfo = {
        portId: `${info.usbVendorId}-${info.usbProductId}-${Date.now()}`,
        vendorId: info.usbVendorId,
        productId: info.usbProductId,
        lastConnected: Date.now(),
        deviceName: this.getDeviceName(info),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(printerInfo));
    } catch (err) {
      console.warn("[ThermalPrinter] Failed to save printer info:", err);
    }
  }

  /**
   * Ambil info printer yang tersimpan
   */
  private getStoredPrinterInfo(): StoredPrinterInfo | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Dapatkan nama device dari vendor/product ID
   */
  private getDeviceName(info: {
    usbVendorId?: number;
    usbProductId?: number;
  }): string {
    const { usbVendorId, usbProductId } = info;

    // Database vendor printer umum
    const vendors: Record<number, string> = {
      0x04b8: "Epson",
      0x0519: "Star Micronics",
      0x1fc9: "Xprinter/SNBC",
      0x0fe6: "Generic Thermal",
      0x0416: "Bixolon",
      0x0dd4: "Citizen",
    };

    const vendorName = usbVendorId
      ? vendors[usbVendorId] || "Unknown"
      : "Unknown";
    return `${vendorName} ${usbProductId?.toString(16) || ""}`.trim();
  }

  /**
   * Minta izin & buka port serial (manual connect)
   */
  async connect(config: SerialPrinterConfig = {}): Promise<boolean> {
    if (!this.isSupported) {
      this.status = "unsupported";
      return false;
    }

    try {
      this.status = "connecting";

      // Minta user pilih port - TANPA FILTER, biar semua printer terlihat
      this.port = await navigator.serial.requestPort();

      // Validasi dan konversi nilai default
      const dataBits = this.validateDataBits(config.dataBits ?? 8);
      const stopBits = this.validateStopBits(config.stopBits ?? 1);

      await this.port.open({
        baudRate: config.baudRate ?? 9600,
        dataBits: dataBits,
        stopBits: stopBits,
        parity: config.parity ?? "none",
      });

      this.writer = this.port.writable!.getWriter();
      this.status = "connected";

      // Simpan info printer
      this.savePrinterInfo(this.port);
      this.setupDisconnectHandler();

      return true;
    } catch (err: any) {
      if (err?.name !== "NotFoundError" && err?.name !== "AbortError") {
        console.error("[ThermalPrinter] Connect error:", err);
      }
      this.status = "idle";
      return false;
    }
  }

  /**
   * Kirim buffer ESC/POS ke printer
   */
  async print(data: Uint8Array): Promise<boolean> {
    if (!this.writer) return false;

    try {
      this.status = "printing";
      await this.writer.write(data);
      this.status = "connected";
      return true;
    } catch (err) {
      console.error("[ThermalPrinter] Print error:", err);
      this.status = "error";

      // Trigger disconnect handling
      this.handleDisconnect();
      return false;
    }
  }

  /**
   * Disconnect manual
   */
  async disconnect(): Promise<void> {
    try {
      this.writer?.releaseLock();
      this.writer = null;
      await this.port?.close();
      this.port = null;
      this.status = "idle";
    } catch {
      // Ignore errors on disconnect
    }
  }

  /**
   * Hapus semua data tersimpan
   */
  clearStoredInfo(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Singleton
export const thermalPrinter = new ThermalPrinterManager();
