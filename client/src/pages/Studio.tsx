import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useTryOnStore } from "@/store/tryOnStore";
import { TryOnCanvas } from "@/components/try-on/TryOnCanvas";
import { SizeRecommendation } from "@/components/try-on/SizeRecommendation";
import { CompleteTheLook } from "@/components/try-on/CompleteTheLook";
import { ShareModal } from "@/components/try-on/ShareModal";
import { ArrowLeft, Share2, RotateCcw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function StudioPage() {
  const [, setLocation] = useLocation();
  const [showShare, setShowShare] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const {
    userPhotoUrl,
    clothingLayers,
    warpEnabled,
    warpStrength,
    setWarpEnabled,
    setWarpStrength,
    removeClothingLayer,
    resetStudio,
  } = useTryOnStore();

  if (!userPhotoUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">No photo loaded yet.</p>
        <Button onClick={() => setLocation("/upload")} data-testid="button-go-upload">
          Upload a Photo
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setLocation("/upload")}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          data-testid="button-studio-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Try-On Studio</h1>
        <div className="flex gap-2">
          <Link href="/ar-try-on">
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              data-testid="button-studio-ar"
            >
              <Camera className="w-5 h-5" />
            </button>
          </Link>
          <button
            onClick={() => setShowShare(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            data-testid="button-studio-share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={resetStudio}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            data-testid="button-studio-reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <TryOnCanvas
          className="h-[60vh] max-h-[500px]"
          onResultGenerated={setResultImageUrl}
        />
      </div>

      {/* Controls panel */}
      <div className="bg-gray-900 rounded-t-3xl p-4 space-y-4 overflow-y-auto max-h-[45vh]">
        {/* Clothing layers */}
        {clothingLayers.length > 0 && (
          <div>
            <p className="text-sm font-medium text-white/70 mb-2">Selected Items</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {clothingLayers.map((layer) => (
                <div key={layer.productId} className="relative flex-shrink-0">
                  <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden">
                    <img
                      src={layer.imageUrl}
                      alt={layer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeClothingLayer(layer.productId)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                    data-testid={`button-remove-layer-${layer.productId}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warp toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Body Warping</span>
          <button
            onClick={() => setWarpEnabled(!warpEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              warpEnabled ? "bg-primary" : "bg-white/20"
            }`}
            data-testid="button-toggle-warp"
          />
        </div>

        {warpEnabled && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/50">
              <span>Warp Strength</span>
              <span data-testid="text-warp-strength">{warpStrength}%</span>
            </div>
            <Slider
              value={[warpStrength]}
              onValueChange={([v]) => setWarpStrength(v)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-warp-strength"
            />
          </div>
        )}

        {/* Browse shop */}
        <Link href="/shop">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white"
            data-testid="button-browse-shop"
          >
            Browse Shop to Add Items
          </Button>
        </Link>

        {/* Size recommendation for first item */}
        {clothingLayers[0] && (
          <SizeRecommendation productId={clothingLayers[0].productId} brand="" />
        )}

        {/* Complete the Look */}
        {clothingLayers[0] && (
          <CompleteTheLook productId={clothingLayers[0].productId} />
        )}
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        resultImageUrl={resultImageUrl}
      />
    </div>
  );
}
