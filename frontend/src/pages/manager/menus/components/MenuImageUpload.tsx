import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Trash2,
  Upload,
  ImageIcon,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  GalleryVerticalEnd,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  const [uploadProgress, setUploadProgress] = useState(0);

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

      // Simulasi progress (untuk demo, nanti bisa diintegrasi dengan real progress)
      if (toAdd.length > 0) {
        setUploadProgress(0);
      }
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

    // Simulasi progress (untuk demo)
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    onUpload(
      menu.id,
      preview.map((p) => p.file),
    );

    // Reset setelah upload selesai
    setTimeout(() => {
      setPreview([]);
      setUploadProgress(0);
    }, 1000);
  };

  const handleClose = () => {
    preview.forEach((p) => URL.revokeObjectURL(p.url));
    setPreview([]);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const totalImages = (menu?.images.length ?? 0) + preview.length;
  const canAddMore = totalImages < 5;
  const remainingSlots = 5 - totalImages;

  return (
    <Dialog open={!!menu} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-heart-500/20 flex items-center justify-center">
              <GalleryVerticalEnd className="w-5 h-5 text-heart-500" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">
                Kelola Gambar Menu
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {menu?.name} — Maksimal 5 gambar per menu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Stats */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Tersimpan:
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {menu?.images.length || 0}
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Baru:</span>
                <span className="text-sm font-semibold text-heart-500">
                  {preview.length}
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Sisa slot:
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    remainingSlots > 0
                      ? "text-emerald-500"
                      : "text-destructive",
                  )}
                >
                  {remainingSlots}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-24">
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}
          </div>

          {/* Existing images */}
          {menu && menu.images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Gambar Tersimpan
                </p>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {menu.images.length}/5
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {menu.images.map((img: MenuImage, index) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-heart-500/30 transition-all"
                  >
                    <img
                      src={img.thumb}
                      alt={`Menu ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8 shadow-lg"
                        disabled={isDeleting}
                        onClick={() => menu && onDeleteImage(menu.id, img.id)}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {/* Image number badge */}
                    <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm text-foreground text-[8px] px-1.5 py-0.5 rounded-full border border-border">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview images to upload */}
          {preview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Akan Diupload
                </p>
                <span className="text-[10px] bg-heart-500/10 text-heart-500 px-2 py-0.5 rounded-full">
                  {preview.length} gambar baru
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {preview.map((p, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted border-2 border-heart-500/30"
                  >
                    <img
                      src={p.url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8 shadow-lg"
                        onClick={() => removePreview(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* New badge */}
                    <div className="absolute top-1 left-1 bg-heart-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      BARU
                    </div>
                    {/* Remove button on top right (alternative) */}
                    <button
                      onClick={() => removePreview(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/90 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone */}
          {canAddMore ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-heart-500 bg-heart-500/5 scale-[1.02]"
                  : "border-border hover:border-heart-500/50 hover:bg-muted/50",
                isUploading &&
                  "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                    isDragActive ? "bg-heart-500/20 scale-110" : "bg-muted",
                  )}
                >
                  {isDragActive ? (
                    <Upload className="w-8 h-8 text-heart-500" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isDragActive
                      ? "Lepaskan gambar di sini"
                      : "Drag & drop atau klik untuk pilih gambar"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP • Maks 2MB per file
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  <span>Sisa slot: {remainingSlots} dari 5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">
                  Batas maksimal 5 gambar tercapai
                </p>
                <p className="text-xs text-muted-foreground">
                  Hapus gambar lama untuk menambah yang baru
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted hover:text-foreground transition-all"
              onClick={handleClose}
              disabled={isUploading}
            >
              Tutup
            </Button>
            {preview.length > 0 && (
              <Button
                className="bg-heart-500 hover:bg-heart-600 text-white font-semibold gap-2 transition-all min-w-35"
                disabled={isUploading}
                onClick={handleUpload}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengupload {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload {preview.length} Gambar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
