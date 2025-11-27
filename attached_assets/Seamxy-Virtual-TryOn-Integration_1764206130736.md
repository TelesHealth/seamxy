# Seamxy Virtual Try-On - Integration Guide

## Overview

This document provides detailed instructions for adding virtual try-on capabilities to Seamxy. The feature integrates with existing AI Stylists, the creator marketplace, and subscription tiers.

**Feature Name Options:**
- "Seamxy Try-On" (recommended)
- "Virtual Mirror"
- "See It On Me"

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SEAMXY PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  AI Stylist  │───▶│  Try-On      │───▶│  Booking Flow    │  │
│  │  Chat        │    │  Experience  │    │  Conversion      │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                     │             │
│         ▼                   ▼                     ▼             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Shared Services                         │  │
│  │  • AWS S3 (existing)      • Stripe Connect (existing)    │  │
│  │  • Neon PostgreSQL        • OpenAI GPT-4                 │  │
│  │  • MediaPipe Pose (new)   • MediaPipe Segmentation (new) │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Existing Seamxy Stack (No Changes Needed)
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Storage:** AWS S3
- **Payments:** Stripe + Stripe Connect
- **AI:** OpenAI GPT-4
- **Hosting:** Replit/Vercel/Railway

### New Additions
- MediaPipe Pose Detection (client-side)
- MediaPipe Selfie Segmentation (client-side)
- Virtual try-on canvas rendering

---

## Integration Points

### 1. AI Stylist Chat → Try-On
When the AI recommends an item, users can instantly try it on.

```
User: "I need a dress for a summer wedding"
AI Stylist: "I recommend this floral midi dress from [Stylist Portfolio]..."
           [Try It On] button appears
User: Clicks → Opens try-on with that garment
```

### 2. Stylist Portfolio → Try-On Ready
Stylists upload garments with overlay configurations for virtual try-on.

### 3. Subscription Tiers
| Tier | Try-Ons per Day | Price |
|------|-----------------|-------|
| Free | 3 | $0 |
| Premium | Unlimited | $9.99/month |
| Pro | Unlimited + AR | $19.99/month |

### 4. Creator Marketplace
Bespoke designers can let clients preview custom designs before ordering.

---

# DATABASE SCHEMA

## New Tables for Seamxy

### Prompt for Replit:

```
Add new database tables to Seamxy for virtual try-on functionality. These integrate with existing users, stylists, and subscriptions.

Add to `shared/schema.ts`:

```typescript
// ============================================
// VIRTUAL TRY-ON TABLES
// ============================================

// Garments available for try-on (linked to stylist portfolios)
export const tryonGarments = pgTable('tryon_garments', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Link to stylist who uploaded this
  stylistId: uuid('stylist_id').references(() => stylists.id),
  
  // Link to portfolio image (optional - can be standalone)
  portfolioImageId: uuid('portfolio_image_id').references(() => portfolioImages.id),
  
  name: text('name').notNull(),
  category: text('category', { 
    enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories'] 
  }).notNull(),
  description: text('description'),
  
  // S3 paths (using existing S3 bucket)
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  
  // Overlay configuration for positioning on body
  overlayConfig: jsonb('overlay_config').$type<{
    category: 'top' | 'bottom' | 'dress' | 'outerwear';
    anchorPoints: {
      type: 'shoulders' | 'hips' | 'full';
      offsetY: number; // percentage offset from anchor
    };
    scale: {
      baseWidth: number; // percentage of shoulder/hip width
      aspectRatio: number;
    };
    controlPoints?: Array<{ x: number; y: number }>; // For TPS warping
    zIndex: number;
  }>(),
  
  // Size and pricing (for marketplace items)
  sizesAvailable: text('sizes_available').array(),
  price: decimal('price', { precision: 10, scale: 2 }),
  externalPurchaseUrl: text('external_purchase_url'),
  
  // Visibility
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(false), // Available to all users or just this stylist's clients
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User try-on sessions
export const tryonSessions = pgTable('tryon_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // User who created this session
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Optional: which stylist context (for analytics)
  stylistId: uuid('stylist_id').references(() => stylists.id),
  
  // Optional: which chat session triggered this
  chatSessionId: uuid('chat_session_id').references(() => chatSessions.id),
  
  // User's uploaded photo (S3 path)
  userPhotoUrl: text('user_photo_url').notNull(),
  userPhotoThumbnailUrl: text('user_photo_thumbnail_url'),
  
  // Detected body measurements (normalized 0-1 coordinates)
  bodyMeasurements: jsonb('body_measurements').$type<{
    shoulderWidth: number;
    torsoHeight: number;
    hipWidth: number;
    fullHeight: number;
    landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
  }>(),
  
  // User's actual height for real measurements
  userHeightCm: integer('user_height_cm'),
  
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Auto-cleanup after 30 days
});

// Individual try-on results within a session
export const tryonResults = pgTable('tryon_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  sessionId: uuid('session_id').references(() => tryonSessions.id).notNull(),
  
  // Garments used in this try-on (can be multiple for outfit)
  garmentIds: uuid('garment_ids').array().notNull(),
  
  // Generated result image (S3 path)
  resultImageUrl: text('result_image_url'),
  resultThumbnailUrl: text('result_thumbnail_url'),
  
  // Size recommendation generated
  sizeRecommendation: jsonb('size_recommendation').$type<{
    recommendedSize: string;
    confidence: number;
    fitDescription: string;
    alternativeSize?: string;
    measurements?: {
      chest?: number;
      waist?: number;
      hips?: number;
    };
  }>(),
  
  // User actions
  savedToCloset: boolean('saved_to_closet').default(false),
  sharedPublicly: boolean('shared_publicly').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Track try-on usage for rate limiting
export const tryonUsage = pgTable('tryon_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  count: integer('count').default(0),
}, (table) => ({
  userDateIdx: uniqueIndex('tryon_usage_user_date_idx').on(table.userId, table.date),
}));

// User's saved virtual closet
export const virtualCloset = pgTable('virtual_closet', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  garmentId: uuid('garment_id').references(() => tryonGarments.id).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
  notes: text('notes'),
}, (table) => ({
  userGarmentIdx: uniqueIndex('virtual_closet_user_garment_idx').on(table.userId, table.garmentId),
}));

// Social sharing and voting (public try-on results)
export const tryonShares = pgTable('tryon_shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  resultId: uuid('result_id').references(() => tryonResults.id).notNull(),
  
  // Public share settings
  shareCode: text('share_code').notNull().unique(), // Short code for sharing URL
  title: text('title'),
  
  // Voting
  voteCount: jsonb('vote_count').$type<{
    love: number;
    like: number;
    meh: number;
  }>().default({ love: 0, like: 0, meh: 0 }),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tryonVotes = pgTable('tryon_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  shareId: uuid('share_id').references(() => tryonShares.id).notNull(),
  
  // Voter (optional - anonymous voting allowed)
  oderId: uuid('voter_id').references(() => users.id),
  voterIp: text('voter_ip'), // For anonymous rate limiting
  
  vote: text('vote', { enum: ['love', 'like', 'meh'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fit feedback for brand learning
export const fitFeedback = pgTable('fit_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // What was tried/purchased
  garmentId: uuid('garment_id').references(() => tryonGarments.id),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  
  // Feedback
  sizePurchased: text('size_purchased').notNull(),
  sizeRecommended: text('size_recommended'), // What Seamxy suggested
  fitRating: text('fit_rating', { 
    enum: ['too_small', 'slightly_small', 'perfect', 'slightly_large', 'too_large'] 
  }).notNull(),
  wouldBuyAgain: boolean('would_buy_again'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// User brand preferences (learned from feedback)
export const userBrandPreferences = pgTable('user_brand_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  brand: text('brand').notNull(),
  
  // Learned adjustments
  sizeAdjustment: decimal('size_adjustment', { precision: 3, scale: 1 }), // -2 to +2
  avgFitRating: decimal('avg_fit_rating', { precision: 3, scale: 2 }),
  totalPurchases: integer('total_purchases').default(0),
  
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userBrandIdx: uniqueIndex('user_brand_pref_idx').on(table.userId, table.brand),
}));
```

After adding, run:
```bash
npm run db:push
```
```

---

# PHASE 1: Core Try-On Module

## 1.1 MediaPipe Integration

### Prompt for Replit:

```
Create the core MediaPipe integration for Seamxy virtual try-on. This handles body pose detection and measurements.

1. Install dependencies:
```bash
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils
```

2. Create `client/src/lib/tryon/poseDetection.ts`:

```typescript
import { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose';

// MediaPipe Pose landmark indices
export const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export interface BodyMeasurements {
  shoulderWidth: number;
  torsoHeight: number;
  hipWidth: number;
  fullHeight: number;
  landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
}

export interface PoseDetectionResult {
  success: boolean;
  measurements?: BodyMeasurements;
  error?: string;
}

class PoseDetector {
  private pose: Pose | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        this.pose = new Pose({
          locateFile: (file) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        this.pose.setOptions({
          modelComplexity: 1, // 0=lite, 1=full, 2=heavy
          smoothLandmarks: true,
          enableSegmentation: false, // We'll use separate segmentation
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Warm up the model with a dummy image
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 100;
        dummyCanvas.height = 100;
        
        await new Promise<void>((res) => {
          this.pose!.onResults(() => res());
          this.pose!.send({ image: dummyCanvas });
        });

        this.isInitialized = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  }

  async detectPose(image: HTMLImageElement | HTMLCanvasElement): Promise<PoseDetectionResult> {
    if (!this.pose) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.pose!.onResults((results: Results) => {
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          resolve({ success: false, error: 'No body detected in image' });
          return;
        }

        const landmarks = results.poseLandmarks;
        
        // Calculate body measurements from landmarks
        const measurements = this.calculateMeasurements(landmarks);
        
        resolve({
          success: true,
          measurements,
        });
      });

      this.pose!.send({ image });
    });
  }

  private calculateMeasurements(landmarks: any[]): BodyMeasurements {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const nose = landmarks[LANDMARKS.NOSE];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    // Calculate distances (normalized 0-1 coordinates)
    const shoulderWidth = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
      Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    const hipWidth = Math.sqrt(
      Math.pow(rightHip.x - leftHip.x, 2) +
      Math.pow(rightHip.y - leftHip.y, 2)
    );

    // Shoulder midpoint to hip midpoint
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const torsoHeight = Math.abs(hipMidY - shoulderMidY);

    // Full height: nose to ankle average
    const ankleAvgY = (leftAnkle.y + rightAnkle.y) / 2;
    const fullHeight = Math.abs(ankleAvgY - nose.y);

    return {
      shoulderWidth,
      torsoHeight,
      hipWidth,
      fullHeight,
      landmarks: landmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0,
        visibility: lm.visibility || 0,
      })),
    };
  }

  close(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

// Singleton instance
export const poseDetector = new PoseDetector();
```

3. Create `client/src/hooks/usePoseDetection.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { poseDetector, BodyMeasurements, PoseDetectionResult } from '../lib/tryon/poseDetection';

interface UsePoseDetectionOptions {
  autoInitialize?: boolean;
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}) {
  const { autoInitialize = true } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);

  useEffect(() => {
    if (autoInitialize) {
      setIsLoading(true);
      poseDetector.initialize()
        .then(() => {
          setIsReady(true);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }

    return () => {
      // Don't close on unmount - keep warm for other components
    };
  }, [autoInitialize]);

  const detectPose = useCallback(async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<PoseDetectionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await poseDetector.detectPose(image);
      
      if (result.success && result.measurements) {
        setMeasurements(result.measurements);
      } else {
        setError(result.error || 'Detection failed');
      }
      
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const reset = useCallback(() => {
    setMeasurements(null);
    setError(null);
  }, []);

  return {
    isLoading,
    isReady,
    error,
    measurements,
    detectPose,
    reset,
  };
}
```
```

---

## 1.2 Try-On Canvas Component

### Prompt for Replit:

```
Create the main try-on canvas component for Seamxy that renders clothing overlays on user photos.

Create `client/src/components/tryon/TryOnCanvas.tsx`:

```typescript
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BodyMeasurements, LANDMARKS } from '../../lib/tryon/poseDetection';

interface GarmentOverlay {
  id: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear';
  config: {
    anchorPoints: {
      type: 'shoulders' | 'hips' | 'full';
      offsetY: number;
    };
    scale: {
      baseWidth: number;
      aspectRatio: number;
    };
    zIndex: number;
  };
}

interface TryOnCanvasProps {
  userImageUrl: string;
  measurements: BodyMeasurements;
  garments: GarmentOverlay[];
  onRenderComplete?: (resultDataUrl: string) => void;
  showLandmarks?: boolean; // Debug mode
  className?: string;
}

export function TryOnCanvas({
  userImageUrl,
  measurements,
  garments,
  onRenderComplete,
  showLandmarks = false,
  className = '',
}: TryOnCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // Load user image
  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // Preload all images
  useEffect(() => {
    const loadAllImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      
      // Load user image
      try {
        const userImg = await loadImage(userImageUrl);
        imageMap.set('user', userImg);
      } catch (e) {
        console.error('Failed to load user image:', e);
        return;
      }

      // Load garment images
      for (const garment of garments) {
        try {
          const img = await loadImage(garment.imageUrl);
          imageMap.set(garment.id, img);
        } catch (e) {
          console.error(`Failed to load garment ${garment.id}:`, e);
        }
      }

      setLoadedImages(imageMap);
    };

    loadAllImages();
  }, [userImageUrl, garments, loadImage]);

  // Render the try-on composite
  useEffect(() => {
    if (!canvasRef.current || loadedImages.size === 0) return;
    
    const userImage = loadedImages.get('user');
    if (!userImage) return;

    setIsRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match user image
    canvas.width = userImage.width;
    canvas.height = userImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw user image as background
    ctx.drawImage(userImage, 0, 0);

    // Sort garments by zIndex and draw each
    const sortedGarments = [...garments].sort((a, b) => 
      a.config.zIndex - b.config.zIndex
    );

    for (const garment of sortedGarments) {
      const garmentImg = loadedImages.get(garment.id);
      if (!garmentImg) continue;

      drawGarmentOverlay(ctx, garmentImg, garment, measurements, canvas.width, canvas.height);
    }

    // Draw debug landmarks if enabled
    if (showLandmarks) {
      drawLandmarks(ctx, measurements.landmarks, canvas.width, canvas.height);
    }

    setIsRendering(false);

    // Callback with result
    if (onRenderComplete) {
      onRenderComplete(canvas.toDataURL('image/jpeg', 0.9));
    }
  }, [loadedImages, garments, measurements, showLandmarks, onRenderComplete]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

// Helper function to draw a garment overlay
function drawGarmentOverlay(
  ctx: CanvasRenderingContext2D,
  garmentImg: HTMLImageElement,
  garment: GarmentOverlay,
  measurements: BodyMeasurements,
  canvasWidth: number,
  canvasHeight: number
) {
  const landmarks = measurements.landmarks;
  const { anchorPoints, scale } = garment.config;

  // Calculate anchor position based on type
  let anchorX: number;
  let anchorY: number;
  let referenceWidth: number;

  switch (anchorPoints.type) {
    case 'shoulders':
      const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
      anchorX = ((leftShoulder.x + rightShoulder.x) / 2) * canvasWidth;
      anchorY = ((leftShoulder.y + rightShoulder.y) / 2) * canvasHeight;
      referenceWidth = measurements.shoulderWidth * canvasWidth;
      break;
      
    case 'hips':
      const leftHip = landmarks[LANDMARKS.LEFT_HIP];
      const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
      anchorX = ((leftHip.x + rightHip.x) / 2) * canvasWidth;
      anchorY = ((leftHip.y + rightHip.y) / 2) * canvasHeight;
      referenceWidth = measurements.hipWidth * canvasWidth;
      break;
      
    case 'full':
    default:
      const shoulderMidX = (landmarks[LANDMARKS.LEFT_SHOULDER].x + landmarks[LANDMARKS.RIGHT_SHOULDER].x) / 2;
      const shoulderMidY = (landmarks[LANDMARKS.LEFT_SHOULDER].y + landmarks[LANDMARKS.RIGHT_SHOULDER].y) / 2;
      anchorX = shoulderMidX * canvasWidth;
      anchorY = shoulderMidY * canvasHeight;
      referenceWidth = measurements.shoulderWidth * canvasWidth;
      break;
  }

  // Apply Y offset
  anchorY += anchorPoints.offsetY * canvasHeight;

  // Calculate garment size
  const garmentWidth = referenceWidth * scale.baseWidth;
  const garmentHeight = garmentWidth * scale.aspectRatio;

  // Center the garment on anchor point
  const drawX = anchorX - garmentWidth / 2;
  const drawY = anchorY;

  // Draw with shadow for depth
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  
  ctx.drawImage(garmentImg, drawX, drawY, garmentWidth, garmentHeight);
  
  ctx.restore();
}

// Debug: draw landmarks
function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; visibility: number }>,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.fillStyle = '#FF0000';
  
  landmarks.forEach((lm, idx) => {
    if (lm.visibility > 0.5) {
      const x = lm.x * canvasWidth;
      const y = lm.y * canvasHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.fillText(idx.toString(), x + 7, y + 3);
      ctx.fillStyle = '#FF0000';
    }
  });
}

export default TryOnCanvas;
```
```

---

## 1.3 AWS S3 Integration (Using Existing)

### Prompt for Replit:

```
Extend Seamxy's existing S3 integration for virtual try-on images. The app already uses S3 for stylist portfolio images.

1. Update `server/services/s3.ts` to add try-on specific functions:

```typescript
// Add to existing s3.ts file

// S3 folder structure for try-on
export const TRYON_FOLDERS = {
  USER_PHOTOS: 'tryon/user-photos',
  RESULTS: 'tryon/results',
  GARMENTS: 'tryon/garments',
  THUMBNAILS: 'tryon/thumbnails',
};

// Generate pre-signed URL for user photo upload
export async function getTryOnUploadUrl(
  userId: string,
  filename: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${TRYON_FOLDERS.USER_PHOTOS}/${userId}/${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: 'image/jpeg',
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  
  return { uploadUrl, key };
}

// Upload processed try-on result
export async function uploadTryOnResult(
  sessionId: string,
  imageBuffer: Buffer
): Promise<string> {
  const key = `${TRYON_FOLDERS.RESULTS}/${sessionId}/${Date.now()}.jpg`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  }));
  
  return getPublicUrl(key);
}

// Upload garment image (for stylists)
export async function uploadGarmentImage(
  stylistId: string,
  imageBuffer: Buffer,
  filename: string
): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  const timestamp = Date.now();
  const imageKey = `${TRYON_FOLDERS.GARMENTS}/${stylistId}/${timestamp}-${filename}`;
  const thumbKey = `${TRYON_FOLDERS.THUMBNAILS}/${stylistId}/${timestamp}-thumb-${filename}`;
  
  // Process and upload main image
  const processedImage = await sharp(imageBuffer)
    .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
    
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageKey,
    Body: processedImage,
    ContentType: 'image/jpeg',
  }));
  
  // Create and upload thumbnail
  const thumbnail = await sharp(imageBuffer)
    .resize(300, 400, { fit: 'cover' })
    .jpeg({ quality: 75 })
    .toBuffer();
    
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: thumbKey,
    Body: thumbnail,
    ContentType: 'image/jpeg',
  }));
  
  return {
    imageUrl: getPublicUrl(imageKey),
    thumbnailUrl: getPublicUrl(thumbKey),
  };
}

// Delete old try-on sessions (cleanup job)
export async function cleanupExpiredTryOnSessions(
  olderThanDays: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  // Get expired sessions from database
  const expiredSessions = await db
    .select({ id: tryonSessions.id })
    .from(tryonSessions)
    .where(lt(tryonSessions.createdAt, cutoffDate));
  
  let deletedCount = 0;
  
  for (const session of expiredSessions) {
    // List and delete S3 objects
    const prefix = `${TRYON_FOLDERS.USER_PHOTOS}/${session.id}/`;
    // ... S3 deletion logic
    
    // Delete from database
    await db.delete(tryonSessions).where(eq(tryonSessions.id, session.id));
    deletedCount++;
  }
  
  return deletedCount;
}
```

2. Add sharp for image processing:
```bash
npm install sharp @types/sharp
```

3. Ensure S3 bucket CORS allows the frontend domain for presigned URLs.
```

---

## 1.4 Try-On API Routes

### Prompt for Replit:

```
Add virtual try-on API routes to Seamxy. These integrate with existing auth and rate limiting.

Create `server/routes/tryon.ts`:

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { rateLimitTryOn } from '../middleware/rateLimit';
import { db } from '../db';
import { 
  tryonSessions, 
  tryonResults, 
  tryonUsage, 
  tryonGarments,
  virtualCloset,
  tryonShares 
} from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTryOnUploadUrl, uploadTryOnResult, uploadGarmentImage } from '../services/s3';
import { nanoid } from 'nanoid';

const router = Router();

// ============================================
// SESSION MANAGEMENT
// ============================================

// Create try-on session with user photo
const createSessionSchema = z.object({
  stylistId: z.string().uuid().optional(),
  chatSessionId: z.string().uuid().optional(),
  userHeightCm: z.number().int().min(100).max(250).optional(),
});

router.post('/sessions', requireAuth, rateLimitTryOn, async (req, res) => {
  try {
    const { stylistId, chatSessionId, userHeightCm } = createSessionSchema.parse(req.body);
    const userId = req.user!.id;

    // Check daily usage limit (free tier: 3/day)
    const today = new Date().toISOString().split('T')[0];
    const [usage] = await db
      .select()
      .from(tryonUsage)
      .where(and(
        eq(tryonUsage.userId, userId),
        eq(tryonUsage.date, today)
      ));

    // Check if user has premium subscription
    const hasPremium = await checkUserPremiumStatus(userId);
    
    if (!hasPremium && usage && usage.count >= 3) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message: 'Upgrade to Premium for unlimited try-ons',
        upgradeUrl: '/pricing',
      });
    }

    // Get presigned upload URL for user photo
    const { uploadUrl, key } = await getTryOnUploadUrl(userId, 'photo.jpg');

    // Create session (photo URL will be updated after upload)
    const [session] = await db.insert(tryonSessions).values({
      userId,
      stylistId,
      chatSessionId,
      userHeightCm,
      userPhotoUrl: '', // Will be updated
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning();

    // Increment usage counter
    await db
      .insert(tryonUsage)
      .values({ userId, date: today, count: 1 })
      .onConflictDoUpdate({
        target: [tryonUsage.userId, tryonUsage.date],
        set: { count: sql`${tryonUsage.count} + 1` },
      });

    res.json({
      sessionId: session.id,
      uploadUrl,
      s3Key: key,
      usageRemaining: hasPremium ? 'unlimited' : Math.max(0, 3 - (usage?.count || 0) - 1),
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(400).json({ error: 'Failed to create session' });
  }
});

// Update session with photo URL and body measurements
const updateSessionSchema = z.object({
  userPhotoUrl: z.string().url(),
  userPhotoThumbnailUrl: z.string().url().optional(),
  bodyMeasurements: z.object({
    shoulderWidth: z.number(),
    torsoHeight: z.number(),
    hipWidth: z.number(),
    fullHeight: z.number(),
    landmarks: z.array(z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
      visibility: z.number(),
    })),
  }),
});

router.patch('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const data = updateSessionSchema.parse(req.body);
    const userId = req.user!.id;

    const [session] = await db
      .update(tryonSessions)
      .set({
        userPhotoUrl: data.userPhotoUrl,
        userPhotoThumbnailUrl: data.userPhotoThumbnailUrl,
        bodyMeasurements: data.bodyMeasurements,
      })
      .where(and(
        eq(tryonSessions.id, sessionId),
        eq(tryonSessions.userId, userId)
      ))
      .returning();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(400).json({ error: 'Failed to update session' });
  }
});

// ============================================
// TRY-ON RESULTS
// ============================================

// Create try-on result
const createResultSchema = z.object({
  sessionId: z.string().uuid(),
  garmentIds: z.array(z.string().uuid()).min(1).max(5),
  resultImageUrl: z.string().url().optional(),
});

router.post('/results', requireAuth, async (req, res) => {
  try {
    const data = createResultSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify session belongs to user
    const [session] = await db
      .select()
      .from(tryonSessions)
      .where(and(
        eq(tryonSessions.id, data.sessionId),
        eq(tryonSessions.userId, userId)
      ));

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get garment details for size recommendation
    const garments = await db
      .select()
      .from(tryonGarments)
      .where(sql`${tryonGarments.id} = ANY(${data.garmentIds})`);

    // Calculate size recommendation based on measurements
    const sizeRecommendation = calculateSizeRecommendation(
      session.bodyMeasurements,
      session.userHeightCm,
      garments[0] // Use first garment for recommendation
    );

    const [result] = await db.insert(tryonResults).values({
      sessionId: data.sessionId,
      garmentIds: data.garmentIds,
      resultImageUrl: data.resultImageUrl,
      sizeRecommendation,
    }).returning();

    res.json({ result });
  } catch (error) {
    console.error('Create result error:', error);
    res.status(400).json({ error: 'Failed to create result' });
  }
});

// ============================================
// GARMENT MANAGEMENT (Stylists)
// ============================================

// Get garments for try-on (public or stylist's own)
router.get('/garments', optionalAuth, async (req, res) => {
  try {
    const { stylistId, category } = req.query;
    
    let query = db.select().from(tryonGarments).where(eq(tryonGarments.isActive, true));
    
    if (stylistId) {
      // Get specific stylist's garments
      query = query.where(eq(tryonGarments.stylistId, stylistId as string));
    } else {
      // Get only public garments
      query = query.where(eq(tryonGarments.isPublic, true));
    }
    
    if (category) {
      query = query.where(eq(tryonGarments.category, category as string));
    }

    const garments = await query.limit(50);

    res.json({ garments });
  } catch (error) {
    console.error('Get garments error:', error);
    res.status(400).json({ error: 'Failed to get garments' });
  }
});

// Upload new garment (stylists only)
router.post('/garments', requireAuth, requireStylist, async (req, res) => {
  try {
    const stylistId = req.user!.stylistId;
    
    // Handle multipart form with image
    // ... implementation similar to portfolio upload
    
    res.json({ garment: newGarment });
  } catch (error) {
    console.error('Upload garment error:', error);
    res.status(400).json({ error: 'Failed to upload garment' });
  }
});

// ============================================
// VIRTUAL CLOSET
// ============================================

// Add to closet
router.post('/closet', requireAuth, async (req, res) => {
  try {
    const { garmentId, notes } = req.body;
    const userId = req.user!.id;

    const [item] = await db.insert(virtualCloset).values({
      userId,
      garmentId,
      notes,
    }).onConflictDoNothing().returning();

    res.json({ item: item || { alreadyExists: true } });
  } catch (error) {
    console.error('Add to closet error:', error);
    res.status(400).json({ error: 'Failed to add to closet' });
  }
});

// Get user's closet
router.get('/closet', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const items = await db
      .select({
        id: virtualCloset.id,
        garment: tryonGarments,
        addedAt: virtualCloset.addedAt,
        notes: virtualCloset.notes,
      })
      .from(virtualCloset)
      .innerJoin(tryonGarments, eq(virtualCloset.garmentId, tryonGarments.id))
      .where(eq(virtualCloset.userId, userId))
      .orderBy(desc(virtualCloset.addedAt));

    res.json({ items });
  } catch (error) {
    console.error('Get closet error:', error);
    res.status(400).json({ error: 'Failed to get closet' });
  }
});

// ============================================
// SOCIAL SHARING
// ============================================

// Share result publicly
router.post('/share', requireAuth, async (req, res) => {
  try {
    const { resultId, title } = req.body;
    const userId = req.user!.id;

    // Verify result belongs to user
    const [result] = await db
      .select()
      .from(tryonResults)
      .innerJoin(tryonSessions, eq(tryonResults.sessionId, tryonSessions.id))
      .where(and(
        eq(tryonResults.id, resultId),
        eq(tryonSessions.userId, userId)
      ));

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const shareCode = nanoid(10);

    const [share] = await db.insert(tryonShares).values({
      resultId,
      shareCode,
      title,
    }).returning();

    res.json({
      share,
      shareUrl: `${process.env.APP_URL}/looks/${shareCode}`,
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(400).json({ error: 'Failed to share' });
  }
});

// Vote on shared look (anonymous allowed)
router.post('/share/:shareCode/vote', async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { vote } = req.body; // 'love' | 'like' | 'meh'
    const voterIp = req.ip;

    const [share] = await db
      .select()
      .from(tryonShares)
      .where(eq(tryonShares.shareCode, shareCode));

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check for existing vote from this IP
    const [existingVote] = await db
      .select()
      .from(tryonVotes)
      .where(and(
        eq(tryonVotes.shareId, share.id),
        eq(tryonVotes.voterIp, voterIp)
      ));

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Record vote and update count
    await db.insert(tryonVotes).values({
      shareId: share.id,
      voterIp,
      vote,
    });

    const newCount = { ...share.voteCount };
    newCount[vote] = (newCount[vote] || 0) + 1;

    await db
      .update(tryonShares)
      .set({ voteCount: newCount })
      .where(eq(tryonShares.id, share.id));

    res.json({ voteCount: newCount });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(400).json({ error: 'Failed to vote' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  // Check existing subscriptions table for active premium
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
      sql`${subscriptions.planId} IN ('premium', 'pro')`
    ));

  return !!subscription;
}

function calculateSizeRecommendation(
  measurements: any,
  userHeightCm: number | null,
  garment: any
): any {
  // Basic size recommendation logic
  // See Phase 2 for enhanced algorithm
  
  if (!measurements || !userHeightCm) {
    return null;
  }

  // Convert normalized measurements to cm
  const pixelsPerCm = (measurements.fullHeight * 1000) / (userHeightCm * 0.9);
  const shoulderCm = (measurements.shoulderWidth * 1000) / pixelsPerCm;
  const hipCm = (measurements.hipWidth * 1000) / pixelsPerCm;

  // Simple size chart matching
  const sizeChart = {
    XS: { shoulder: 38, hip: 88 },
    S: { shoulder: 40, hip: 92 },
    M: { shoulder: 42, hip: 96 },
    L: { shoulder: 44, hip: 100 },
    XL: { shoulder: 46, hip: 104 },
  };

  let bestSize = 'M';
  let bestScore = Infinity;

  for (const [size, measurements] of Object.entries(sizeChart)) {
    const score = Math.abs(shoulderCm - measurements.shoulder) + 
                  Math.abs(hipCm - measurements.hip);
    if (score < bestScore) {
      bestScore = score;
      bestSize = size;
    }
  }

  return {
    recommendedSize: bestSize,
    confidence: Math.max(0, 100 - bestScore * 5),
    fitDescription: bestScore < 4 ? 'Good fit' : 'May need adjustments',
  };
}

export default router;
```

Then add to main routes file:
```typescript
// server/routes/index.ts
import tryonRoutes from './tryon';

app.use('/api/tryon', tryonRoutes);
```
```

---

# PHASE 2: AI Stylist Integration

## 2.1 Connect Try-On to AI Chat

### Prompt for Replit:

```
Integrate virtual try-on with Seamxy's AI stylist chat. When the AI recommends an item, show a "Try It On" button.

1. Update the AI response handler in `server/services/aiChat.ts`:

```typescript
// Add to existing aiChat.ts

interface AIResponseWithTryOn {
  aiResponse: string;
  portfolioReference?: {
    imageUrl: string;
    context: string;
  };
  suggestBooking: boolean;
  // NEW: Try-on suggestion
  tryOnSuggestion?: {
    garmentId: string;
    garmentName: string;
    garmentImageUrl: string;
    message: string;
  };
}

export async function handleAIChat(
  sessionId: string,
  userMessage: string,
  imageUrl?: string
): Promise<AIResponseWithTryOn> {
  // ... existing AI chat logic ...

  // After getting AI response, check if it mentions a garment
  const tryOnSuggestion = await detectTryOnOpportunity(
    stylistId,
    aiResponse,
    userMessage
  );

  return {
    aiResponse,
    portfolioReference,
    suggestBooking,
    tryOnSuggestion,
  };
}

async function detectTryOnOpportunity(
  stylistId: string,
  aiResponse: string,
  userMessage: string
): Promise<AIResponseWithTryOn['tryOnSuggestion'] | undefined> {
  // Keywords that suggest trying on clothes
  const tryOnKeywords = [
    'recommend', 'suggest', 'would look great', 'perfect for',
    'this dress', 'this top', 'this outfit', 'try this',
    'wear this', 'pair with', 'style with'
  ];

  const mentionsTryOn = tryOnKeywords.some(kw => 
    aiResponse.toLowerCase().includes(kw)
  );

  if (!mentionsTryOn) return undefined;

  // Get stylist's try-on enabled garments
  const [garments] = await db
    .select()
    .from(tryonGarments)
    .where(and(
      eq(tryonGarments.stylistId, stylistId),
      eq(tryonGarments.isActive, true)
    ))
    .limit(1);

  if (!garments) return undefined;

  // Simple matching: find garment mentioned in response
  // In production, use AI to match specific items
  const garment = garments[0];

  return {
    garmentId: garment.id,
    garmentName: garment.name,
    garmentImageUrl: garment.thumbnailUrl || garment.imageUrl,
    message: "Want to see how this looks on you?",
  };
}
```

2. Update the chat component to show try-on button:

```typescript
// client/src/components/chat/ChatMessage.tsx

interface ChatMessageProps {
  message: Message;
  onTryOn?: (garmentId: string) => void;
}

export function ChatMessage({ message, onTryOn }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%] rounded-lg p-4 bg-white shadow">
        {/* Message content */}
        <p className="text-gray-800">{message.content}</p>
        
        {/* Portfolio reference */}
        {message.portfolioReference && (
          <div className="mt-3 border-l-4 border-primary pl-3">
            <img 
              src={message.portfolioReference.imageUrl} 
              alt="Portfolio item"
              className="w-32 h-32 object-cover rounded"
            />
            <p className="text-sm text-gray-600 mt-1">
              {message.portfolioReference.context}
            </p>
          </div>
        )}
        
        {/* NEW: Try-on suggestion */}
        {message.tryOnSuggestion && (
          <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <div className="flex items-center gap-3">
              <img 
                src={message.tryOnSuggestion.garmentImageUrl}
                alt={message.tryOnSuggestion.garmentName}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {message.tryOnSuggestion.garmentName}
                </p>
                <p className="text-sm text-gray-600">
                  {message.tryOnSuggestion.message}
                </p>
              </div>
              <Button
                onClick={() => onTryOn?.(message.tryOnSuggestion!.garmentId)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try It On
              </Button>
            </div>
          </div>
        )}
        
        {/* Booking suggestion */}
        {message.suggestBooking && (
          <Button variant="outline" className="mt-3 w-full">
            Book a Consultation
          </Button>
        )}
      </div>
    </div>
  );
}
```

3. Add try-on modal that opens from chat:

```typescript
// client/src/components/chat/ChatTryOnModal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TryOnExperience } from '../tryon/TryOnExperience';

interface ChatTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentId: string;
  stylistId: string;
  chatSessionId: string;
}

export function ChatTryOnModal({
  isOpen,
  onClose,
  garmentId,
  stylistId,
  chatSessionId,
}: ChatTryOnModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Virtual Try-On</DialogTitle>
        </DialogHeader>
        
        <TryOnExperience
          initialGarmentId={garmentId}
          stylistId={stylistId}
          chatSessionId={chatSessionId}
          onComplete={(resultUrl) => {
            // Optionally send result back to chat
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```
```

---

## 2.2 Stylist Dashboard - Try-On Analytics

### Prompt for Replit:

```
Add try-on analytics to the Seamxy stylist dashboard. Stylists can see how their garments perform.

1. Add analytics API endpoint:

```typescript
// server/routes/stylist.ts - add to existing routes

// Get try-on analytics for stylist
router.get('/analytics/tryon', requireAuth, requireStylist, async (req, res) => {
  try {
    const stylistId = req.user!.stylistId;
    const { period = '30d' } = req.query;

    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Total try-on sessions for this stylist's garments
    const sessionStats = await db
      .select({
        totalSessions: sql<number>`COUNT(DISTINCT ${tryonSessions.id})`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${tryonSessions.userId})`,
      })
      .from(tryonSessions)
      .where(and(
        eq(tryonSessions.stylistId, stylistId),
        gte(tryonSessions.createdAt, startDate)
      ));

    // Most tried garments
    const topGarments = await db
      .select({
        garmentId: tryonGarments.id,
        garmentName: tryonGarments.name,
        thumbnailUrl: tryonGarments.thumbnailUrl,
        tryOnCount: sql<number>`COUNT(*)`,
        savedCount: sql<number>`SUM(CASE WHEN ${tryonResults.savedToCloset} THEN 1 ELSE 0 END)`,
      })
      .from(tryonResults)
      .innerJoin(tryonGarments, sql`${tryonGarments.id} = ANY(${tryonResults.garmentIds})`)
      .innerJoin(tryonSessions, eq(tryonResults.sessionId, tryonSessions.id))
      .where(and(
        eq(tryonGarments.stylistId, stylistId),
        gte(tryonSessions.createdAt, startDate)
      ))
      .groupBy(tryonGarments.id, tryonGarments.name, tryonGarments.thumbnailUrl)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(5);

    // Conversion funnel: Try-on → Save → Share → Book
    const conversionStats = await db
      .select({
        totalTryOns: sql<number>`COUNT(*)`,
        savedToCloset: sql<number>`SUM(CASE WHEN ${tryonResults.savedToCloset} THEN 1 ELSE 0 END)`,
        sharedPublicly: sql<number>`SUM(CASE WHEN ${tryonResults.sharedPublicly} THEN 1 ELSE 0 END)`,
      })
      .from(tryonResults)
      .innerJoin(tryonSessions, eq(tryonResults.sessionId, tryonSessions.id))
      .where(and(
        eq(tryonSessions.stylistId, stylistId),
        gte(tryonSessions.createdAt, startDate)
      ));

    // Daily trend
    const dailyTrend = await db
      .select({
        date: sql<string>`DATE(${tryonSessions.createdAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(tryonSessions)
      .where(and(
        eq(tryonSessions.stylistId, stylistId),
        gte(tryonSessions.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${tryonSessions.createdAt})`)
      .orderBy(sql`DATE(${tryonSessions.createdAt})`);

    res.json({
      summary: sessionStats[0],
      topGarments,
      conversion: conversionStats[0],
      dailyTrend,
    });
  } catch (error) {
    console.error('Try-on analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});
```

2. Create analytics component for stylist dashboard:

```typescript
// client/src/components/stylist/TryOnAnalytics.tsx

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Heart, Share2, TrendingUp } from 'lucide-react';

interface TryOnAnalyticsProps {
  period?: '7d' | '30d' | '90d';
}

export function TryOnAnalytics({ period = '30d' }: TryOnAnalyticsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['tryonAnalytics', period],
    queryFn: async () => {
      const res = await fetch(`/api/stylist/analytics/tryon?period=${period}`);
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Try-Ons</p>
                <p className="text-2xl font-bold">{data.summary.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold">{data.summary.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saved to Closet</p>
                <p className="text-2xl font-bold">{data.conversion.savedToCloset}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Shared Publicly</p>
                <p className="text-2xl font-bold">{data.conversion.sharedPublicly}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Try-On Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Garments */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topGarments.map((garment: any) => (
              <div key={garment.garmentId} className="flex items-center gap-4">
                <img
                  src={garment.thumbnailUrl}
                  alt={garment.garmentName}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{garment.garmentName}</p>
                  <p className="text-sm text-gray-600">
                    {garment.tryOnCount} try-ons • {garment.savedCount} saves
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {Math.round((garment.savedCount / garment.tryOnCount) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Save rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

3. Add to stylist dashboard tabs:

```typescript
// In StylistDashboard.tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="training">AI Training</TabsTrigger>
    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
    <TabsTrigger value="tryon">Try-On</TabsTrigger>  {/* NEW */}
    <TabsTrigger value="conversations">Chats</TabsTrigger>
  </TabsList>
  
  {/* ... other tabs ... */}
  
  <TabsContent value="tryon">
    <TryOnAnalytics />
  </TabsContent>
</Tabs>
```
```

---

# PHASE 3: Subscription Integration

## 3.1 Rate Limiting Middleware

### Prompt for Replit:

```
Add try-on rate limiting middleware that checks subscription status. Free tier gets 3/day, premium gets unlimited.

Create `server/middleware/rateLimitTryOn.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tryonUsage, subscriptions } from '../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

const FREE_TIER_DAILY_LIMIT = 3;

export async function rateLimitTryOn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Check for active premium subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ));

    const isPremium = subscription && ['premium', 'pro'].includes(subscription.planId);

    // Premium users bypass limit
    if (isPremium) {
      req.isPremium = true;
      return next();
    }

    // Check daily usage for free tier
    const today = new Date().toISOString().split('T')[0];
    
    const [usage] = await db
      .select()
      .from(tryonUsage)
      .where(and(
        eq(tryonUsage.userId, userId),
        eq(tryonUsage.date, today)
      ));

    const currentCount = usage?.count || 0;

    if (currentCount >= FREE_TIER_DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message: `You've used all ${FREE_TIER_DAILY_LIMIT} free try-ons today. Upgrade to Premium for unlimited access!`,
        upgradeUrl: '/pricing',
        resetsAt: getNextMidnight(),
        remaining: 0,
      });
    }

    // Add remaining count to request for frontend
    req.tryOnRemaining = FREE_TIER_DAILY_LIMIT - currentCount;
    req.isPremium = false;

    next();
  } catch (error) {
    console.error('Rate limit check error:', error);
    next(); // Fail open
  }
}

function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      isPremium?: boolean;
      tryOnRemaining?: number;
    }
  }
}
```
```

---

## 3.2 Premium Upgrade Flow

### Prompt for Replit:

```
Create the premium upgrade flow for try-on features using existing Stripe Connect integration.

1. Add subscription plans for try-on:

```typescript
// shared/constants.ts

export const TRYON_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    dailyTryOns: 3,
    features: ['3 try-ons per day', 'Basic size recommendations', 'Save to closet'],
    price: 0,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    dailyTryOns: Infinity,
    features: [
      'Unlimited try-ons',
      'Advanced size recommendations',
      'Brand fit learning',
      'Priority support',
      'AR live preview',
    ],
    price: 999, // $9.99/month in cents
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    dailyTryOns: Infinity,
    features: [
      'Everything in Premium',
      'API access',
      'Bulk try-on processing',
      'White-label embeds',
    ],
    price: 1999, // $19.99/month
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
};
```

2. Create upgrade component:

```typescript
// client/src/components/tryon/UpgradePrompt.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface UpgradePromptProps {
  remaining: number;
  resetsAt?: string;
  onClose?: () => void;
}

export function UpgradePrompt({ remaining, resetsAt, onClose }: UpgradePromptProps) {
  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      return res.json();
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    },
  });

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl border border-pink-200">
      {remaining === 0 ? (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              You've used all your free try-ons today
            </h3>
            <p className="text-gray-600 mt-2">
              {resetsAt && `Resets at ${new Date(resetsAt).toLocaleTimeString()}`}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-pink-600">{remaining}</span> free try-ons remaining today
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-2 border-pink-300 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <CardTitle className="text-lg">Premium</CardTitle>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Unlimited try-ons
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Advanced size recommendations
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                AR live preview
              </li>
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
              onClick={() => upgradeMutation.mutate('premium')}
              disabled={upgradeMutation.isPending}
            >
              {upgradeMutation.isPending ? 'Loading...' : 'Upgrade to Premium'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pro</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Everything in Premium
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                API access
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                White-label embeds
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => upgradeMutation.mutate('pro')}
              disabled={upgradeMutation.isPending}
            >
              Go Pro
            </Button>
          </CardContent>
        </Card>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      )}
    </div>
  );
}
```
```

---

# PHASE 4: Enhanced Features

## See PHASES from Original Document

The following phases from the original TryFit document apply directly to Seamxy with minimal changes:

### From Original Phase 1:
- **1.1 TPS Warping** - No changes needed
- **1.2 Body Segmentation** - No changes needed  
- **1.3 Shadow Generation** - No changes needed

### From Original Phase 2:
- **2.1 Height Calibration** - Add `userHeightCm` to existing users table
- **2.2 Enhanced Size Recommendations** - No changes needed

### From Original Phase 3:
- **3.2 Image Compression** - No changes (already using S3)
- **3.3 Cursor Pagination** - Apply to garments endpoint
- **3.4 MediaPipe Preloading** - Trigger on landing page

### From Original Phase 4:
- **4.1 AR Live Preview** - No changes needed
- **4.2 Outfit Recommendations** - Integrate with stylist portfolios
- **4.3 Fit History** - No changes needed

---

# Summary & Implementation Order

## Recommended Rollout for Seamxy

### Week 1: Foundation
1. ✅ Database schema additions
2. ✅ MediaPipe integration
3. ✅ Basic try-on canvas
4. ✅ S3 integration (extend existing)

### Week 2: Core Features
5. ✅ Try-on API routes
6. ✅ Rate limiting middleware
7. ✅ Subscription integration
8. ✅ User photo upload flow

### Week 3: AI Integration
9. ✅ Connect try-on to AI chat
10. ✅ Stylist garment uploads
11. ✅ Stylist dashboard analytics

### Week 4: Polish
12. ✅ Body segmentation (layering)
13. ✅ Shadow generation
14. ✅ Size recommendations
15. ✅ Virtual closet

### Week 5+: Advanced
16. ✅ AR live preview
17. ✅ Fit history & brand learning
18. ✅ TPS warping
19. ✅ Social sharing & voting

---

## Key Integration Points Checklist

- [ ] Add try-on tables to schema
- [ ] Run `npm run db:push`
- [ ] Add `/api/tryon/*` routes
- [ ] Add `rateLimitTryOn` middleware
- [ ] Extend S3 service with try-on folders
- [ ] Add `TryOnCanvas` component
- [ ] Add `usePoseDetection` hook
- [ ] Integrate with AI chat responses
- [ ] Add analytics to stylist dashboard
- [ ] Add upgrade flow with Stripe
- [ ] Add try-on tab to user profile

---

## Environment Variables to Add

```bash
# Add to .env (most already exist from Seamxy setup)

# MediaPipe models are loaded from CDN - no config needed

# Optional: Custom CDN for MediaPipe models
MEDIAPIPE_CDN_URL=https://cdn.jsdelivr.net/npm/@mediapipe

# Stripe price IDs for try-on subscriptions
STRIPE_PREMIUM_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
```

---

## Quick Reference: Seamxy Stack

| Layer | Technology | Try-On Usage |
|-------|------------|--------------|
| Frontend | React 18 + Vite | TryOnCanvas, usePoseDetection |
| Styling | Tailwind + Shadcn | Existing components |
| State | Zustand + TanStack Query | Session state, caching |
| Backend | Express + TypeScript | /api/tryon/* routes |
| Database | Neon PostgreSQL + Drizzle | tryon_* tables |
| Storage | AWS S3 | tryon/* folders |
| Payments | Stripe Connect | Premium subscriptions |
| AI | OpenAI GPT-4 | Try-on suggestions in chat |
| CV | MediaPipe (client-side) | Pose detection, segmentation |

---

*Document generated for Seamxy virtual try-on integration*
*Version: 1.0*
*Last updated: November 2025*
