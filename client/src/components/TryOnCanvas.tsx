import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import { PoseLandmark, GarmentPlacement, drawPoseOnCanvas, POSE_LANDMARKS } from "@/lib/poseDetection";

export interface GarmentOverlay {
  id: string;
  imageUrl: string;
  category: "tops" | "bottoms" | "dresses" | "outerwear" | "accessories";
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface TryOnCanvasProps {
  backgroundImage: string | null;
  landmarks: PoseLandmark[] | null;
  garments: GarmentOverlay[];
  width?: number;
  height?: number;
  showPoseSkeleton?: boolean;
  showGuidelines?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

export interface TryOnCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  exportAsDataUrl: (format?: string, quality?: number) => string | null;
  exportAsBlob: (format?: string, quality?: number) => Promise<Blob | null>;
  redraw: () => void;
}

export const TryOnCanvas = forwardRef<TryOnCanvasRef, TryOnCanvasProps>(
  (
    {
      backgroundImage,
      landmarks,
      garments,
      width = 450,
      height = 600,
      showPoseSkeleton = false,
      showGuidelines = false,
      onCanvasReady,
      className = "",
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
      if (!backgroundImage) {
        setBackgroundLoaded(false);
        backgroundImageRef.current = null;
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        backgroundImageRef.current = img;
        setBackgroundLoaded(true);
      };

      img.onerror = () => {
        console.error("Failed to load background image");
        setBackgroundLoaded(false);
      };

      img.src = backgroundImage;
    }, [backgroundImage]);

    useEffect(() => {
      const loadImages = async () => {
        const newLoadedImages = new Map<string, HTMLImageElement>();

        await Promise.all(
          garments.map(
            (garment) =>
              new Promise<void>((resolve) => {
                if (loadedImages.has(garment.imageUrl)) {
                  newLoadedImages.set(garment.imageUrl, loadedImages.get(garment.imageUrl)!);
                  resolve();
                  return;
                }

                const img = new Image();
                img.crossOrigin = "anonymous";

                img.onload = () => {
                  newLoadedImages.set(garment.imageUrl, img);
                  resolve();
                };

                img.onerror = () => {
                  console.error(`Failed to load garment image: ${garment.imageUrl}`);
                  resolve();
                };

                img.src = garment.imageUrl;
              })
          )
        );

        setLoadedImages(newLoadedImages);
      };

      if (garments.length > 0) {
        loadImages();
      }
    }, [garments]);

    const getGarmentPlacement = useCallback(
      (garment: GarmentOverlay): GarmentPlacement | null => {
        if (!landmarks || landmarks.length < 33) return null;

        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
        const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
        const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
        const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
        const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const hipMidY = (leftHip.y + rightHip.y) / 2;
        const kneeMidX = (leftKnee.x + rightKnee.x) / 2;
        const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
        const ankleMidX = (leftAnkle.x + rightAnkle.x) / 2;
        const ankleMidY = (leftAnkle.y + rightAnkle.y) / 2;

        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const hipWidth = Math.abs(rightHip.x - leftHip.x);
        const torsoHeight = Math.abs(hipMidY - shoulderMidY);

        const shoulderAngle = Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) * (180 / Math.PI);

        const bodyAngle = Math.atan2(
          hipMidY - shoulderMidY,
          hipMidX - shoulderMidX
        ) * (180 / Math.PI) - 90;

        switch (garment.category) {
          case "tops":
          case "outerwear":
            return {
              centerX: (shoulderMidX + hipMidX) / 2,
              centerY: (shoulderMidY + hipMidY) / 2,
              width: shoulderWidth * 1.5,
              height: torsoHeight * 1.2,
              rotation: bodyAngle,
              shoulderAngle,
              bodyAngle,
            };

          case "bottoms":
            const bottomHeight = Math.sqrt(
              Math.pow(ankleMidX - hipMidX, 2) + Math.pow(ankleMidY - hipMidY, 2)
            );
            return {
              centerX: (hipMidX + ankleMidX) / 2,
              centerY: (hipMidY + ankleMidY) / 2,
              width: hipWidth * 1.4,
              height: bottomHeight * 1.05,
              rotation: bodyAngle,
              shoulderAngle: 0,
              bodyAngle,
            };

          case "dresses":
            const dressHeight = Math.sqrt(
              Math.pow(kneeMidX - shoulderMidX, 2) + Math.pow(kneeMidY - shoulderMidY, 2)
            );
            return {
              centerX: (shoulderMidX + kneeMidX) / 2,
              centerY: (shoulderMidY + kneeMidY) / 2,
              width: Math.max(shoulderWidth, hipWidth) * 1.5,
              height: dressHeight * 1.1,
              rotation: bodyAngle,
              shoulderAngle,
              bodyAngle,
            };

          case "accessories":
            return {
              centerX: shoulderMidX,
              centerY: shoulderMidY - torsoHeight * 0.3,
              width: shoulderWidth * 0.8,
              height: torsoHeight * 0.4,
              rotation: 0,
              shoulderAngle: 0,
              bodyAngle: 0,
            };

          default:
            return null;
        }
      },
      [landmarks]
    );

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (backgroundLoaded && backgroundImageRef.current) {
        const img = backgroundImageRef.current;
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }

      if (showGuidelines && landmarks) {
        ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;

        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

        ctx.beginPath();
        ctx.moveTo(leftShoulder.x * canvas.width, leftShoulder.y * canvas.height);
        ctx.lineTo(rightShoulder.x * canvas.width, rightShoulder.y * canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(leftHip.x * canvas.width, leftHip.y * canvas.height);
        ctx.lineTo(rightHip.x * canvas.width, rightHip.y * canvas.height);
        ctx.stroke();

        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const hipMidY = (leftHip.y + rightHip.y) / 2;

        ctx.beginPath();
        ctx.moveTo(shoulderMidX * canvas.width, shoulderMidY * canvas.height);
        ctx.lineTo(hipMidX * canvas.width, hipMidY * canvas.height);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      const sortedGarments = [...garments].sort((a, b) => a.zIndex - b.zIndex);

      for (const garment of sortedGarments) {
        const placement = getGarmentPlacement(garment);
        const garmentImg = loadedImages.get(garment.imageUrl);

        if (!placement || !garmentImg) continue;

        ctx.save();

        const centerX = placement.centerX * canvas.width + garment.position.x;
        const centerY = placement.centerY * canvas.height + garment.position.y;
        const drawWidth = placement.width * canvas.width * garment.scale;
        const drawHeight = placement.height * canvas.height * garment.scale;

        ctx.translate(centerX, centerY);
        ctx.rotate(((placement.rotation + garment.rotation) * Math.PI) / 180);
        ctx.globalAlpha = garment.opacity;

        ctx.drawImage(
          garmentImg,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      }

      if (showPoseSkeleton && landmarks) {
        drawPoseOnCanvas(ctx, landmarks, {
          showLandmarks: true,
          showConnections: true,
          landmarkColor: "rgba(255, 100, 100, 0.8)",
          connectionColor: "rgba(100, 255, 100, 0.6)",
          landmarkRadius: 4,
          connectionWidth: 2,
        });
      }
    }, [
      backgroundLoaded,
      landmarks,
      garments,
      loadedImages,
      showPoseSkeleton,
      showGuidelines,
      getGarmentPlacement,
    ]);

    useEffect(() => {
      drawCanvas();
    }, [drawCanvas]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && onCanvasReady) {
        onCanvasReady(canvas);
      }
    }, [onCanvasReady]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      exportAsDataUrl: (format = "image/png", quality = 1) => {
        return canvasRef.current?.toDataURL(format, quality) || null;
      },
      exportAsBlob: async (format = "image/png", quality = 1) => {
        return new Promise((resolve) => {
          if (!canvasRef.current) {
            resolve(null);
            return;
          }
          canvasRef.current.toBlob(
            (blob) => resolve(blob),
            format,
            quality
          );
        });
      },
      redraw: drawCanvas,
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`${className}`}
        data-testid="try-on-canvas"
      />
    );
  }
);

TryOnCanvas.displayName = "TryOnCanvas";
