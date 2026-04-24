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
