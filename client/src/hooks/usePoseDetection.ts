import { useState, useCallback, useRef, useEffect } from "react";
import {
  PoseDetector,
  PoseDetectionResult,
  getPoseDetector,
  PoseLandmark,
  BodyMeasurements,
  GarmentPlacement,
} from "@/lib/poseDetection";

export interface UsePoseDetectionOptions {
  autoInitialize?: boolean;
  onDetectionComplete?: (result: PoseDetectionResult | null) => void;
  onError?: (error: Error) => void;
}

export interface UsePoseDetectionReturn {
  isInitializing: boolean;
  isDetecting: boolean;
  isReady: boolean;
  error: Error | null;
  result: PoseDetectionResult | null;
  landmarks: PoseLandmark[] | null;
  measurements: BodyMeasurements | null;
  garmentPlacements: PoseDetectionResult["garmentPlacements"] | null;
  progress: number;
  initialize: () => Promise<void>;
  detectFromImage: (image: HTMLImageElement | HTMLCanvasElement) => Promise<PoseDetectionResult | null>;
  detectFromDataUrl: (dataUrl: string) => Promise<PoseDetectionResult | null>;
  startVideoDetection: (videoElement: HTMLVideoElement) => Promise<void>;
  stopVideoDetection: () => void;
  reset: () => void;
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionReturn {
  const { autoInitialize = false, onDetectionComplete, onError } = options;

  const [isInitializing, setIsInitializing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<PoseDetectionResult | null>(null);
  const [progress, setProgress] = useState(0);

  const detectorRef = useRef<PoseDetector | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialize = useCallback(async () => {
    if (isReady || isInitializing) return;

    setIsInitializing(true);
    setError(null);
    setProgress(0);

    try {
      detectorRef.current = getPoseDetector();

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await detectorRef.current.initialize();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      setProgress(100);
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to initialize pose detector");
      setError(error);
      onError?.(error);
    } finally {
      setIsInitializing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [isReady, isInitializing, onError]);

  const detectFromImage = useCallback(
    async (image: HTMLImageElement | HTMLCanvasElement): Promise<PoseDetectionResult | null> => {
      if (!detectorRef.current) {
        await initialize();
      }

      if (!detectorRef.current) {
        throw new Error("Pose detector not initialized");
      }

      setIsDetecting(true);
      setProgress(0);
      setError(null);

      try {
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => Math.min(prev + 5, 90));
        }, 50);

        const detectionResult = await detectorRef.current.detectFromImage(image);

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        setProgress(100);
        setResult(detectionResult);
        onDetectionComplete?.(detectionResult);

        return detectionResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Detection failed");
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsDetecting(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    },
    [initialize, onDetectionComplete, onError]
  );

  const detectFromDataUrl = useCallback(
    async (dataUrl: string): Promise<PoseDetectionResult | null> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
          try {
            const result = await detectFromImage(img);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          const error = new Error("Failed to load image");
          setError(error);
          onError?.(error);
          reject(error);
        };

        img.src = dataUrl;
      });
    },
    [detectFromImage, onError]
  );

  const startVideoDetection = useCallback(
    async (videoElement: HTMLVideoElement): Promise<void> => {
      if (!detectorRef.current) {
        await initialize();
      }

      if (!detectorRef.current) {
        throw new Error("Pose detector not initialized");
      }

      setIsDetecting(true);

      const handleResult = (detectionResult: PoseDetectionResult | null) => {
        setResult(detectionResult);
        onDetectionComplete?.(detectionResult);
      };

      await detectorRef.current.detectFromVideoElement(videoElement, handleResult);
    },
    [initialize, onDetectionComplete]
  );

  const stopVideoDetection = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stopCamera();
    }
    setIsDetecting(false);
  }, []);

  const reset = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setResult(null);
    setError(null);
    setProgress(0);
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [autoInitialize, initialize]);

  return {
    isInitializing,
    isDetecting,
    isReady,
    error,
    result,
    landmarks: result?.landmarks || null,
    measurements: result?.measurements || null,
    garmentPlacements: result?.garmentPlacements || null,
    progress,
    initialize,
    detectFromImage,
    detectFromDataUrl,
    startVideoDetection,
    stopVideoDetection,
    reset,
  };
}
