import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Menu, MenuImage } from "@/types/menu";

interface Props {
  menu: Menu | null;
  onOpenChange: (v: boolean) => void;
  onUpload: (menuId: number, files: File[]) => void;
  onDeleteImage: (menuId: number, mediaId: number) => void;
  isUploading: boolean;
  isDeleting: boolean;
}

export function MenuImageUploadDialog({
  menu,
  onOpenChange,
  onUpload,
  onDeleteImage,
  isUploading,
  isDeleting,
}: Props) {
  const [preview, setPreview] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const MAX_TOTAL = 5;
      const current = (menu?.images.length ?? 0) + preview.length;
      const canAdd = MAX_TOTAL - current;
      const toAdd = accepted.slice(0, canAdd);

      const newPreviews = toAdd.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
      }));
      setPreview((p) => [...p, ...newPreviews]);
    },
    [menu, preview],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 2 * 1024 * 1024, // 2MB
    disabled: isUploading,
  });

  const removePreview = (index: number) => {
    URL.revokeObjectURL(preview[index].url);
    setPreview((p) => p.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!menu || preview.length === 0) return;
    onUpload(
      menu.id,
      preview.map((p) => p.file),
    );
    setPreview([]);
  };

  const handleClose = () => {
    preview.forEach((p) => URL.revokeObjectURL(p.url));
    setPreview([]);
    onOpenChange(false);
  };

  const totalImages = (menu?.images.length ?? 0) + preview.length;
  const canAddMore = totalImages < 5;

  return (
    <Dialog open={!!menu} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Kelola Gambar Menu</DialogTitle>
          <DialogDescription className="text-slate-400">
            {menu?.name} — Maksimal 5 gambar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing images */}
          {menu && menu.images.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
                Gambar Tersimpan ({menu.images.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {menu.images.map((img: MenuImage) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800"
                  >
                    <img
                      src={img.thumb}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-7 h-7"
                        disabled={isDeleting}
                        onClick={() => menu && onDeleteImage(menu.id, img.id)}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview images to upload */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
                Akan Diupload ({preview.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {preview.map((p, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800"
                  >
                    <img
                      src={p.url}
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-7 h-7"
                        onClick={() => removePreview(i)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {/* New badge */}
                    <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded">
                      BARU
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone */}
          {canAddMore && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-slate-700 hover:border-slate-600 bg-slate-800/50",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                {isDragActive ? (
                  <Upload className="w-8 h-8 text-amber-400" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-500" />
                )}
                <p className="text-sm text-slate-400">
                  {isDragActive
                    ? "Lepaskan gambar di sini..."
                    : "Drag & drop atau klik untuk pilih gambar"}
                </p>
                <p className="text-xs text-slate-600">
                  JPG, PNG, WebP • Maks 2MB per file • Sisa slot:{" "}
                  {5 - totalImages}
                </p>
              </div>
            </div>
          )}

          {!canAddMore && (
            <p className="text-center text-xs text-amber-400 py-2">
              Batas maksimal 5 gambar tercapai. Hapus gambar lama untuk menambah
              yang baru.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={handleClose}
            >
              Tutup
            </Button>
            {preview.length > 0 && (
              <Button
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2"
                disabled={isUploading}
                onClick={handleUpload}
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUploading
                  ? "Mengupload..."
                  : `Upload ${preview.length} Gambar`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
