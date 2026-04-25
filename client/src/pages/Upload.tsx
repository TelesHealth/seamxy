import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Camera, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoUploader } from "@/components/try-on/PhotoUploader";
import { HeightCalibration } from "@/components/try-on/HeightCalibration";
import { ModelCard } from "@/components/try-on/ModelCard";
import { useTryOnStore } from "@/store/tryOnStore";
import { useCustomerAuth } from "@/lib/customer-auth";

interface TryOnModel {
  id: string;
  name: string;
  photoUrl: string;
  thumbnailUrl?: string | null;
  height?: string | null;
  bodyType?: string | null;
  skinTone?: string | null;
}

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { customer } = useCustomerAuth();
  const { setUserPhoto, setSelectedModel, userPhotoUrl, selectedModelId } = useTryOnStore();
  const [activeTab, setActiveTab] = useState("photo");

  const { data: models = [] } = useQuery<TryOnModel[]>({
    queryKey: ["/api/v1/try-on/models"],
  });

  const handlePhotoSelected = (file: File, previewUrl: string) => {
    setUserPhoto(previewUrl, []);
    setSelectedModel(null);
  };

  const handleModelSelected = (model: TryOnModel) => {
    setSelectedModel(model.id);
    setUserPhoto(model.photoUrl, []);
  };

  const canContinue = !!userPhotoUrl || !!selectedModelId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button size="icon" variant="ghost" data-testid="button-upload-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Virtual Try-On</h1>
          <p className="text-xs text-muted-foreground">Upload your photo to get started</p>
        </div>
        {canContinue && (
          <Button
            onClick={() => navigate("/studio")}
            data-testid="button-continue-to-studio"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Quick AR option */}
        <Card
          className="cursor-pointer hover-elevate"
          onClick={() => navigate("/ar-try-on")}
          data-testid="card-ar-quickstart"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Use Live Camera (AR)</p>
              <p className="text-sm text-muted-foreground">Try on clothes in real time using your webcam</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Main tabs: upload photo vs use model */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photo" data-testid="tab-upload-photo">Upload Photo</TabsTrigger>
            <TabsTrigger value="model" data-testid="tab-use-model">Use a Model</TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="mt-4">
            <PhotoUploader
              onPhotoSelected={handlePhotoSelected}
              onUseCamera={() => navigate("/ar-try-on")}
              onUseModel={() => setActiveTab("model")}
            />

            {/* Preview if photo already selected */}
            {userPhotoUrl && !selectedModelId && (
              <Card className="mt-4 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] max-h-[320px]">
                    <img
                      src={userPhotoUrl}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">Photo ready</p>
                      <p className="text-white/70 text-xs">Tap Continue to browse clothing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="model" className="mt-4">
            {models.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No models available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Upload your own photo instead</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("photo")}
                    data-testid="button-switch-to-upload"
                  >
                    Upload Photo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModelId === model.id}
                    onClick={handleModelSelected}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Height calibration for signed-in users */}
        {customer && (
          <HeightCalibration
            initialHeightCm={(customer as any).heightCm ?? null}
          />
        )}

        {/* Bottom CTA */}
        {canContinue && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/studio")}
            data-testid="button-continue-studio-bottom"
          >
            Continue to Studio
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
