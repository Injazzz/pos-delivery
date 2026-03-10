/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deliveriesApi } from "@/api/deliveries";
import type { Delivery } from "@/types/delivery";

interface Props {
  delivery: Delivery;
  open: boolean;
  onClose: () => void;
}

export function ProofPhotoCapture({ delivery, open, onClose }: Props) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (f: File) => deliveriesApi.uploadProof(delivery.id, f),
    onSuccess: () => {
      toast.success("Foto bukti berhasil diupload!");
      qc.invalidateQueries({ queryKey: ["courier-deliveries"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal upload foto."),
  });

  const handleFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleClose = () => {
    setPreview(null);
    setFile(null);
    onClose();
  };

  // Tambah timestamp overlay di preview (visual only)
  const now = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Foto Bukti Pengiriman
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300">
            📍 Foto akan otomatis ditambahkan watermark waktu dan nomor order.
          </div>

          {/* Preview area */}
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />

              {/* Simulated watermark overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-3 py-2">
                <p className="text-foreground text-xs font-mono">{now}</p>
                <p className="text-yellow-400 text-[10px] font-mono">
                  Order #{delivery.order?.order_code}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Camera capture (mobile) */}
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-colors bg-muted/50"
              >
                <Camera className="w-8 h-8 text-accent" />
                <span className="text-xs text-muted-foreground">Kamera</span>
              </button>

              {/* Gallery pick */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-colors bg-muted/50"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Galeri</span>
              </button>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-muted"
              onClick={handleClose}
            >
              Batal
            </Button>
            {preview && (
              <>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-emerald-50 font-bold gap-2"
                  disabled={mutation.isPending}
                  onClick={() => file && mutation.mutate(file)}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    "✓ Kirim Foto"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
