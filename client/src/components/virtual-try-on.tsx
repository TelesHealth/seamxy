import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TryOnModel, UserTryOnPhoto } from "@shared/schema";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { TryOnCanvas, type GarmentOverlay, type BodyMeasurements } from "@/components/TryOnCanvas";
import { 
  Camera, 
  Upload, 
  User, 
  Shirt, 
  Move, 
  RotateCw, 
  Maximize2,
  Heart,
  Share2,
  Download,
  X,
  Check,
  Loader2,
  Sparkles,
  Ruler,
  ArrowLeft,
  ChevronRight,
  Crown,
  ThumbsUp,
  Zap,
  AlertCircle
} from "lucide-react";

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface TryOnProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl?: string | null;
  affiliateUrl?: string | null;
  sizes?: string[] | null;
  sizeChart?: Record<string, any> | null;
}

interface VirtualTryOnProps {
  product: TryOnProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

type TryOnStep = "photo" | "detection" | "tryOn" | "result";

export function VirtualTryOn({ product, open, onOpenChange, userId }: VirtualTryOnProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<TryOnStep>("photo");
  const [photoSource, setPhotoSource] = useState<"upload" | "model" | "camera">("upload");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<PoseLandmark[] | null>(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [clothingPosition, setClothingPosition] = useState({ x: 0, y: 0 });
  const [clothingScale, setClothingScale] = useState(1);
  const [clothingRotation, setClothingRotation] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [lastResultId, setLastResultId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { detectFromImage, isInitializing: isPoseInitializing, error: poseError, isDetecting } = usePoseDetection();
  
  const { data: rateLimit } = useQuery<{ allowed: boolean; remaining: number; limit: number }>({
    queryKey: ["/api/v1/try-on/rate-limit"],
    enabled: open && !!userId
  });
  
  const { data: models = [] } = useQuery<TryOnModel[]>({
    queryKey: ["/api/v1/try-on/models"],
    enabled: open
  });
  
  const { data: userPhotos = [] } = useQuery<UserTryOnPhoto[]>({
    queryKey: ["/api/v1/try-on/my-photos"],
    enabled: open && !!userId
  });
  
  const sizeRecommendationMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("POST", "/api/v1/try-on/size-recommendation", { productId });
      return response.json();
    }
  });
  
  useEffect(() => {
    if (open && userId && step === "tryOn" && !sizeRecommendationMutation.data && !sizeRecommendationMutation.isPending) {
      sizeRecommendationMutation.mutate(product.id);
    }
  }, [open, userId, step, product.id, sizeRecommendationMutation.data, sizeRecommendationMutation.isPending]);
  
  const sizeRecommendation = sizeRecommendationMutation.data as {
    recommendedSize: string;
    confidence: number;
    fit: string;
    availableSizes: string[];
  } | undefined;
  
  const isLoadingSize = sizeRecommendationMutation.isPending;
  
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/v1/try-on/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/try-on/my-sessions"] });
    }
  });
  
  const addToClosetMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("POST", "/api/v1/try-on/closet", { productId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Added to closet", description: "Item saved for future try-ons" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/try-on/closet"] });
    }
  });
  
  const shareTryOnMutation = useMutation({
    mutationFn: async ({ resultId, title }: { resultId: string; title: string }) => {
      const response = await apiRequest("POST", "/api/v1/try-on/shares", { resultId, title });
      return response.json();
    },
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/try-on/shared/${data.shareCode}`;
      navigator.clipboard.writeText(shareUrl);
      toast({ 
        title: "Link copied!", 
        description: "Share this look with your friends and get their votes."
      });
    },
    onError: () => {
      toast({
        title: "Sharing failed",
        description: "Could not create a shareable link. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (userId && rateLimit && !rateLimit.allowed) {
        toast({
          title: "Daily limit reached",
          description: "Upgrade to Premium for unlimited try-ons!",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        setStep("detection");
        
        await performPoseDetection(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, [userId, rateLimit, performPoseDetection, toast]);

  const handleModelSelect = useCallback(async (modelId: string) => {
    if (userId && rateLimit && !rateLimit.allowed) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to Premium for unlimited try-ons!",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedModelId(modelId);
    const model = models.find(m => m.id === modelId);
    if (model?.poseLandmarks) {
      setPoseLandmarks(model.poseLandmarks as PoseLandmark[]);
      setStep("tryOn");
    } else if (model?.photoUrl) {
      setStep("detection");
      await performPoseDetection(model.photoUrl);
    } else {
      setStep("detection");
      simulatePoseDetection();
    }
  }, [models, userId, rateLimit, performPoseDetection, toast, simulatePoseDetection]);

  const performPoseDetection = useCallback(async (imageSource: string) => {
    setDetectionProgress(0);
    
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageSource;
      });
      
      setDetectionProgress(25);
      
      const result = await detectFromImage(img);
      
      setDetectionProgress(75);
      
      if (result && result.landmarks && result.landmarks.length > 0) {
        const formattedLandmarks: PoseLandmark[] = result.landmarks.map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility
        }));
        
        setDetectionProgress(100);
        setPoseLandmarks(formattedLandmarks);
        setStep("tryOn");
        
        toast({
          title: "Body detected!",
          description: "You can now try on the garment."
        });
      } else {
        throw new Error("Could not detect body pose. Please use a clearer full-body photo.");
      }
    } catch (error: any) {
      console.error("Pose detection error:", error);
      toast({
        title: "Detection failed",
        description: error.message || "Please try a different photo with a clear full-body view.",
        variant: "destructive"
      });
      setStep("photo");
    }
  }, [detectFromImage, toast]);
  
  const simulatePoseDetection = useCallback(() => {
    setDetectionProgress(0);
    const interval = setInterval(() => {
      setDetectionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const mockLandmarks: PoseLandmark[] = Array.from({ length: 33 }, (_, i) => ({
            x: 0.3 + Math.random() * 0.4,
            y: 0.1 + (i / 33) * 0.8,
            z: -0.1 + Math.random() * 0.2,
            visibility: 0.8 + Math.random() * 0.2
          }));
          setPoseLandmarks(mockLandmarks);
          setStep("tryOn");
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  }, []);

  const drawTryOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (uploadedImage || selectedModelId) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        if (poseLandmarks && product.imageUrl) {
          const clothingImg = new Image();
          clothingImg.crossOrigin = "anonymous";
          clothingImg.onload = () => {
            ctx.save();
            const shoulderLeft = poseLandmarks[11];
            const shoulderRight = poseLandmarks[12];
            const hipLeft = poseLandmarks[23];
            
            if (shoulderLeft && shoulderRight && hipLeft) {
              const centerX = ((shoulderLeft.x + shoulderRight.x) / 2) * canvas.width;
              const centerY = ((shoulderLeft.y + hipLeft.y) / 2) * canvas.height;
              const width = Math.abs(shoulderRight.x - shoulderLeft.x) * canvas.width * 1.5;
              const height = Math.abs(hipLeft.y - shoulderLeft.y) * canvas.height * 1.3;
              
              ctx.translate(centerX + clothingPosition.x, centerY + clothingPosition.y);
              ctx.rotate((clothingRotation * Math.PI) / 180);
              ctx.scale(clothingScale, clothingScale);
              
              ctx.globalAlpha = 0.9;
              ctx.drawImage(
                clothingImg,
                -width / 2,
                -height / 2,
                width,
                height
              );
            }
            ctx.restore();
          };
          clothingImg.src = product.imageUrl;
        }
      };
      
      if (uploadedImage) {
        img.src = uploadedImage;
      } else if (selectedModelId) {
        const model = models.find(m => m.id === selectedModelId);
        if (model?.photoUrl) {
          img.src = model.photoUrl;
        }
      }
    }
  }, [uploadedImage, selectedModelId, poseLandmarks, product, clothingPosition, clothingScale, clothingRotation, models]);

  useEffect(() => {
    if (step === "tryOn") {
      drawTryOnCanvas();
    }
  }, [step, drawTryOnCanvas]);

  const handleSaveResult = async () => {
    try {
      const session = await createSessionMutation.mutateAsync({
        userId,
        photoType: selectedModelId ? "model" : "user_upload",
        modelId: selectedModelId,
        tryOnItems: [{ 
          productId: product.id, 
          position: clothingPosition, 
          scale: clothingScale, 
          rotation: clothingRotation 
        }],
        isPublic: false
      });
      
      if (session?.id) {
        setLastResultId(session.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/v1/try-on/rate-limit"] });
      setStep("result");
      toast({ title: "Try-on saved!", description: "Your look has been saved to your history." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save try-on result", variant: "destructive" });
    }
  };
  
  const handleShare = async () => {
    if (!lastResultId) {
      toast({ 
        title: "Save first", 
        description: "Please save your try-on before sharing.",
        variant: "destructive"
      });
      return;
    }
    
    shareTryOnMutation.mutate({
      resultId: lastResultId,
      title: `${product.name} Try-On Look`
    });
  };

  const resetTryOn = () => {
    setStep("photo");
    setUploadedImage(null);
    setSelectedModelId(null);
    setPoseLandmarks(null);
    setDetectionProgress(0);
    setClothingPosition({ x: 0, y: 0 });
    setClothingScale(1);
    setClothingRotation(0);
    setLastResultId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetTryOn();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2" data-testid="try-on-dialog-title">
              <Sparkles className="h-5 w-5 text-primary" />
              Virtual Try-On
            </DialogTitle>
            
            {userId && rateLimit && (
              <div className="flex items-center gap-2" data-testid="rate-limit-badge">
                {rateLimit.limit < 0 ? (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Unlimited
                  </Badge>
                ) : rateLimit.remaining > 0 ? (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {rateLimit.remaining}/{rateLimit.limit} today
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Limit reached
                  </Badge>
                )}
              </div>
            )}
          </div>
          <DialogDescription>
            See how {product.name} looks on you before buying
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {step === "photo" && (
            <div className="p-6 space-y-6">
              <Tabs defaultValue="upload" onValueChange={(v) => setPhotoSource(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload" data-testid="tab-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </TabsTrigger>
                  <TabsTrigger value="model" data-testid="tab-model">
                    <User className="h-4 w-4 mr-2" />
                    Use Model
                  </TabsTrigger>
                  <TabsTrigger value="camera" data-testid="tab-camera" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="upload-dropzone"
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drop your photo here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse. Use a full-body photo for best results.
                    </p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      data-testid="input-file-upload"
                    />
                  </div>
                  
                  {userPhotos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Your saved photos</h4>
                      <ScrollArea className="w-full">
                        <div className="flex gap-3">
                          {userPhotos.map((photo) => (
                            <Card 
                              key={photo.id} 
                              className="flex-shrink-0 w-24 cursor-pointer hover:ring-2 hover:ring-primary"
                              onClick={() => {
                                setUploadedImage(photo.photoUrl);
                                if (photo.poseLandmarks) {
                                  setPoseLandmarks(photo.poseLandmarks as PoseLandmark[]);
                                  setStep("tryOn");
                                } else {
                                  setStep("detection");
                                  simulatePoseDetection();
                                }
                              }}
                              data-testid={`saved-photo-${photo.id}`}
                            >
                              <img 
                                src={photo.photoUrl} 
                                alt="Saved photo" 
                                className="w-24 h-32 object-cover rounded-lg"
                              />
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="model" className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {models.map((model) => (
                      <Card 
                        key={model.id}
                        className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                          selectedModelId === model.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleModelSelect(model.id)}
                        data-testid={`model-${model.id}`}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-[3/4] bg-muted rounded overflow-hidden mb-2">
                            {model.photoUrl ? (
                              <img 
                                src={model.photoUrl} 
                                alt={model.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate">{model.name}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {model.bodyType && (
                              <Badge variant="secondary" className="text-xs">
                                {model.bodyType}
                              </Badge>
                            )}
                            {model.height && (
                              <Badge variant="outline" className="text-xs">
                                {model.height}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {models.length === 0 && (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No models available yet</p>
                        <p className="text-sm">Upload your own photo instead</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="camera" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Camera capture coming soon</p>
                    <p className="text-sm">Use upload or select a model for now</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {step === "detection" && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6 max-w-md">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 border-4 border-primary/40 rounded-full animate-pulse" />
                  <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Detecting body pose...</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI is analyzing your photo to position the clothing perfectly
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={detectionProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{detectionProgress}% complete</p>
                </div>
              </div>
            </div>
          )}
          
          {step === "tryOn" && (
            <div className="grid lg:grid-cols-3 gap-4 p-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div className="aspect-[3/4] relative bg-muted">
                    <canvas 
                      ref={canvasRef}
                      width={450}
                      height={600}
                      className="w-full h-full object-contain"
                      data-testid="try-on-canvas"
                    />
                  </div>
                </Card>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("photo")}
                    data-testid="button-change-photo"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      {product.name}
                    </h4>
                    <p className="text-xl font-bold">${product.price}</p>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Move className="h-4 w-4" />
                          Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">X</span>
                            <Slider
                              value={[clothingPosition.x]}
                              min={-100}
                              max={100}
                              step={1}
                              onValueChange={([x]) => setClothingPosition(p => ({ ...p, x }))}
                              data-testid="slider-position-x"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Y</span>
                            <Slider
                              value={[clothingPosition.y]}
                              min={-100}
                              max={100}
                              step={1}
                              onValueChange={([y]) => setClothingPosition(p => ({ ...p, y }))}
                              data-testid="slider-position-y"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Maximize2 className="h-4 w-4" />
                          Scale
                        </label>
                        <Slider
                          value={[clothingScale]}
                          min={0.5}
                          max={2}
                          step={0.05}
                          onValueChange={([scale]) => setClothingScale(scale)}
                          data-testid="slider-scale"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          Rotation
                        </label>
                        <Slider
                          value={[clothingRotation]}
                          min={-30}
                          max={30}
                          step={1}
                          onValueChange={([rotation]) => setClothingRotation(rotation)}
                          data-testid="slider-rotation"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {userId && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Size Recommendation
                      </h4>
                      
                      {isLoadingSize ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Calculating...
                        </div>
                      ) : sizeRecommendation ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="text-lg px-3 py-1">
                              {sizeRecommendation.recommendedSize}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(sizeRecommendation.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sizeRecommendation.fit}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sizeRecommendation.availableSizes.map(size => (
                              <Badge 
                                key={size} 
                                variant={size === sizeRecommendation.recommendedSize ? "default" : "outline"}
                                className="text-xs"
                              >
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Complete your measurements in your profile for personalized sizing
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSaveResult}
                    disabled={createSessionMutation.isPending}
                    data-testid="button-save-result"
                  >
                    {createSessionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save & Continue
                  </Button>
                  
                  {userId && (
                    <Button 
                      variant="outline"
                      onClick={() => addToClosetMutation.mutate(product.id)}
                      disabled={addToClosetMutation.isPending}
                      data-testid="button-add-closet"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Closet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {step === "result" && (
            <div className="p-6 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Looking great!</h3>
                <p className="text-muted-foreground">
                  Your try-on has been saved. Ready to make it yours?
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (product.affiliateUrl) {
                      window.open(product.affiliateUrl, "_blank");
                    }
                  }}
                  data-testid="button-buy-now"
                >
                  Buy Now - ${product.price}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleShare}
                  disabled={shareTryOnMutation.isPending}
                  data-testid="button-share"
                >
                  {shareTryOnMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  Share & Get Votes
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={resetTryOn}
                data-testid="button-try-another"
              >
                Try another item
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
