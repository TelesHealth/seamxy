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
