# SeamXY ← TryFit Merge Instructions
## Replit Agent: Integrate TryFit Virtual Try-On into SeamXY

These instructions merge the standalone TryFit app into SeamXY as its virtual try-on engine.
Follow every phase in order. Do not skip steps. Confirm each phase completes before starting the next.

---

## PRE-MERGE AUDIT
### Before touching any code, run these checks and report findings:

```bash
# 1. Confirm SeamXY's existing try-on files
find client/src -name "*try*" -o -name "*tryon*" -o -name "*TryOn*" | sort

# 2. Check what MediaPipe is already in SeamXY
grep -r "mediapipe" package.json

# 3. Check if zustand is already installed
grep "zustand" package.json

# 4. Check existing try-on schema tables
grep -A5 "try_on" shared/schema.ts

# 5. Check existing try-on routes
grep -n "try-on" server/routes.ts | head -30
```

Report everything found. Then proceed.

---

## PHASE 1: Install Missing Dependencies

### Step 1.1 — Add dependencies TryFit needs that SeamXY doesn't have

```bash
npm install zustand react-dropzone
```

SeamXY already has `@mediapipe/pose`, `@mediapipe/camera_utils`, `@mediapipe/drawing_utils`
so those do NOT need to be installed again.

### Step 1.2 — Verify installation

```bash
grep "zustand" package.json
grep "react-dropzone" package.json
```

Both should appear in dependencies before continuing.

---

## PHASE 2: Merge the Database Schema

SeamXY already has some try-on tables. TryFit adds several new ones.
All changes go in `shared/schema.ts`.

### Step 2.1 — Add the Zustand store state type imports (top of schema file)

No schema changes needed for this — just confirm these tables already exist in SeamXY's schema:
- `tryOnModels`
- `userTryOnPhotos`
- `tryOnSessions`
- `tryOnCloset`
- `tryOnFeedback`

If any are MISSING, report which ones are missing and do NOT proceed until confirmed.

### Step 2.2 — Add NEW tables from TryFit (append to shared/schema.ts)

Add these tables that TryFit has and SeamXY does not:

```typescript
// ── Outfit Votes (TryFit social sharing) ─────────────────────────
export const outfitVotes = pgTable("outfit_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => tryOnSessions.id, { onDelete: "cascade" }),
  voterId: varchar("voter_id").references(() => users.id, { onDelete: "set null" }),
  voterName: varchar("voter_name", { length: 100 }).notNull(),
  voteType: varchar("vote_type", { length: 20 }).notNull(), // love, like, meh, dislike
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Outfit Comments (TryFit social sharing) ───────────────────────
export const outfitComments = pgTable("outfit_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => tryOnSessions.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Saved Outfits ─────────────────────────────────────────────────
export const savedOutfits = pgTable("saved_outfits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  itemIds: text("item_ids").array().notNull().default(sql`'{}'::text[]`),
  previewImageUrl: varchar("preview_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Fit Feedback (TryFit brand learning) ─────────────────────────
export const fitFeedback = pgTable("fit_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  sizeOrdered: varchar("size_ordered", { length: 10 }).notNull(),
  fitRating: varchar("fit_rating", { length: 20 }).notNull(), // too_small | slightly_small | perfect | slightly_large | too_large
  wouldBuyAgain: boolean("would_buy_again").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── User Brand Preferences (calculated from fit feedback) ─────────
export const userBrandPreferences = pgTable("user_brand_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brand: varchar("brand", { length: 100 }).notNull(),
  averageFitScore: decimal("average_fit_score", { precision: 3, scale: 2 }),
  feedbackCount: integer("feedback_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Product Relations (Complete the Look) ─────────────────────────
export const productRelations = pgTable("product_relations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  relatedProductId: integer("related_product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  relationScore: integer("relation_score").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Product Tags (for recommendations) ───────────────────────────
export const productTags = pgTable("product_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**IMPORTANT:** Check the exact name of SeamXY's products table in the schema before writing these.
If it is called `products`, use `products.id`. If it is called something else, adjust the
foreign key references accordingly.

### Step 2.3 — Add height field to users table (if not already present)

Check if `users` table has a `heightCm` field. If NOT, add it:

```typescript
heightCm: integer("height_cm"),
bodyMeasurements: jsonb("body_measurements"),
```

### Step 2.4 — Add shareToken to tryOnSessions (if not already present)

Check if `tryOnSessions` has a `shareToken` field. If NOT, add:

```typescript
shareToken: varchar("share_token").unique(),
```

### Step 2.5 — Push schema changes to the database

```bash
npm run db:push
```

Confirm it completes without errors before proceeding.

---

## PHASE 3: Create the Zustand App Store

TryFit uses Zustand for global state (current photo, body landmarks, selected clothing layers).
SeamXY needs this for the try-on studio.

### Step 3.1 — Create `client/src/store/tryOnStore.ts`

```typescript
import { create } from "zustand";

export interface BodyLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface ClothingLayer {
  productId: number;
  imageUrl: string;
  category: string;
  name: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface TryOnState {
  // User photo
  userPhotoUrl: string | null;
  bodyLandmarks: BodyLandmark[] | null;
  isProcessingPhoto: boolean;

  // Selected clothing layers
  clothingLayers: ClothingLayer[];

  // Try-on result
  resultImageUrl: string | null;
  currentSessionId: string | null;

  // Selected model (if using pre-built model instead of photo)
  selectedModelId: string | null;

  // UI state
  warpEnabled: boolean;
  warpStrength: number;
  shadowOpacity: number;
  brightness: number;

  // Actions
  setUserPhoto: (url: string, landmarks: BodyLandmark[]) => void;
  clearUserPhoto: () => void;
  setProcessingPhoto: (value: boolean) => void;
  addClothingLayer: (layer: ClothingLayer) => void;
  removeClothingLayer: (productId: number) => void;
  updateLayerPosition: (productId: number, position: { x: number; y: number }) => void;
  updateLayerScale: (productId: number, scale: number) => void;
  updateLayerRotation: (productId: number, rotation: number) => void;
  reorderLayers: (layers: ClothingLayer[]) => void;
  clearLayers: () => void;
  setResultImage: (url: string, sessionId: string) => void;
  clearResult: () => void;
  setSelectedModel: (modelId: string | null) => void;
  setWarpEnabled: (value: boolean) => void;
  setWarpStrength: (value: number) => void;
  setShadowOpacity: (value: number) => void;
  setBrightness: (value: number) => void;
  resetStudio: () => void;
}

export const useTryOnStore = create<TryOnState>((set) => ({
  userPhotoUrl: null,
  bodyLandmarks: null,
  isProcessingPhoto: false,
  clothingLayers: [],
  resultImageUrl: null,
  currentSessionId: null,
  selectedModelId: null,
  warpEnabled: false,
  warpStrength: 50,
  shadowOpacity: 0.3,
  brightness: 1.0,

  setUserPhoto: (url, landmarks) =>
    set({ userPhotoUrl: url, bodyLandmarks: landmarks, isProcessingPhoto: false }),
  clearUserPhoto: () =>
    set({ userPhotoUrl: null, bodyLandmarks: null }),
  setProcessingPhoto: (value) =>
    set({ isProcessingPhoto: value }),
  addClothingLayer: (layer) =>
    set((state) => ({
      clothingLayers: [...state.clothingLayers.filter((l) => l.productId !== layer.productId), layer],
    })),
  removeClothingLayer: (productId) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.filter((l) => l.productId !== productId),
    })),
  updateLayerPosition: (productId, position) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, position } : l
      ),
    })),
  updateLayerScale: (productId, scale) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, scale } : l
      ),
    })),
  updateLayerRotation: (productId, rotation) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, rotation } : l
      ),
    })),
  reorderLayers: (layers) => set({ clothingLayers: layers }),
  clearLayers: () => set({ clothingLayers: [] }),
  setResultImage: (url, sessionId) =>
    set({ resultImageUrl: url, currentSessionId: sessionId }),
  clearResult: () =>
    set({ resultImageUrl: null, currentSessionId: null }),
  setSelectedModel: (modelId) =>
    set({ selectedModelId: modelId }),
  setWarpEnabled: (value) => set({ warpEnabled: value }),
  setWarpStrength: (value) => set({ warpStrength: value }),
  setShadowOpacity: (value) => set({ shadowOpacity: value }),
  setBrightness: (value) => set({ brightness: value }),
  resetStudio: () =>
    set({
      userPhotoUrl: null,
      bodyLandmarks: null,
      clothingLayers: [],
      resultImageUrl: null,
      currentSessionId: null,
      selectedModelId: null,
      warpEnabled: false,
      warpStrength: 50,
      shadowOpacity: 0.3,
      brightness: 1.0,
    }),
}));
```

---

## PHASE 4: Copy TryFit Utility Libraries

Create these new files in SeamXY. These are TryFit's core computer vision utilities.

### Step 4.1 — Create `client/src/lib/tpsWarp.ts`

This is TryFit's Thin Plate Spline warping utility. Copy it verbatim from the TryFit project:

- Source file in TryFit: `client/src/lib/tpsWarp.ts`
- Destination in SeamXY: `client/src/lib/tpsWarp.ts`

If you cannot access the TryFit source directly, create a stub:

```typescript
// TPS Warping - Thin Plate Spline deformation for clothing overlay
// This file needs to be copied from the TryFit project's client/src/lib/tpsWarp.ts
// Placeholder until the file is available

export interface ControlPoint {
  source: { x: number; y: number };
  target: { x: number; y: number };
}

export function applyTPSWarp(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  controlPoints: ControlPoint[],
  strength: number = 0.5
): void {
  // Stub: render image without warping until TPS implementation is copied
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}
```

### Step 4.2 — Create `client/src/lib/shadowGenerator.ts`

```typescript
// Pose-aware shadow generation for realistic clothing overlay blending

import { BodyLandmark } from "../store/tryOnStore";

export interface ShadowConfig {
  opacity: number;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export function generateClothingShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ShadowConfig
): void {
  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${config.opacity})`;
  ctx.shadowBlur = config.blur;
  ctx.shadowOffsetX = config.offsetX;
  ctx.shadowOffsetY = config.offsetY;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

export function getDefaultShadowConfig(landmarks: BodyLandmark[] | null): ShadowConfig {
  return {
    opacity: 0.3,
    blur: 8,
    offsetX: 2,
    offsetY: 4,
  };
}
```

### Step 4.3 — Create `client/src/lib/imageCompression.ts`

```typescript
// Client-side image compression before upload

export interface CompressionOptions {
  maxWidthOrHeight: number;
  quality: number;
  mimeType: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1200,
  quality: 0.85,
  mimeType: "image/jpeg",
};

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const max = opts.maxWidthOrHeight;

      if (width > max || height > max) {
        if (width > height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        opts.mimeType,
        opts.quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## PHASE 5: Copy TryFit Hooks

### Step 5.1 — Create `client/src/hooks/usePoseDetection.ts`

Check if SeamXY already has this hook. If it does, compare it to TryFit's version.
TryFit's version is more complete. Replace SeamXY's version with TryFit's:

- Source: TryFit `client/src/hooks/usePoseDetection.ts`
- Destination: `client/src/hooks/usePoseDetection.ts`

If you cannot access TryFit source directly, create this version:

```typescript
import { useCallback, useRef, useState } from "react";
import { BodyLandmark } from "../store/tryOnStore";

declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

interface UsePoseDetectionReturn {
  detectPose: (imageElement: HTMLImageElement | HTMLVideoElement) => Promise<BodyLandmark[] | null>;
  isModelLoaded: boolean;
  isDetecting: boolean;
  error: string | null;
}

export function usePoseDetection(): UsePoseDetectionReturn {
  const poseRef = useRef<any>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    if (poseRef.current) return poseRef.current;

    try {
      const { Pose } = await import("@mediapipe/pose");
      const pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseRef.current = pose;
      setIsModelLoaded(true);
      return pose;
    } catch (err) {
      setError("Failed to load pose detection model");
      throw err;
    }
  }, []);

  const detectPose = useCallback(
    async (imageElement: HTMLImageElement | HTMLVideoElement): Promise<BodyLandmark[] | null> => {
      setIsDetecting(true);
      setError(null);

      try {
        const pose = await loadModel();

        return new Promise((resolve) => {
          pose.onResults((results: any) => {
            setIsDetecting(false);
            if (results.poseLandmarks) {
              resolve(results.poseLandmarks as BodyLandmark[]);
            } else {
              resolve(null);
            }
          });

          pose.send({ image: imageElement }).catch((err: Error) => {
            setIsDetecting(false);
            setError(err.message);
            resolve(getMockLandmarks());
          });
        });
      } catch (err) {
        setIsDetecting(false);
        setError("Pose detection failed — using fallback");
        return getMockLandmarks();
      }
    },
    [loadModel]
  );

  return { detectPose, isModelLoaded, isDetecting, error };
}

// Fallback mock landmarks for development/error states
function getMockLandmarks(): BodyLandmark[] {
  return Array.from({ length: 33 }, (_, i) => ({
    x: 0.5 + (Math.random() - 0.5) * 0.3,
    y: i / 33,
    z: 0,
    visibility: 0.8,
  }));
}
```

### Step 5.2 — Create `client/src/hooks/useARCamera.ts`

```typescript
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

  const { detectPose } = usePoseDetection();

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
        if (!videoRef.current || !isActive) return;

        // FPS counter
        frameCount.current++;
        const now = performance.now();
        if (now - lastFpsTime.current >= 1000) {
          setFps(frameCount.current);
          frameCount.current = 0;
          lastFpsTime.current = now;
        }

        // Detect pose every 3rd frame to save resources
        if (frameCount.current % 3 === 0) {
          const landmarks = await detectPose(videoRef.current);
          if (landmarks) {
            setCurrentLandmarks(landmarks);
            setBodyDetected(true);
          } else {
            setBodyDetected(false);
          }
        }

        animFrameRef.current = requestAnimationFrame(processFrame);
      };

      animFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  }, [facingMode, detectPose, stopCamera]);

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
```

---

## PHASE 6: Replace the Virtual Try-On Component

SeamXY has a basic `virtual-try-on.tsx` modal. Replace it with TryFit's advanced version.

### Step 6.1 — Rename the existing SeamXY file

```bash
mv client/src/components/virtual-try-on.tsx client/src/components/virtual-try-on.legacy.tsx
```

Keep the legacy file for reference — do not delete it yet.

### Step 6.2 — Create the new `client/src/components/try-on/TryOnCanvas.tsx`

Create folder: `client/src/components/try-on/`

```typescript
import { useEffect, useRef, useCallback } from "react";
import { useTryOnStore, BodyLandmark, ClothingLayer } from "../../store/tryOnStore";
import { getDefaultShadowConfig } from "../../lib/shadowGenerator";

interface TryOnCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onResultGenerated?: (dataUrl: string) => void;
}

export function TryOnCanvas({
  width = 400,
  height = 600,
  className = "",
  onResultGenerated,
}: TryOnCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    userPhotoUrl,
    bodyLandmarks,
    clothingLayers,
    warpEnabled,
    warpStrength,
    shadowOpacity,
    brightness,
  } = useTryOnStore();

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !userPhotoUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base photo
    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    await new Promise<void>((res) => {
      baseImg.onload = () => res();
      baseImg.src = userPhotoUrl;
    });

    ctx.filter = `brightness(${brightness})`;
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Draw each clothing layer
    for (const layer of clothingLayers) {
      await renderClothingLayer(ctx, layer, bodyLandmarks, canvas, shadowOpacity);
    }
  }, [userPhotoUrl, clothingLayers, bodyLandmarks, warpEnabled, warpStrength, shadowOpacity, brightness]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const generateResult = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onResultGenerated?.(dataUrl);
  }, [onResultGenerated]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain rounded-xl"
        style={{ background: "#1a1a1a" }}
      />
      {!userPhotoUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
          <div className="text-4xl mb-3">👗</div>
          <p className="text-sm">Upload a photo to begin</p>
        </div>
      )}
    </div>
  );
}

async function renderClothingLayer(
  ctx: CanvasRenderingContext2D,
  layer: ClothingLayer,
  landmarks: BodyLandmark[] | null,
  canvas: HTMLCanvasElement,
  shadowOpacity: number
): Promise<void> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((res) => {
    img.onload = () => res();
    img.onerror = () => res();
    img.src = layer.imageUrl;
  });

  const { x, y } = getClothingPosition(layer, landmarks, canvas);
  const w = img.width * layer.scale;
  const h = img.height * layer.scale;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((layer.rotation * Math.PI) / 180);

  // Shadow
  ctx.shadowColor = `rgba(0,0,0,${shadowOpacity})`;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function getClothingPosition(
  layer: ClothingLayer,
  landmarks: BodyLandmark[] | null,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  if (!landmarks || landmarks.length < 25) {
    return { x: layer.position.x, y: layer.position.y };
  }

  const cat = layer.category.toLowerCase();

  if (cat === "tops" || cat === "dresses" || cat === "outerwear") {
    // Anchor to shoulder midpoint
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    return {
      x: ((leftShoulder.x + rightShoulder.x) / 2) * canvas.width - (canvas.width * 0.25),
      y: Math.min(leftShoulder.y, rightShoulder.y) * canvas.height,
    };
  }

  if (cat === "bottoms") {
    // Anchor to hip midpoint
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    return {
      x: ((leftHip.x + rightHip.x) / 2) * canvas.width - (canvas.width * 0.2),
      y: Math.min(leftHip.y, rightHip.y) * canvas.height,
    };
  }

  return { x: layer.position.x, y: layer.position.y };
}
```

### Step 6.3 — Create `client/src/components/try-on/SizeRecommendation.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import { useTryOnStore } from "../../store/tryOnStore";

interface SizeRecommendationProps {
  productId: number;
  brand: string;
  sizeChart?: Record<string, Record<string, number>>;
}

export function SizeRecommendation({ productId, brand, sizeChart }: SizeRecommendationProps) {
  const { bodyLandmarks } = useTryOnStore();

  const { data: recommendation } = useQuery({
    queryKey: ["/api/v1/size-recommendation", productId],
    enabled: !!bodyLandmarks && !!sizeChart,
  });

  if (!bodyLandmarks) {
    return (
      <p className="text-sm text-muted-foreground">
        Upload a photo to get your size recommendation
      </p>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Recommended Size</span>
        <span className="text-lg font-bold text-primary">
          {recommendation.size}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {recommendation.confidence}% confidence · {recommendation.fitDescription}
      </div>
      {recommendation.alternativeSizes?.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Also consider: {recommendation.alternativeSizes.join(", ")}
        </div>
      )}
      {recommendation.brandNote && (
        <div className="text-xs italic text-muted-foreground">
          {recommendation.brandNote}
        </div>
      )}
    </div>
  );
}
```

### Step 6.4 — Create `client/src/components/try-on/CompleteTheLook.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import { useTryOnStore } from "../../store/tryOnStore";
import { Button } from "../ui/button";

interface CompleteTheLookProps {
  productId: number;
}

export function CompleteTheLook({ productId }: CompleteTheLookProps) {
  const { addClothingLayer } = useTryOnStore();

  const { data: recommendations } = useQuery<any[]>({
    queryKey: [`/api/v1/products/${productId}/recommendations`],
  });

  if (!recommendations?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Complete the Look</h3>
      <div className="grid grid-cols-3 gap-2">
        {recommendations.slice(0, 6).map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs truncate">{item.name}</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7"
              onClick={() =>
                addClothingLayer({
                  productId: item.id,
                  imageUrl: item.imageUrl,
                  category: item.category,
                  name: item.name,
                  position: { x: 0, y: 0 },
                  scale: 1,
                  rotation: 0,
                })
              }
            >
              Try On
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 6.5 — Create `client/src/components/try-on/FitFeedbackModal.tsx`

```typescript
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { apiRequest } from "../../lib/queryClient";

interface FitFeedbackModalProps {
  productId: number;
  productName: string;
  brand: string;
  open: boolean;
  onClose: () => void;
}

const FIT_OPTIONS = [
  { value: "too_small", label: "Too Small" },
  { value: "slightly_small", label: "Slightly Small" },
  { value: "perfect", label: "Perfect" },
  { value: "slightly_large", label: "Slightly Large" },
  { value: "too_large", label: "Too Large" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function FitFeedbackModal({
  productId,
  productName,
  brand,
  open,
  onClose,
}: FitFeedbackModalProps) {
  const [sizeOrdered, setSizeOrdered] = useState("");
  const [fitRating, setFitRating] = useState("");
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/v1/fit-feedback", {
        productId,
        sizeOrdered,
        fitRating,
        wouldBuyAgain: wouldBuyAgain ?? true,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/fit-feedback"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate Your Fit</DialogTitle>
          <p className="text-sm text-muted-foreground">{productName} · {brand}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Size you ordered</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeOrdered(s)}
                  className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                    sizeOrdered === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">How did it fit?</label>
            <div className="flex gap-2 flex-wrap">
              {FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFitRating(opt.value)}
                  className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                    fitRating === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Would you buy again?</label>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setWouldBuyAgain(val)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    wouldBuyAgain === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Any notes? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm resize-none h-20 bg-background"
          />

          <Button
            className="w-full"
            disabled={!sizeOrdered || !fitRating || wouldBuyAgain === null || isPending}
            onClick={() => submitFeedback()}
          >
            {isPending ? "Saving..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## PHASE 7: Add the AR Try-On Page

### Step 7.1 — Create `client/src/pages/ar-try-on.tsx`

```typescript
import { useEffect } from "react";
import { useARCamera } from "../hooks/useARCamera";
import { useTryOnStore } from "../store/tryOnStore";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Link } from "wouter";
import { Camera, CameraOff, RotateCcw, ArrowLeft } from "lucide-react";

export default function ARTryOnPage() {
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

  const { clothingLayers, warpEnabled, warpStrength, setWarpEnabled, setWarpStrength } =
    useTryOnStore();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/shop">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-base font-semibold">AR Try-On</h1>
        <div className="flex items-center gap-2">
          <Badge variant={bodyDetected ? "default" : "secondary"} className="text-xs">
            {bodyDetected ? "Body Detected" : "No Body"}
          </Badge>
          <Badge variant="outline" className="text-xs text-white border-white/30">
            {fps} FPS
          </Badge>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Clothing overlay canvas would go here */}
        {clothingLayers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/50">
              <p className="text-sm">No outfit selected</p>
              <Link href="/shop">
                <Button variant="outline" size="sm" className="mt-2 text-white border-white/30">
                  Browse Shop
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm">Body Warping</span>
          <button
            onClick={() => setWarpEnabled(!warpEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              warpEnabled ? "bg-primary" : "bg-white/20"
            }`}
          />
        </div>

        {warpEnabled && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/60">
              <span>Warp Strength</span>
              <span>{warpStrength}%</span>
            </div>
            <Slider
              value={[warpStrength]}
              onValueChange={([v]) => setWarpStrength(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-white/30 text-white"
            onClick={toggleCamera}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip Camera
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/30 text-white"
            onClick={isActive ? stopCamera : startCamera}
          >
            {isActive ? (
              <><CameraOff className="w-4 h-4 mr-2" />Stop</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" />Start</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 8: Add New API Routes to SeamXY's Server

All new routes go in `server/routes.ts`. Add them to the existing route registration block.
Do NOT create a new routes file — append to the existing one.

### Step 8.1 — Add shared try-on routes (public)

```typescript
// ── Shared Try-On (Public) ────────────────────────────────────────
app.get("/api/v1/shared/:token", async (req, res) => {
  try {
    const session = await storage.getTryOnSessionByShareToken(req.params.token);
    if (!session) return res.status(404).json({ error: "Not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/v1/shared/:token/votes", async (req, res) => {
  try {
    const votes = await storage.getVotesForSession(req.params.token);
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/v1/shared/:token/votes", async (req, res) => {
  const { voteType, voterName } = req.body;
  const validVotes = ["love", "like", "meh", "dislike"];
  if (!validVotes.includes(voteType)) {
    return res.status(400).json({ error: "Invalid vote type" });
  }
  try {
    const vote = await storage.createVote(req.params.token, { voteType, voterName: voterName || "Anonymous" });
    res.status(201).json(vote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/v1/shared/:token/comments", async (req, res) => {
  try {
    const comments = await storage.getCommentsForSession(req.params.token);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/v1/shared/:token/comments", async (req, res) => {
  const { authorName, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Content required" });
  try {
    const comment = await storage.createComment(req.params.token, {
      authorName: authorName || "Anonymous",
      content: content.trim(),
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

### Step 8.2 — Add fit feedback routes (authenticated)

```typescript
// ── Fit Feedback ─────────────────────────────────────────────────
app.get("/api/v1/fit-feedback", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const feedback = await storage.getUserFitFeedback(userId);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/v1/fit-feedback", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { productId, sizeOrdered, fitRating, wouldBuyAgain, notes } = req.body;
    const feedback = await storage.createFitFeedback({
      userId,
      productId,
      sizeOrdered,
      fitRating,
      wouldBuyAgain,
      notes,
    });
    // Recalculate brand preferences in background
    storage.recalculateBrandPreferences(userId, productId).catch(console.error);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/v1/fit-feedback/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const feedback = await storage.updateFitFeedback(req.params.id, userId, req.body);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/v1/fit-feedback/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    await storage.deleteFitFeedback(req.params.id, userId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

### Step 8.3 — Add saved outfits routes (authenticated)

```typescript
// ── Saved Outfits ─────────────────────────────────────────────────
app.get("/api/v1/outfits/saved", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const outfits = await storage.getUserSavedOutfits(userId);
    res.json(outfits);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/v1/outfits/saved", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { name, itemIds, previewImageUrl } = req.body;
    const outfit = await storage.createSavedOutfit({ userId, name, itemIds, previewImageUrl });
    res.status(201).json(outfit);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/v1/outfits/saved/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    await storage.deleteSavedOutfit(req.params.id, userId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

### Step 8.4 — Add Complete the Look endpoint

```typescript
// ── Complete the Look ────────────────────────────────────────────
app.get("/api/v1/products/:id/recommendations", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 6;
    const recommendations = await storage.getProductRecommendations(productId, limit);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

### Step 8.5 — Add height update endpoint

```typescript
// ── User Height ───────────────────────────────────────────────────
app.patch("/api/v1/user/height", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { heightCm } = req.body;
    if (!heightCm || heightCm < 50 || heightCm > 300) {
      return res.status(400).json({ error: "Invalid height" });
    }
    const user = await storage.updateUserHeight(userId, heightCm);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
```

---

## PHASE 9: Add Storage Methods

In `server/storage.ts` (or wherever SeamXY's storage/db methods live), add these new methods.
Find the existing storage class/object and append to it:

```typescript
// ── Try-On Share Token ────────────────────────────────────────────
async getTryOnSessionByShareToken(token: string) {
  const [session] = await db
    .select()
    .from(tryOnSessions)
    .where(eq(tryOnSessions.shareToken, token));
  return session || null;
}

// ── Votes ─────────────────────────────────────────────────────────
async getVotesForSession(shareToken: string) {
  const session = await this.getTryOnSessionByShareToken(shareToken);
  if (!session) return { love: 0, like: 0, meh: 0, dislike: 0 };
  
  const votes = await db
    .select()
    .from(outfitVotes)
    .where(eq(outfitVotes.sessionId, session.id));
  
  return votes.reduce(
    (acc, v) => ({ ...acc, [v.voteType]: (acc[v.voteType as keyof typeof acc] || 0) + 1 }),
    { love: 0, like: 0, meh: 0, dislike: 0 }
  );
}

async createVote(shareToken: string, data: { voteType: string; voterName: string }) {
  const session = await this.getTryOnSessionByShareToken(shareToken);
  if (!session) throw new Error("Session not found");
  
  const [vote] = await db.insert(outfitVotes).values({
    sessionId: session.id,
    voterName: data.voterName,
    voteType: data.voteType,
  }).returning();
  return vote;
}

// ── Comments ──────────────────────────────────────────────────────
async getCommentsForSession(shareToken: string) {
  const session = await this.getTryOnSessionByShareToken(shareToken);
  if (!session) return [];
  
  return db
    .select()
    .from(outfitComments)
    .where(eq(outfitComments.sessionId, session.id))
    .orderBy(asc(outfitComments.createdAt));
}

async createComment(shareToken: string, data: { authorName: string; content: string }) {
  const session = await this.getTryOnSessionByShareToken(shareToken);
  if (!session) throw new Error("Session not found");
  
  const [comment] = await db.insert(outfitComments).values({
    sessionId: session.id,
    authorName: data.authorName,
    content: data.content,
  }).returning();
  return comment;
}

// ── Fit Feedback ──────────────────────────────────────────────────
async getUserFitFeedback(userId: string) {
  return db.select().from(fitFeedback).where(eq(fitFeedback.userId, userId));
}

async createFitFeedback(data: any) {
  const [feedback] = await db.insert(fitFeedback).values(data).returning();
  return feedback;
}

async updateFitFeedback(id: string, userId: string, data: any) {
  const [updated] = await db
    .update(fitFeedback)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(fitFeedback.id, id), eq(fitFeedback.userId, userId)))
    .returning();
  return updated;
}

async deleteFitFeedback(id: string, userId: string) {
  await db
    .delete(fitFeedback)
    .where(and(eq(fitFeedback.id, id), eq(fitFeedback.userId, userId)));
}

async recalculateBrandPreferences(userId: string, productId: number) {
  // Get product brand
  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product?.brand) return;
  
  // Get all feedback for this brand
  const allFeedback = await db
    .select()
    .from(fitFeedback)
    .innerJoin(products, eq(fitFeedback.productId, products.id))
    .where(and(eq(fitFeedback.userId, userId), eq(products.brand, product.brand)));
  
  const fitScoreMap: Record<string, number> = {
    too_small: 1, slightly_small: 2, perfect: 3, slightly_large: 4, too_large: 5,
  };
  
  const scores = allFeedback.map((f) => fitScoreMap[f.fit_feedback.fitRating] || 3);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  await db
    .insert(userBrandPreferences)
    .values({
      userId,
      brand: product.brand,
      averageFitScore: avg.toFixed(2),
      feedbackCount: scores.length,
    })
    .onConflictDoUpdate({
      target: [userBrandPreferences.userId, userBrandPreferences.brand],
      set: { averageFitScore: avg.toFixed(2), feedbackCount: scores.length, updatedAt: new Date() },
    });
}

// ── Saved Outfits ─────────────────────────────────────────────────
async getUserSavedOutfits(userId: string) {
  return db.select().from(savedOutfits).where(eq(savedOutfits.userId, userId));
}

async createSavedOutfit(data: any) {
  const [outfit] = await db.insert(savedOutfits).values(data).returning();
  return outfit;
}

async deleteSavedOutfit(id: string, userId: string) {
  await db
    .delete(savedOutfits)
    .where(and(eq(savedOutfits.id, id), eq(savedOutfits.userId, userId)));
}

// ── Product Recommendations (Complete the Look) ───────────────────
async getProductRecommendations(productId: number, limit: number = 6) {
  // Get explicit relations
  const relations = await db
    .select({ relatedProductId: productRelations.relatedProductId, score: productRelations.relationScore })
    .from(productRelations)
    .where(eq(productRelations.productId, productId));
  
  const scored = relations.map((r) => ({ id: r.relatedProductId, score: r.score }));
  const ids = scored.map((r) => r.id);
  
  if (ids.length === 0) {
    // Fall back: return products from different category
    const [source] = await db.select().from(products).where(eq(products.id, productId));
    return db
      .select()
      .from(products)
      .where(and(ne(products.id, productId), ne(products.category, source?.category)))
      .limit(limit);
  }
  
  return db.select().from(products).where(inArray(products.id, ids)).limit(limit);
}

// ── User Height ───────────────────────────────────────────────────
async updateUserHeight(userId: string, heightCm: number) {
  const [user] = await db
    .update(users)
    .set({ heightCm, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}
```

---

## PHASE 10: Register the AR Route in App.tsx

Open `client/src/App.tsx` and add the AR try-on route.

Find the existing `<Route>` block (where `/shop`, `/makers`, etc. are defined) and add:

```typescript
import ARTryOnPage from "./pages/ar-try-on";

// Inside the Route block:
<Route path="/ar" component={ARTryOnPage} />
```

---

## PHASE 11: Update the ProductCard "Try On" Button

The current "Try On" button opens the old modal. Update it to use the new Zustand store.

Find `client/src/components/product-card.tsx` (or wherever the ProductCard component is).

Replace the try-on button handler:

```typescript
// Add import at top:
import { useTryOnStore } from "../store/tryOnStore";

// Inside the component:
const { addClothingLayer } = useTryOnStore();

// Update the Try On button onClick:
onClick={() => {
  addClothingLayer({
    productId: product.id,
    imageUrl: product.imageUrl,
    category: product.category,
    name: product.name,
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  });
  // Navigate to the try-on studio
  window.location.href = "/shop?tryOn=true";
}}
```

---

## PHASE 12: Push Schema and Verify

### Step 12.1 — Run TypeScript check

```bash
npm run check
```

Fix any type errors before continuing.

### Step 12.2 — Push updated schema to database

```bash
npm run db:push
```

### Step 12.3 — Run the development server

```bash
npm run dev
```

### Step 12.4 — Test new endpoints

```bash
# Test Complete the Look
curl http://localhost:5000/api/v1/products/1/recommendations

# Test height update (requires auth cookie)
curl -X PATCH http://localhost:5000/api/v1/user/height \
  -H "Content-Type: application/json" \
  -d '{"heightCm": 175}'

# Test saved outfits (requires auth cookie)
curl http://localhost:5000/api/v1/outfits/saved
```

### Step 12.5 — Test the AR page

Navigate to `http://localhost:5000/ar` in a browser and confirm:
- The page loads without errors
- Camera access is requested
- The layout renders correctly

---

## PHASE 13: Cleanup

### Step 13.1 — Remove TryFit auth code (not needed)

TryFit used Replit OIDC auth. SeamXY uses Passport local auth. Do NOT port TryFit's
`passport` OIDC configuration — SeamXY's existing auth is correct and complete.

### Step 13.2 — Remove TryFit's Object Storage code

TryFit used Replit Object Storage. SeamXY uses AWS S3. Do NOT port `objectAcl.ts`
or `objectStorage.ts` from TryFit — SeamXY's S3 integration is already correct.

### Step 13.3 — Remove legacy file once confirmed working

```bash
# Only after confirming the new try-on components work correctly:
rm client/src/components/virtual-try-on.legacy.tsx
```

---

## Summary of All Files Created or Modified

| File | Action |
|---|---|
| `client/src/store/tryOnStore.ts` | Created |
| `client/src/lib/tpsWarp.ts` | Created |
| `client/src/lib/shadowGenerator.ts` | Created |
| `client/src/lib/imageCompression.ts` | Created |
| `client/src/hooks/usePoseDetection.ts` | Replaced |
| `client/src/hooks/useARCamera.ts` | Created |
| `client/src/components/try-on/TryOnCanvas.tsx` | Created |
| `client/src/components/try-on/SizeRecommendation.tsx` | Created |
| `client/src/components/try-on/CompleteTheLook.tsx` | Created |
| `client/src/components/try-on/FitFeedbackModal.tsx` | Created |
| `client/src/pages/ar-try-on.tsx` | Created |
| `client/src/components/virtual-try-on.tsx` | Renamed to .legacy |
| `client/src/App.tsx` | Modified (added /ar route) |
| `client/src/components/product-card.tsx` | Modified (try-on button) |
| `shared/schema.ts` | Modified (6 new tables, height field) |
| `server/routes.ts` | Modified (new API endpoints) |
| `server/storage.ts` | Modified (new storage methods) |
| `package.json` | Modified (zustand, react-dropzone) |

## Do Not Touch
- `server/services/anthropic.ts` — already updated in previous instructions
- `vercel.json` — already created in previous instructions
- `server/index.ts` — already updated in previous instructions
- Any file in the `Z` folder (per user preferences)
- TryFit's auth system — not needed
- TryFit's object storage — not needed
