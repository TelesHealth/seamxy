import { useCallback, useEffect, useRef, useState } from "react";
import { BodyLandmark } from "../store/tryOnStore";
import { usePoseDetection } from "./usePoseDetection";

interface UseARCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  facingMode: "user" | "environment";
  fps: number;
  bodyDetected: boolean;
  currentLandmarks: BodyLandmark[] | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleCamera: () => void;
}

export function useARCamera(): UseARCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastFpsTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [fps, setFps] = useState(0);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<BodyLandmark[] | null>(null);

  const { detectFromImage } = usePoseDetection();

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setBodyDetected(false);
    setCurrentLandmarks(null);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);

      const processFrame = async () => {
        if (!videoRef.current) return;

        frameCount.current++;
        const now = performance.now();
        if (now - lastFpsTime.current >= 1000) {
          setFps(frameCount.current);
          frameCount.current = 0;
          lastFpsTime.current = now;
        }

        if (frameCount.current % 3 === 0 && videoRef.current) {
          const vid = videoRef.current;
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = vid.videoWidth || 640;
          tmpCanvas.height = vid.videoHeight || 480;
          const ctx2d = tmpCanvas.getContext("2d");
          if (ctx2d) {
            ctx2d.drawImage(vid, 0, 0);
            const result = await detectFromImage(tmpCanvas);
            if (result?.landmarks && result.landmarks.length > 0) {
              setCurrentLandmarks(result.landmarks as unknown as BodyLandmark[]);
              setBodyDetected(true);
            } else {
              setBodyDetected(false);
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(processFrame);
      };

      animFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  }, [facingMode, detectFromImage, stopCamera]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  useEffect(() => {
    if (isActive) startCamera();
  }, [facingMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    facingMode,
    fps,
    bodyDetected,
    currentLandmarks,
    startCamera,
    stopCamera,
    toggleCamera,
  };
}
