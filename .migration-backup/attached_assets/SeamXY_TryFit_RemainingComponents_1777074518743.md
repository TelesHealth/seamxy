# SeamXY — TryFit Remaining Components
## Replit Agent Instructions: Place Remaining TryFit Files into SeamXY

These instructions place the remaining TryFit components into SeamXY with the
correct import paths and API endpoint adjustments for SeamXY's structure.
Follow each phase in order. Confirm each phase before starting the next.

---

## PRE-FLIGHT CHECK

Run this first and report findings:

```bash
# Check what already exists so we don't overwrite
ls client/src/components/try-on/ 2>/dev/null || echo "try-on folder missing"
ls client/src/lib/imageCompression.ts 2>/dev/null || echo "imageCompression missing"
ls client/src/lib/sizeRecommendation.ts 2>/dev/null || echo "sizeRecommendation missing"
grep -r "ClothingItem" shared/schema.ts | head -5
grep -r "TryOnSession" shared/schema.ts | head -5
```

Report everything found before making any changes.

---

## PHASE 1: Fix imageCompression.ts

The existing `client/src/lib/imageCompression.ts` is missing the `compressForUpload`
function and `CompressionResult` type that TryFit components need.

Replace the entire contents of `client/src/lib/imageCompression.ts` with:

```typescript
// Image compression utility for TryFit photo uploads

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function compressForUpload(
  file: File,
  maxWidthOrHeight: number = 1200,
  quality: number = 0.85
): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const max = maxWidthOrHeight;

      if (width > max || height > max) {
        if (width > height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize: compressedFile.size,
            compressionRatio: originalSize / compressedFile.size,
          });
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## PHASE 2: Create sizeRecommendation.ts

TryFit's HeightCalibration component uses height conversion utilities.
Create `client/src/lib/sizeRecommendation.ts`:

```typescript
// Size recommendation and height conversion utilities

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export interface SizeRecommendation {
  size: string;
  confidence: number;
  fitDescription: string;
  alternativeSizes: string[];
  brandNote?: string;
}

export function calculateSizeFromMeasurements(
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
  },
  sizeChart: Record<string, Record<string, number>>,
  category: string
): SizeRecommendation {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Default fallback
  if (!measurements || !sizeChart) {
    return {
      size: "M",
      confidence: 50,
      fitDescription: "Standard fit",
      alternativeSizes: ["S", "L"],
    };
  }

  let bestSize = "M";
  let bestScore = Infinity;
  const scores: Record<string, number> = {};

  for (const size of sizes) {
    const chart = sizeChart[size];
    if (!chart) continue;

    let score = 0;
    let count = 0;

    if (measurements.chest && chart.chest) {
      score += Math.abs(measurements.chest - chart.chest);
      count++;
    }
    if (measurements.waist && chart.waist) {
      score += Math.abs(measurements.waist - chart.waist);
      count++;
    }
    if (measurements.hips && chart.hips) {
      score += Math.abs(measurements.hips - chart.hips);
      count++;
    }

    if (count > 0) {
      scores[size] = score / count;
      if (score / count < bestScore) {
        bestScore = score / count;
        bestSize = size;
      }
    }
  }

  const confidence = Math.max(50, Math.round(100 - bestScore * 2));
  const alternatives = sizes
    .filter((s) => s !== bestSize && scores[s] !== undefined)
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, 2);

  let fitDescription = "Standard fit";
  if (bestScore < 1) fitDescription = "Perfect fit";
  else if (bestScore < 3) fitDescription = "Great fit";
  else if (bestScore < 5) fitDescription = "Good fit";
  else fitDescription = "May need adjustment";

  return {
    size: bestSize,
    confidence,
    fitDescription,
    alternativeSizes: alternatives,
  };
}
```

---

## PHASE 3: Place ARTryOnCanvas.tsx

Create `client/src/components/try-on/ARTryOnCanvas.tsx`:

**IMPORTANT:** Check the exact type names in `shared/schema.ts` for the clothing/product
type and try-on session type before creating this file. The file uses `ClothingItem` —
if SeamXY's product type is named differently (e.g. `Product`), adjust accordingly.

```typescript
import { useCallback, useEffect, useRef } from "react";
import type { BodyLandmark } from "@shared/schema";
import {
  getTopControlPoints,
  getBottomControlPoints,
  getDressControlPoints,
  warpImage,
  type WarpSettings,
  DEFAULT_WARP_SETTINGS,
} from "@/lib/tpsWarp";

interface ClothingItemForAR {
  id: string | number;
  imageUrl: string;
  category: string;
  name: string;
  price: string | number;
}

interface OutfitLayer {
  item: ClothingItemForAR;
  zIndex: number;
}

interface ARTryOnCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: BodyLandmark[] | null;
  outfitLayers: OutfitLayer[];
  facingMode: "user" | "environment";
  warpSettings?: WarpSettings;
}

const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export function ARTryOnCanvas({
  videoRef,
  landmarks,
  outfitLayers,
  facingMode,
  warpSettings = DEFAULT_WARP_SETTINGS,
}: ARTryOnCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clothingImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const preloadClothingImages = useCallback(() => {
    outfitLayers.forEach((layer) => {
      const id = String(layer.item.id);
      if (!clothingImagesRef.current.has(id)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = layer.item.imageUrl;
        img.onload = () => {
          clothingImagesRef.current.set(id, img);
        };
      }
    });

    clothingImagesRef.current.forEach((_, id) => {
      if (!outfitLayers.find((l) => String(l.item.id) === id)) {
        clothingImagesRef.current.delete(id);
      }
    });
  }, [outfitLayers]);

  useEffect(() => {
    preloadClothingImages();
  }, [preloadClothingImages]);

  const renderClothing = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      item: ClothingItemForAR,
      landmarks: BodyLandmark[],
      canvasWidth: number,
      canvasHeight: number
    ) => {
      const img = clothingImagesRef.current.get(String(item.id));
      if (!img || !img.complete) return;

      const leftShoulder = landmarks[LANDMARK_INDICES.LEFT_SHOULDER];
      const rightShoulder = landmarks[LANDMARK_INDICES.RIGHT_SHOULDER];
      const leftHip = landmarks[LANDMARK_INDICES.LEFT_HIP];
      const rightHip = landmarks[LANDMARK_INDICES.RIGHT_HIP];
      const leftKnee = landmarks[LANDMARK_INDICES.LEFT_KNEE];
      const rightKnee = landmarks[LANDMARK_INDICES.RIGHT_KNEE];

      if (!leftShoulder || !rightShoulder) return;

      let drawX = 0,
        drawY = 0,
        drawWidth = 0,
        drawHeight = 0;

      const shoulderWidth =
        Math.abs(rightShoulder.x - leftShoulder.x) * canvasWidth;
      const category = item.category?.toLowerCase();

      if (category === "tops" || category === "outerwear") {
        if (!leftHip || !rightHip) return;
        drawWidth = shoulderWidth * 1.8;
        drawHeight = drawWidth * (img.height / img.width);
        drawX =
          Math.min(leftShoulder.x, rightShoulder.x) * canvasWidth -
          drawWidth * 0.15;
        drawY =
          Math.min(leftShoulder.y, rightShoulder.y) * canvasHeight -
          drawHeight * 0.12;
      } else if (category === "bottoms") {
        if (!leftHip || !rightHip || !leftKnee || !rightKnee) return;
        const hipWidth = Math.abs(rightHip.x - leftHip.x) * canvasWidth;
        drawWidth = hipWidth * 2.2;
        drawHeight = drawWidth * (img.height / img.width);
        drawX =
          Math.min(leftHip.x, rightHip.x) * canvasWidth - drawWidth * 0.2;
        drawY =
          Math.min(leftHip.y, rightHip.y) * canvasHeight - drawHeight * 0.1;
      } else if (category === "dresses") {
        if (!leftHip || !rightHip) return;
        drawWidth = shoulderWidth * 2;
        const dressAspect = img.height / img.width;
        drawHeight = drawWidth * dressAspect * 1.2;
        drawX =
          Math.min(leftShoulder.x, rightShoulder.x) * canvasWidth -
          drawWidth * 0.15;
        drawY =
          Math.min(leftShoulder.y, rightShoulder.y) * canvasHeight -
          drawHeight * 0.08;
      } else {
        drawWidth = shoulderWidth * 1.5;
        drawHeight = drawWidth * (img.height / img.width);
        drawX =
          (((leftShoulder.x + rightShoulder.x) / 2) * canvasWidth) -
          drawWidth / 2;
        drawY = leftShoulder.y * canvasHeight;
      }

      if (
        warpSettings.enabled &&
        (category === "tops" ||
          category === "bottoms" ||
          category === "dresses" ||
          category === "outerwear")
      ) {
        let controlPoints;
        if (category === "tops" || category === "outerwear") {
          controlPoints = getTopControlPoints(
            img.width,
            img.height,
            landmarks,
            drawWidth,
            drawHeight
          );
        } else if (category === "bottoms") {
          controlPoints = getBottomControlPoints(
            img.width,
            img.height,
            landmarks,
            drawWidth,
            drawHeight
          );
        } else {
          controlPoints = getDressControlPoints(
            img.width,
            img.height,
            landmarks,
            drawWidth,
            drawHeight
          );
        }

        if (controlPoints.length >= 3) {
          const strength = warpSettings.strength;
          if (strength < 1.0) {
            controlPoints = controlPoints.map((cp) => ({
              source: cp.source,
              target: {
                x: cp.source.x + (cp.target.x - cp.source.x) * strength,
                y: cp.source.y + (cp.target.y - cp.source.y) * strength,
              },
            }));
          }

          const warpedCanvas = warpImage(
            img,
            controlPoints,
            Math.round(drawWidth),
            Math.round(drawHeight)
          );
          ctx.globalAlpha = 0.9;
          ctx.drawImage(warpedCanvas, drawX, drawY, drawWidth, drawHeight);
          ctx.globalAlpha = 1;
          return;
        }
      }

      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    },
    [warpSettings]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (facingMode === "user") {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (landmarks && landmarks.length >= 33) {
      ctx.save();
      if (facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }

      const sortedLayers = [...outfitLayers].sort(
        (a, b) => a.zIndex - b.zIndex
      );
      sortedLayers.forEach((layer) => {
        renderClothing(
          ctx,
          layer.item,
          landmarks,
          canvas.width,
          canvas.height
        );
      });

      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [videoRef, landmarks, outfitLayers, facingMode, renderClothing]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
}
```

---

## PHASE 4: Place PhotoUploader.tsx

Create `client/src/components/try-on/PhotoUploader.tsx`:

```typescript
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
        } catch (error) {
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
      } catch (error) {
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
          isDragActive ? "border-primary bg-primary/5" : "border-primary/30 bg-primary/5 hover:border-primary/50"
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
        <Button onClick={onUseCamera} className="flex items-center justify-center gap-2 h-12">
          <Camera className="w-5 h-5" />
          <span>Use Webcam</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => nativeCameraRef.current?.click()}
          className="flex items-center justify-center gap-2 h-12"
        >
          <Smartphone className="w-5 h-5" />
          <span>Phone Camera</span>
        </Button>
      </div>

      <Button variant="outline" onClick={onUseModel} className="w-full flex items-center justify-center gap-2">
        <User className="w-4 h-4" />
        <span>Use a Model Instead</span>
      </Button>
    </div>
  );
}
```

---

## PHASE 5: Place ShareModal.tsx

Create `client/src/components/try-on/ShareModal.tsx`:

```typescript
import { useState } from "react";
import { Download, Link2, Copy, Check, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultImageUrl: string | null;
  shareUrl?: string;
}

export function ShareModal({ isOpen, onClose, resultImageUrl, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const link = document.createElement("a");
    link.href = resultImageUrl;
    link.download = `seamxy-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Image downloaded", description: "Your try-on result has been saved." });
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && resultImageUrl) {
      try {
        const response = await fetch(resultImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "seamxy-tryon.png", { type: "image/png" });
        await navigator.share({
          title: "Check out my virtual try-on!",
          text: "See how this outfit looks on me with SeamXY",
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({ title: "Share failed", variant: "destructive" });
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Look
          </DialogTitle>
        </DialogHeader>

        {resultImageUrl && (
          <div className="relative rounded-xl overflow-hidden mb-4">
            <img src={resultImageUrl} alt="Try-on result" className="w-full aspect-[3/4] object-cover" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={handleDownload}>
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={handleCopyLink} disabled={!shareUrl}>
            <Link2 className="w-5 h-5" />
            <span className="text-xs">Copy Link</span>
          </Button>
          {navigator.share && (
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={handleNativeShare}>
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share</span>
            </Button>
          )}
        </div>

        {shareUrl && (
          <div className="flex gap-2 mt-4">
            <Input value={shareUrl} readOnly className="text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-2">
          Get a second opinion from friends and family!
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

---

## PHASE 6: Place HeightCalibration.tsx

Create `client/src/components/try-on/HeightCalibration.tsx`:

Copy the HeightCalibration component exactly but change the API endpoint.

Find this line:
```typescript
const response = await apiRequest("PATCH", "/api/auth/user/height", { heightCm });
```

Change it to:
```typescript
const response = await apiRequest("PATCH", "/api/v1/user/height", { heightCm });
```

The full file content to create at `client/src/components/try-on/HeightCalibration.tsx`
is the same as the TryFit version with only that one endpoint URL change.

---

## PHASE 7: Place ProcessingOverlay.tsx

Create `client/src/components/try-on/ProcessingOverlay.tsx`:

```typescript
import { Progress } from "@/components/ui/progress";
import { Shirt } from "lucide-react";

interface ProcessingOverlayProps {
  progress: number;
  message?: string;
}

export function ProcessingOverlay({ progress, message }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-32 h-40 bg-muted rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/5 animate-pulse" />
          <div className="absolute inset-0 flex flex-col justify-around py-4">
            <div className="h-0.5 bg-primary animate-pulse" />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            <div className="h-0.5 bg-primary animate-pulse" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shirt className="w-6 h-6 text-primary animate-bounce" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">Analyzing Your Photo</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {message || "Detecting body shape and measurements..."}
      </p>
      <div className="w-48 mb-2">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
    </div>
  );
}
```

---

## PHASE 8: Place ClothingCard, ModelCard, RecentTryOnCard

These are smaller display components. Place them in `client/src/components/try-on/`.

### ClothingCard.tsx

Create `client/src/components/try-on/ClothingCard.tsx`:

```typescript
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClothingItem {
  id: string | number;
  name: string;
  brand?: string | null;
  price: string | number;
  imageUrl: string;
  thumbnailUrl?: string | null;
  category: string;
}

interface ClothingCardProps {
  item: ClothingItem;
  isFavorite?: boolean;
  onFavoriteToggle?: (item: ClothingItem) => void;
  onClick?: (item: ClothingItem) => void;
}

export function ClothingCard({ item, isFavorite = false, onFavoriteToggle, onClick }: ClothingCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => onClick?.(item)}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(item); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
        {item.brand && (
          <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur-sm">
            {item.brand}
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{item.name}</h3>
        <p className="text-sm font-semibold text-primary mt-1">
          ${parseFloat(String(item.price)).toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
```

### ModelCard.tsx

Create `client/src/components/try-on/ModelCard.tsx`:

```typescript
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TryOnModel {
  id: string;
  name: string;
  photoUrl: string;
  thumbnailUrl?: string | null;
  height?: string | null;
  bodyType?: string | null;
  skinTone?: string | null;
}

interface ModelCardProps {
  model: TryOnModel;
  isSelected?: boolean;
  onClick?: (model: TryOnModel) => void;
}

export function ModelCard({ model, isSelected, onClick }: ModelCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onClick?.(model)}
    >
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={model.thumbnailUrl || model.photoUrl}
          alt={model.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium truncate">{model.name}</p>
        <div className="flex flex-wrap gap-1">
          {model.height && <Badge variant="secondary" className="text-xs">{model.height}</Badge>}
          {model.bodyType && (
            <Badge variant="secondary" className="text-xs capitalize">
              {model.bodyType.replace("_", " ")}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
```

---

## PHASE 9: Update AR Try-On Page

The existing `client/src/pages/ar-try-on.tsx` was created without `ARTryOnCanvas`.
Now that we have it, update the AR page to use it.

Find `client/src/pages/ar-try-on.tsx` and add the import and usage:

```typescript
// Add to imports:
import { ARTryOnCanvas } from "../components/try-on/ARTryOnCanvas";

// Replace the placeholder canvas area with:
<ARTryOnCanvas
  videoRef={videoRef}
  landmarks={currentLandmarks}
  outfitLayers={clothingLayers.map((layer, i) => ({
    item: {
      id: layer.productId,
      imageUrl: layer.imageUrl,
      category: layer.category,
      name: layer.name,
      price: 0,
    },
    zIndex: i,
  }))}
  facingMode={facingMode}
  warpSettings={{ enabled: warpEnabled, strength: warpStrength / 100, gridResolution: 10 }}
/>
```

---

## PHASE 10: Export from try-on index

Create `client/src/components/try-on/index.ts` for clean imports:

```typescript
export { ARTryOnCanvas } from "./ARTryOnCanvas";
export { PhotoUploader } from "./PhotoUploader";
export { ShareModal } from "./ShareModal";
export { HeightCalibration } from "./HeightCalibration";
export { ProcessingOverlay } from "./ProcessingOverlay";
export { ClothingCard } from "./ClothingCard";
export { ModelCard } from "./ModelCard";
export { TryOnCanvas } from "./TryOnCanvas";
export { SizeRecommendation } from "./SizeRecommendation";
export { CompleteTheLook } from "./CompleteTheLook";
export { FitFeedbackModal } from "./FitFeedbackModal";
```

---

## PHASE 11: Verify

```bash
npm run check
```

Fix any TypeScript errors before pushing. Common issues:
- Missing type imports from `@shared/schema` — use `any` as fallback
- `react-dropzone` not installed — run `npm install react-dropzone --save`

Then commit and push:

```bash
git add .
git commit -m "feat: add remaining TryFit components to SeamXY"
git push origin main
```

---

## Summary of Files Created or Modified

| File | Action |
|---|---|
| `client/src/lib/imageCompression.ts` | Updated (added compressForUpload) |
| `client/src/lib/sizeRecommendation.ts` | Created |
| `client/src/components/try-on/ARTryOnCanvas.tsx` | Created |
| `client/src/components/try-on/PhotoUploader.tsx` | Created |
| `client/src/components/try-on/ShareModal.tsx` | Created |
| `client/src/components/try-on/HeightCalibration.tsx` | Created |
| `client/src/components/try-on/ProcessingOverlay.tsx` | Created |
| `client/src/components/try-on/ClothingCard.tsx` | Created |
| `client/src/components/try-on/ModelCard.tsx` | Created |
| `client/src/components/try-on/index.ts` | Created |
| `client/src/pages/ar-try-on.tsx` | Updated |

## Do Not Touch
- `client/src/lib/tpsWarp.ts` — already correct
- `server/services/anthropic.ts` — already correct
- `vercel.json` — already correct
- Any file in the `Z` folder
