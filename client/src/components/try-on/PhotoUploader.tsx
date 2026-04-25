import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, User, Image, X, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { compressForUpload, formatFileSize, type CompressionResult } from "@/lib/imageCompression";

interface PhotoUploaderProps {
  onPhotoSelected: (file: File, previewUrl: string) => void;
  onUseModel?: () => void;
  onUseCamera?: () => void;
}

export function PhotoUploader({
  onPhotoSelected,
  onUseModel,
  onUseCamera,
}: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const { toast } = useToast();
  const nativeCameraRef = useRef<HTMLInputElement>(null);

  const handleNativeCameraCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsCompressing(true);
        try {
          const result = await compressForUpload(file);
          const previewUrl = URL.createObjectURL(result.file);
          setPreview(previewUrl);
          setCompressionStats(result);
          onPhotoSelected(result.file, previewUrl);
        } catch {
          const previewUrl = URL.createObjectURL(file);
          setPreview(previewUrl);
          onPhotoSelected(file, previewUrl);
        } finally {
          setIsCompressing(false);
        }
      }
      if (nativeCameraRef.current) nativeCameraRef.current.value = "";
    },
    [onPhotoSelected]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or WEBP image.", variant: "destructive" });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 50MB.", variant: "destructive" });
        return;
      }

      setIsCompressing(true);
      try {
        const result = await compressForUpload(file);
        setCompressionStats(result);
        const previewUrl = URL.createObjectURL(result.file);
        setPreview(previewUrl);
        onPhotoSelected(result.file, previewUrl);
      } catch {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onPhotoSelected(file, previewUrl);
      } finally {
        setIsCompressing(false);
      }
    },
    [onPhotoSelected, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxFiles: 1,
  });

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCompressionStats(null);
  };

  if (isCompressing) {
    return (
      <Card className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-medium">Optimizing image...</p>
        <p className="text-sm text-muted-foreground mt-1">This will only take a moment</p>
      </Card>
    );
  }

  if (preview) {
    return (
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Preview" className="w-full aspect-[3/4] object-cover" />
          <button
            onClick={clearPreview}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          {compressionStats && compressionStats.compressionRatio > 1.1 && (
            <div className="absolute bottom-3 left-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">
                  {((1 - compressionStats.compressedSize / compressionStats.originalSize) * 100).toFixed(0)}% smaller
                </span>
                {" "}({formatFileSize(compressionStats.originalSize)} → {formatFileSize(compressionStats.compressedSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors min-h-[300px] ${
          isDragActive ? "border-primary bg-primary/5" : "border-primary/30 bg-primary/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium text-center">
          {isDragActive ? "Drop your photo here" : "Drag & drop your photo"}
        </p>
        <p className="text-sm text-muted-foreground mt-1 text-center">or tap to browse</p>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Supports JPG, PNG, WEBP (auto-optimized)
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <Image className="w-4 h-4 text-primary" />
          Photo Tips
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Stand straight with arms slightly away from body</li>
          <li>Good lighting with plain background works best</li>
          <li>Wear fitted clothes for accurate detection</li>
        </ul>
      </Card>

      <input
        ref={nativeCameraRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleNativeCameraCapture}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onUseCamera}
          className="flex items-center justify-center gap-2"
          data-testid="button-use-webcam"
        >
          <Camera className="w-5 h-5" />
          <span>Use Webcam</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => nativeCameraRef.current?.click()}
          className="flex items-center justify-center gap-2"
          data-testid="button-phone-camera"
        >
          <Smartphone className="w-5 h-5" />
          <span>Phone Camera</span>
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={onUseModel}
        className="w-full flex items-center justify-center gap-2"
        data-testid="button-use-model"
      >
        <User className="w-4 h-4" />
        <span>Use a Model Instead</span>
      </Button>
    </div>
  );
}
