import { useState } from "react";
import { useLocation } from "wouter";
import { PhotoUploader } from "@/components/try-on/PhotoUploader";
import { ProcessingOverlay } from "@/components/try-on/ProcessingOverlay";
import { HeightCalibration } from "@/components/try-on/HeightCalibration";
import { useTryOnStore } from "@/store/tryOnStore";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const { setUserPhoto } = useTryOnStore();
  const { detectFromImage } = usePoseDetection();

  const handlePhotoSelected = async (file: File, previewUrl: string) => {
    setIsProcessing(true);
    setProgress(20);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      setProgress(50);
      const result = await detectFromImage(img);
      setProgress(80);

      setUserPhoto(previewUrl, result?.landmarks ?? []);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        setShowHeightModal(true);
      }, 500);
    } catch (err) {
      console.error("Pose detection failed:", err);
      setUserPhoto(previewUrl, []);
      setIsProcessing(false);
      setLocation("/studio");
    }
  };

  const handleHeightSet = () => {
    setShowHeightModal(false);
    setLocation("/studio");
  };

  if (isProcessing) {
    return <ProcessingOverlay progress={progress} message="Detecting your body shape..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-testid="button-upload-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Virtual Try-On</h1>
            <p className="text-sm text-muted-foreground">Upload a photo to get started</p>
          </div>
        </div>

        <PhotoUploader
          onPhotoSelected={handlePhotoSelected}
          onUseModel={() => setLocation("/models")}
          onUseCamera={() => setLocation("/ar-try-on")}
        />

        <HeightCalibration
          open={showHeightModal}
          onClose={handleHeightSet}
          onHeightChange={() => {}}
          title="One more thing"
          description="Your height helps us recommend the right size"
          showSkip={true}
        />
      </div>
    </div>
  );
}
