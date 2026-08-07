import { useState } from "react";
import { useLocation } from "wouter";
import { PhotoUploader } from "@/components/try-on/PhotoUploader";
import { ProcessingOverlay } from "@/components/try-on/ProcessingOverlay";
import { HeightCalibration } from "@/components/try-on/HeightCalibration";
import { useTryOnStore } from "@/store/tryOnStore";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { StyleCTA } from "@/components/StyleCTA";

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
    <div className="min-h-screen pb-16 sm:pb-0">
      <div className="px-6 md:px-10 py-14">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-start mb-12">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-5 flex items-center gap-3">
                <span className="w-8 h-px bg-foreground/30 inline-block" />
                Virtual Try-On
              </p>
              <h1
                className="font-display font-600 leading-[0.9] text-foreground mb-4"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
              >
                See it on you<br />
                before you<br />
                own it.
              </h1>
              <p className="text-foreground/50 text-lg mb-8 max-w-sm leading-relaxed">
                Upload a photo, try on any item. Three steps: selfie, fit prediction, swap items.
              </p>

              {/* Step cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { num: "01", title: "Self", desc: "Preview yourself" },
                  { num: "02", title: "Fit", desc: "Use predictions" },
                  { num: "03", title: "Swap", desc: "Change the item" },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm">
                    <p className="text-[9px] text-muted-foreground mb-1">{num}</p>
                    <p className="font-display text-base sm:text-lg font-600 text-foreground">{title}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: reference image */}
            <div className="relative h-72 md:h-[440px] rounded-3xl overflow-hidden shadow-xl hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="Try on preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 text-[10px] tracking-widest uppercase font-500 shadow">
                Predicted Fit
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-2xl px-4 py-3">
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase mb-1">Swap Item</p>
                <div className="flex gap-2">
                  {["#2d2d2d", "#e8d5b0", "#9b8fd6", "#6baad6"].map((c) => (
                    <div key={c} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <p className="text-[10px] tracking-widest uppercase text-foreground/40 mb-2 text-center">Step 01</p>
              <p className="font-display text-2xl font-600 text-foreground text-center mb-6 leading-tight">
                Upload your photo
              </p>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                onUseModel={() => setLocation("/models")}
                onUseCamera={() => setLocation("/ar-try-on")}
              />
            </div>
          </div>
        </div>
      </div>

      <HeightCalibration
        open={showHeightModal}
        onClose={handleHeightSet}
        onHeightChange={() => {}}
        title="One more thing"
        description="Your height helps us recommend the right size"
        showSkip={true}
      />

      <StyleCTA />
    </div>
  );
}
