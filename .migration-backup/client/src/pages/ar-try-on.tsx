import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Sliders,
  Share2,
  Trash2,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useARCamera } from "@/hooks/useARCamera";
import { useTryOnStore } from "@/store/tryOnStore";
import { ARTryOnCanvas } from "@/components/try-on/ARTryOnCanvas";
import { ShareModal } from "@/components/try-on/ShareModal";
import type { WarpSettings } from "@/lib/tpsWarp";

export default function ARTryOn() {
  const [, navigate] = useLocation();
  const [showControls, setShowControls] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const {
    clothingLayers,
    warpEnabled,
    warpStrength,
    setWarpEnabled,
    setWarpStrength,
    clearLayers,
  } = useTryOnStore();

  const {
    videoRef,
    isActive,
    facingMode,
    fps,
    bodyDetected,
    currentLandmarks,
    startCamera,
    stopCamera,
    toggleCamera,
  } = useARCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const warpSettings: WarpSettings = {
    enabled: warpEnabled,
    strength: warpStrength / 100,
    gridResolution: 10,
  };

  const handleCapture = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      setCapturedImage(url);
      setShowShare(true);
    }
  };

  const outfitLayers = clothingLayers.map((layer, i) => ({
    item: {
      id: layer.productId,
      imageUrl: layer.imageUrl,
      category: layer.category,
      name: layer.name,
      price: 0,
    },
    zIndex: i,
  }));

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera feed + AR overlay */}
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="hidden" playsInline muted />

        {isActive ? (
          <ARTryOnCanvas
            videoRef={videoRef}
            landmarks={currentLandmarks}
            outfitLayers={outfitLayers}
            facingMode={facingMode}
            warpSettings={warpSettings}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <CameraOff className="w-16 h-16 text-white/40" />
            <p className="text-white/60 text-sm">Camera is off</p>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/40 text-white"
            onClick={() => navigate("/virtual-try-on")}
            data-testid="button-ar-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            {bodyDetected ? (
              <Badge className="bg-green-500/80 text-white text-xs">Body detected</Badge>
            ) : (
              <Badge className="bg-black/40 text-white/60 text-xs">No body detected</Badge>
            )}
            <Badge className="bg-black/40 text-white/60 text-xs">{fps} fps</Badge>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="bg-black/40 text-white"
            onClick={() => setShowControls((v) => !v)}
            data-testid="button-ar-controls"
          >
            <Sliders className="w-5 h-5" />
          </Button>
        </div>

        {/* Clothing layers indicator */}
        {clothingLayers.length > 0 && (
          <div className="absolute top-16 right-4 flex flex-col gap-1">
            {clothingLayers.map((layer) => (
              <Badge
                key={layer.productId}
                className="bg-black/60 text-white text-xs truncate max-w-[140px]"
                data-testid={`badge-layer-${layer.productId}`}
              >
                <Layers className="w-3 h-3 mr-1 shrink-0" />
                {layer.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Controls panel */}
        {showControls && (
          <div className="absolute bottom-24 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">TPS Warp</span>
              <Button
                size="sm"
                variant={warpEnabled ? "default" : "outline"}
                className={warpEnabled ? "" : "text-white border-white/30"}
                onClick={() => setWarpEnabled(!warpEnabled)}
                data-testid="button-toggle-warp"
              >
                {warpEnabled ? "On" : "Off"}
              </Button>
            </div>

            {warpEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Warp Strength</span>
                  <span>{warpStrength}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[warpStrength]}
                  onValueChange={([v]) => setWarpStrength(v)}
                  data-testid="slider-warp-strength"
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-400 border-red-400/40"
              onClick={clearLayers}
              data-testid="button-clear-layers"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove All Clothing
            </Button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/90 px-6 py-4">
        <div className="flex items-center justify-around gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="text-white w-14 h-14 rounded-full"
            onClick={toggleCamera}
            data-testid="button-flip-camera"
          >
            <FlipHorizontal className="w-6 h-6" />
          </Button>

          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-white text-black"
            onClick={handleCapture}
            data-testid="button-capture"
          >
            <Camera className="w-7 h-7" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-white w-14 h-14 rounded-full"
            onClick={() => setShowShare(true)}
            disabled={!capturedImage}
            data-testid="button-share"
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        <p className="text-white/40 text-xs text-center mt-3">
          {isActive ? "Point camera at your full body" : "Camera inactive"}
        </p>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        resultImageUrl={capturedImage}
      />
    </div>
  );
}
