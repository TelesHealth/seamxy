import { Pose, Results, Options } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface BodyMeasurements {
  shoulderWidth: number;
  chestWidth: number;
  waistWidth: number;
  hipWidth: number;
  torsoLength: number;
  armLength: number;
  legLength: number;
  neckToWaist: number;
  shoulderToElbow: number;
  elbowToWrist: number;
  hipToKnee: number;
  kneeToAnkle: number;
}

export interface GarmentPlacement {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotation: number;
  shoulderAngle: number;
  bodyAngle: number;
}

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export const POSE_CONNECTIONS = [
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

export interface PoseDetectionResult {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
  measurements: BodyMeasurements;
  garmentPlacements: {
    top: GarmentPlacement;
    bottom: GarmentPlacement;
    dress: GarmentPlacement;
  };
}

export type PoseDetectionCallback = (result: PoseDetectionResult | null) => void;

export class PoseDetector {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private isInitialized = false;
  private onResultCallback: PoseDetectionCallback | null = null;

  async initialize(options?: Partial<Options>): Promise<void> {
    if (this.isInitialized) return;

    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    const defaultOptions: Options = {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      ...options,
    };

    this.pose.setOptions(defaultOptions);
    this.pose.onResults(this.handleResults.bind(this));
    await this.pose.initialize();
    this.isInitialized = true;
  }

  private handleResults(results: Results): void {
    if (!results.poseLandmarks || !this.onResultCallback) {
      this.onResultCallback?.(null);
      return;
    }

    const landmarks: PoseLandmark[] = results.poseLandmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      visibility: lm.visibility || 0,
    }));

    const worldLandmarks: PoseLandmark[] = (results.poseWorldLandmarks || []).map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      visibility: lm.visibility || 0,
    }));

    const measurements = this.calculateMeasurements(landmarks, worldLandmarks);
    const garmentPlacements = this.calculateGarmentPlacements(landmarks);

    this.onResultCallback({
      landmarks,
      worldLandmarks,
      measurements,
      garmentPlacements,
    });
  }

  private distance2D(p1: PoseLandmark, p2: PoseLandmark): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2)
    );
  }

  private midpoint(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      z: (p1.z + p2.z) / 2,
      visibility: Math.min(p1.visibility, p2.visibility),
    };
  }

  private calculateMeasurements(landmarks: PoseLandmark[], worldLandmarks: PoseLandmark[]): BodyMeasurements {
    const lm = landmarks;
    const wlm = worldLandmarks.length > 0 ? worldLandmarks : landmarks;

    const leftShoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = lm[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftElbow = lm[POSE_LANDMARKS.LEFT_ELBOW];
    const rightElbow = lm[POSE_LANDMARKS.RIGHT_ELBOW];
    const leftWrist = lm[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = lm[POSE_LANDMARKS.RIGHT_WRIST];
    const leftHip = lm[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = lm[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = lm[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = lm[POSE_LANDMARKS.RIGHT_KNEE];
    const leftAnkle = lm[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = lm[POSE_LANDMARKS.RIGHT_ANKLE];
    const nose = lm[POSE_LANDMARKS.NOSE];

    const shoulderMid = this.midpoint(leftShoulder, rightShoulder);
    const hipMid = this.midpoint(leftHip, rightHip);

    return {
      shoulderWidth: this.distance2D(leftShoulder, rightShoulder),
      chestWidth: this.distance2D(leftShoulder, rightShoulder) * 1.1,
      waistWidth: this.distance2D(leftHip, rightHip) * 0.9,
      hipWidth: this.distance2D(leftHip, rightHip),
      torsoLength: this.distance2D(shoulderMid, hipMid),
      neckToWaist: this.distance2D(nose, hipMid),
      armLength: (
        this.distance2D(leftShoulder, leftElbow) + this.distance2D(leftElbow, leftWrist) +
        this.distance2D(rightShoulder, rightElbow) + this.distance2D(rightElbow, rightWrist)
      ) / 2,
      shoulderToElbow: (this.distance2D(leftShoulder, leftElbow) + this.distance2D(rightShoulder, rightElbow)) / 2,
      elbowToWrist: (this.distance2D(leftElbow, leftWrist) + this.distance2D(rightElbow, rightWrist)) / 2,
      legLength: (
        this.distance2D(leftHip, leftKnee) + this.distance2D(leftKnee, leftAnkle) +
        this.distance2D(rightHip, rightKnee) + this.distance2D(rightKnee, rightAnkle)
      ) / 2,
      hipToKnee: (this.distance2D(leftHip, leftKnee) + this.distance2D(rightHip, rightKnee)) / 2,
      kneeToAnkle: (this.distance2D(leftKnee, leftAnkle) + this.distance2D(rightKnee, rightAnkle)) / 2,
    };
  }

  private calculateGarmentPlacements(landmarks: PoseLandmark[]): PoseDetectionResult["garmentPlacements"] {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const shoulderMid = this.midpoint(leftShoulder, rightShoulder);
    const hipMid = this.midpoint(leftHip, rightHip);
    const kneeMid = this.midpoint(leftKnee, rightKnee);
    const ankleMid = this.midpoint(leftAnkle, rightAnkle);

    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    ) * (180 / Math.PI);

    const bodyAngle = Math.atan2(
      hipMid.y - shoulderMid.y,
      hipMid.x - shoulderMid.x
    ) * (180 / Math.PI) - 90;

    const shoulderWidth = this.distance2D(leftShoulder, rightShoulder);
    const hipWidth = this.distance2D(leftHip, rightHip);
    const torsoLength = this.distance2D(shoulderMid, hipMid);

    const topPlacement: GarmentPlacement = {
      centerX: (shoulderMid.x + hipMid.x) / 2,
      centerY: (shoulderMid.y + hipMid.y) / 2,
      width: shoulderWidth * 1.4,
      height: torsoLength * 1.1,
      rotation: bodyAngle,
      shoulderAngle,
      bodyAngle,
    };

    const bottomPlacement: GarmentPlacement = {
      centerX: (hipMid.x + kneeMid.x) / 2,
      centerY: (hipMid.y + ankleMid.y) / 2,
      width: hipWidth * 1.3,
      height: this.distance2D(hipMid, ankleMid) * 1.05,
      rotation: bodyAngle,
      shoulderAngle: 0,
      bodyAngle,
    };

    const dressPlacement: GarmentPlacement = {
      centerX: shoulderMid.x,
      centerY: (shoulderMid.y + kneeMid.y) / 2,
      width: Math.max(shoulderWidth, hipWidth) * 1.4,
      height: this.distance2D(shoulderMid, kneeMid) * 1.1,
      rotation: bodyAngle,
      shoulderAngle,
      bodyAngle,
    };

    return {
      top: topPlacement,
      bottom: bottomPlacement,
      dress: dressPlacement,
    };
  }

  async detectFromImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<PoseDetectionResult | null> {
    if (!this.pose || !this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.onResultCallback = resolve;
      this.pose!.send({ image: imageElement });
    });
  }

  async detectFromVideoElement(
    videoElement: HTMLVideoElement,
    onResult: PoseDetectionCallback
  ): Promise<void> {
    if (!this.pose || !this.isInitialized) {
      await this.initialize();
    }

    this.onResultCallback = onResult;

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.pose!.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    await this.camera.start();
  }

  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
  }

  destroy(): void {
    this.stopCamera();
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
    this.onResultCallback = null;
  }
}

export function drawPoseOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  options: {
    showLandmarks?: boolean;
    showConnections?: boolean;
    landmarkColor?: string;
    connectionColor?: string;
    landmarkRadius?: number;
    connectionWidth?: number;
  } = {}
): void {
  const {
    showLandmarks = true,
    showConnections = true,
    landmarkColor = "#FF0000",
    connectionColor = "#00FF00",
    landmarkRadius = 5,
    connectionWidth = 2,
  } = options;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  if (showConnections) {
    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = connectionWidth;

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    }
  }

  if (showLandmarks) {
    ctx.fillStyle = landmarkColor;

    for (const landmark of landmarks) {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, landmarkRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

export function estimateRealWorldMeasurements(
  pixelMeasurements: BodyMeasurements,
  knownHeightCm: number,
  landmarksNormalizedHeight: number
): BodyMeasurements {
  const scaleFactor = knownHeightCm / landmarksNormalizedHeight;

  return {
    shoulderWidth: pixelMeasurements.shoulderWidth * scaleFactor,
    chestWidth: pixelMeasurements.chestWidth * scaleFactor,
    waistWidth: pixelMeasurements.waistWidth * scaleFactor,
    hipWidth: pixelMeasurements.hipWidth * scaleFactor,
    torsoLength: pixelMeasurements.torsoLength * scaleFactor,
    neckToWaist: pixelMeasurements.neckToWaist * scaleFactor,
    armLength: pixelMeasurements.armLength * scaleFactor,
    shoulderToElbow: pixelMeasurements.shoulderToElbow * scaleFactor,
    elbowToWrist: pixelMeasurements.elbowToWrist * scaleFactor,
    legLength: pixelMeasurements.legLength * scaleFactor,
    hipToKnee: pixelMeasurements.hipToKnee * scaleFactor,
    kneeToAnkle: pixelMeasurements.kneeToAnkle * scaleFactor,
  };
}

export function getSizeRecommendation(
  measurements: BodyMeasurements,
  sizeChart: Record<string, { chest?: number; waist?: number; hip?: number; shoulder?: number }>
): { size: string; confidence: number; fit: string } {
  const sizes = Object.entries(sizeChart);
  let bestMatch = { size: "M", score: 0, fit: "standard" };

  for (const [size, chartMeasurements] of sizes) {
    let score = 0;
    let count = 0;

    if (chartMeasurements.shoulder) {
      const diff = Math.abs(measurements.shoulderWidth - chartMeasurements.shoulder);
      score += Math.max(0, 1 - diff / chartMeasurements.shoulder);
      count++;
    }

    if (chartMeasurements.chest) {
      const diff = Math.abs(measurements.chestWidth - chartMeasurements.chest);
      score += Math.max(0, 1 - diff / chartMeasurements.chest);
      count++;
    }

    if (chartMeasurements.waist) {
      const diff = Math.abs(measurements.waistWidth - chartMeasurements.waist);
      score += Math.max(0, 1 - diff / chartMeasurements.waist);
      count++;
    }

    if (chartMeasurements.hip) {
      const diff = Math.abs(measurements.hipWidth - chartMeasurements.hip);
      score += Math.max(0, 1 - diff / chartMeasurements.hip);
      count++;
    }

    const avgScore = count > 0 ? score / count : 0;

    if (avgScore > bestMatch.score) {
      let fit = "standard";
      if (avgScore > 0.9) fit = "perfect fit";
      else if (avgScore > 0.75) fit = "good fit";
      else if (avgScore > 0.6) fit = "acceptable fit";
      else fit = "loose fit";

      bestMatch = { size, score: avgScore, fit };
    }
  }

  return {
    size: bestMatch.size,
    confidence: bestMatch.score,
    fit: bestMatch.fit,
  };
}

let poseDetectorInstance: PoseDetector | null = null;

export function getPoseDetector(): PoseDetector {
  if (!poseDetectorInstance) {
    poseDetectorInstance = new PoseDetector();
  }
  return poseDetectorInstance;
}
