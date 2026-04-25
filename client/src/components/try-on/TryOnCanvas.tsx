import { useRef, useCallback, useEffect } from "react";
import {
  TryOnCanvas as RootTryOnCanvas,
  TryOnCanvasRef,
  GarmentOverlay,
} from "@/components/TryOnCanvas";
import { useTryOnStore } from "@/store/tryOnStore";

interface StudioTryOnCanvasProps {
  className?: string;
  onResultGenerated?: (dataUrl: string) => void;
}

export function TryOnCanvas({ className, onResultGenerated }: StudioTryOnCanvasProps) {
  const canvasRef = useRef<TryOnCanvasRef>(null);
  const { userPhotoUrl, bodyLandmarks, clothingLayers } = useTryOnStore();

  const garments: GarmentOverlay[] = clothingLayers.map((layer, idx) => ({
    id: layer.productId,
    imageUrl: layer.imageUrl,
    category: layer.category as GarmentOverlay["category"],
    position: layer.position,
    scale: layer.scale,
    rotation: layer.rotation,
    opacity: 1,
    zIndex: idx,
  }));

  const poseToCanvas = bodyLandmarks
    ? bodyLandmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
        name: "",
      }))
    : null;

  const exportResult = useCallback(() => {
    if (!canvasRef.current || !onResultGenerated) return;
    const dataUrl = canvasRef.current.exportAsDataUrl("image/png");
    if (dataUrl) onResultGenerated(dataUrl);
  }, [onResultGenerated]);

  useEffect(() => {
    const timer = setTimeout(exportResult, 800);
    return () => clearTimeout(timer);
  }, [clothingLayers, exportResult]);

  if (!userPhotoUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-xl text-muted-foreground text-sm ${className ?? ""}`}
      >
        No photo loaded
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl ${className ?? ""}`}>
      <RootTryOnCanvas
        ref={canvasRef}
        backgroundImage={userPhotoUrl}
        landmarks={poseToCanvas}
        garments={garments}
        showPoseSkeleton={false}
        showGuidelines={false}
        className="w-full h-full"
      />
    </div>
  );
}
