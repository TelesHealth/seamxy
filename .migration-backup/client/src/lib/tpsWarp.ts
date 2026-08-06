import type { BodyLandmark } from "@shared/schema";

export interface Point2D {
  x: number;
  y: number;
}

export interface ControlPointPair {
  source: Point2D;
  target: Point2D;
}

interface TPSCoefficients {
  a: Point2D;
  bx: number[];
  by: number[];
  weights: Point2D[];
}

function radialBasisFunction(r: number): number {
  if (r === 0) return 0;
  return r * r * Math.log(r);
}

function distance(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function solveLinearSystem(matrix: number[][], b: number[]): number[] {
  const n = b.length;
  const augmented = matrix.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
        maxRow = row;
      }
    }
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

    if (Math.abs(augmented[col][col]) < 1e-10) {
      continue;
    }

    for (let row = col + 1; row < n; row++) {
      const factor = augmented[row][col] / augmented[col][col];
      for (let j = col; j <= n; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  const solution = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    if (Math.abs(augmented[row][row]) < 1e-10) {
      solution[row] = 0;
      continue;
    }
    let sum = augmented[row][n];
    for (let col = row + 1; col < n; col++) {
      sum -= augmented[row][col] * solution[col];
    }
    solution[row] = sum / augmented[row][row];
  }

  return solution;
}

export function computeTPSCoefficients(controlPoints: ControlPointPair[]): TPSCoefficients {
  const n = controlPoints.length;

  if (n < 3) {
    return {
      a: { x: 0, y: 0 },
      bx: [1, 0, 0],
      by: [0, 1, 0],
      weights: [],
    };
  }

  const K: number[][] = [];
  for (let i = 0; i < n; i++) {
    K[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        K[i][j] = 0;
      } else {
        const r = distance(controlPoints[i].source, controlPoints[j].source);
        K[i][j] = radialBasisFunction(r);
      }
    }
  }

  const P: number[][] = [];
  for (let i = 0; i < n; i++) {
    P[i] = [1, controlPoints[i].source.x, controlPoints[i].source.y];
  }

  const PT = P[0].map((_, colIndex) => P.map(row => row[colIndex]));

  const size = n + 3;
  const L: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      L[i][j] = K[i][j];
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 3; j++) {
      L[i][n + j] = P[i][j];
      L[n + j][i] = PT[j][i];
    }
  }

  const vx: number[] = controlPoints.map(cp => cp.target.x).concat([0, 0, 0]);
  const vy: number[] = controlPoints.map(cp => cp.target.y).concat([0, 0, 0]);

  const solX = solveLinearSystem(L.map(row => [...row]), vx);
  const solY = solveLinearSystem(L.map(row => [...row]), vy);

  const weights: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    weights.push({ x: solX[i], y: solY[i] });
  }

  return {
    a: { x: solX[n], y: solY[n] },
    bx: [solX[n], solX[n + 1], solX[n + 2]],
    by: [solY[n], solY[n + 1], solY[n + 2]],
    weights,
  };
}

export function applyTPSTransform(
  coeffs: TPSCoefficients,
  controlPoints: ControlPointPair[],
  point: Point2D
): Point2D {
  if (controlPoints.length < 3) {
    return point;
  }

  let x = coeffs.bx[0] + coeffs.bx[1] * point.x + coeffs.bx[2] * point.y;
  let y = coeffs.by[0] + coeffs.by[1] * point.x + coeffs.by[2] * point.y;

  for (let i = 0; i < controlPoints.length; i++) {
    const r = distance(point, controlPoints[i].source);
    const u = radialBasisFunction(r);
    x += coeffs.weights[i].x * u;
    y += coeffs.weights[i].y * u;
  }

  return { x, y };
}

export function getTopControlPoints(
  sourceWidth: number,
  sourceHeight: number,
  landmarks: BodyLandmark[],
  canvasWidth: number,
  canvasHeight: number
): ControlPointPair[] {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];

  if (!leftShoulder || !rightShoulder) {
    return [];
  }

  const controlPoints: ControlPointPair[] = [];

  const padding = 0.1;
  const srcNeckX = sourceWidth * 0.5;
  const srcNeckY = sourceHeight * padding;
  const srcLeftShoulderX = sourceWidth * 0.15;
  const srcLeftShoulderY = sourceHeight * 0.15;
  const srcRightShoulderX = sourceWidth * 0.85;
  const srcRightShoulderY = sourceHeight * 0.15;
  const srcLeftSleeveX = sourceWidth * 0.02;
  const srcLeftSleeveY = sourceHeight * 0.25;
  const srcRightSleeveX = sourceWidth * 0.98;
  const srcRightSleeveY = sourceHeight * 0.25;
  const srcLeftWaistX = sourceWidth * 0.2;
  const srcLeftWaistY = sourceHeight * 0.85;
  const srcRightWaistX = sourceWidth * 0.8;
  const srcRightWaistY = sourceHeight * 0.85;
  const srcCenterX = sourceWidth * 0.5;
  const srcCenterY = sourceHeight * 0.5;
  const srcBottomCenterX = sourceWidth * 0.5;
  const srcBottomCenterY = sourceHeight * 0.95;

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

  let hipMidX = shoulderMidX;
  let hipMidY = shoulderMidY + 0.3;

  if (leftHip && rightHip) {
    hipMidX = (leftHip.x + rightHip.x) / 2;
    hipMidY = (leftHip.y + rightHip.y) / 2;
  }

  const neckY = Math.max(0, shoulderMidY - (hipMidY - shoulderMidY) * 0.2);

  controlPoints.push({
    source: { x: srcNeckX, y: srcNeckY },
    target: { x: shoulderMidX * canvasWidth, y: neckY * canvasHeight },
  });

  controlPoints.push({
    source: { x: srcLeftShoulderX, y: srcLeftShoulderY },
    target: { x: leftShoulder.x * canvasWidth, y: leftShoulder.y * canvasHeight },
  });

  controlPoints.push({
    source: { x: srcRightShoulderX, y: srcRightShoulderY },
    target: { x: rightShoulder.x * canvasWidth, y: rightShoulder.y * canvasHeight },
  });

  if (leftElbow && rightElbow) {
    const expandFactor = 1.1;
    controlPoints.push({
      source: { x: srcLeftSleeveX, y: srcLeftSleeveY },
      target: { 
        x: (leftElbow.x + (leftElbow.x - shoulderMidX) * expandFactor) * canvasWidth, 
        y: leftElbow.y * canvasHeight 
      },
    });

    controlPoints.push({
      source: { x: srcRightSleeveX, y: srcRightSleeveY },
      target: { 
        x: (rightElbow.x + (rightElbow.x - shoulderMidX) * expandFactor) * canvasWidth, 
        y: rightElbow.y * canvasHeight 
      },
    });
  }

  if (leftHip && rightHip) {
    const waistExpandFactor = 1.05;
    controlPoints.push({
      source: { x: srcLeftWaistX, y: srcLeftWaistY },
      target: { 
        x: (leftHip.x * waistExpandFactor) * canvasWidth, 
        y: leftHip.y * canvasHeight 
      },
    });

    controlPoints.push({
      source: { x: srcRightWaistX, y: srcRightWaistY },
      target: { 
        x: (rightHip.x + (1 - rightHip.x) * (1 - waistExpandFactor)) * canvasWidth, 
        y: rightHip.y * canvasHeight 
      },
    });

    controlPoints.push({
      source: { x: srcBottomCenterX, y: srcBottomCenterY },
      target: { x: hipMidX * canvasWidth, y: hipMidY * canvasHeight },
    });
  }

  const centerY = (shoulderMidY + hipMidY) / 2;
  controlPoints.push({
    source: { x: srcCenterX, y: srcCenterY },
    target: { x: shoulderMidX * canvasWidth, y: centerY * canvasHeight },
  });

  return controlPoints;
}

export function getBottomControlPoints(
  sourceWidth: number,
  sourceHeight: number,
  landmarks: BodyLandmark[],
  canvasWidth: number,
  canvasHeight: number
): ControlPointPair[] {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftHip || !rightHip) {
    return [];
  }

  const controlPoints: ControlPointPair[] = [];

  const srcLeftWaistX = sourceWidth * 0.15;
  const srcLeftWaistY = sourceHeight * 0.05;
  const srcRightWaistX = sourceWidth * 0.85;
  const srcRightWaistY = sourceHeight * 0.05;
  const srcCenterWaistX = sourceWidth * 0.5;
  const srcCenterWaistY = sourceHeight * 0.05;
  const srcLeftThighX = sourceWidth * 0.2;
  const srcLeftThighY = sourceHeight * 0.35;
  const srcRightThighX = sourceWidth * 0.8;
  const srcRightThighY = sourceHeight * 0.35;
  const srcLeftKneeX = sourceWidth * 0.22;
  const srcLeftKneeY = sourceHeight * 0.55;
  const srcRightKneeX = sourceWidth * 0.78;
  const srcRightKneeY = sourceHeight * 0.55;
  const srcLeftAnkleX = sourceWidth * 0.25;
  const srcLeftAnkleY = sourceHeight * 0.95;
  const srcRightAnkleX = sourceWidth * 0.75;
  const srcRightAnkleY = sourceHeight * 0.95;

  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;

  controlPoints.push({
    source: { x: srcCenterWaistX, y: srcCenterWaistY },
    target: { x: hipMidX * canvasWidth, y: (hipMidY - 0.02) * canvasHeight },
  });

  const waistExpand = 1.05;
  controlPoints.push({
    source: { x: srcLeftWaistX, y: srcLeftWaistY },
    target: { x: leftHip.x * waistExpand * canvasWidth, y: leftHip.y * canvasHeight },
  });

  controlPoints.push({
    source: { x: srcRightWaistX, y: srcRightWaistY },
    target: { x: rightHip.x * (2 - waistExpand) * canvasWidth, y: rightHip.y * canvasHeight },
  });

  if (leftKnee && rightKnee) {
    const thighY = hipMidY + (leftKnee.y - hipMidY) * 0.4;
    controlPoints.push({
      source: { x: srcLeftThighX, y: srcLeftThighY },
      target: { x: leftKnee.x * canvasWidth, y: thighY * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcRightThighX, y: srcRightThighY },
      target: { x: rightKnee.x * canvasWidth, y: thighY * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcLeftKneeX, y: srcLeftKneeY },
      target: { x: leftKnee.x * canvasWidth, y: leftKnee.y * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcRightKneeX, y: srcRightKneeY },
      target: { x: rightKnee.x * canvasWidth, y: rightKnee.y * canvasHeight },
    });
  }

  if (leftAnkle && rightAnkle) {
    controlPoints.push({
      source: { x: srcLeftAnkleX, y: srcLeftAnkleY },
      target: { x: leftAnkle.x * canvasWidth, y: leftAnkle.y * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcRightAnkleX, y: srcRightAnkleY },
      target: { x: rightAnkle.x * canvasWidth, y: rightAnkle.y * canvasHeight },
    });
  }

  return controlPoints;
}

export function getDressControlPoints(
  sourceWidth: number,
  sourceHeight: number,
  landmarks: BodyLandmark[],
  canvasWidth: number,
  canvasHeight: number
): ControlPointPair[] {
  const topPoints = getTopControlPoints(sourceWidth, sourceHeight * 0.5, landmarks, canvasWidth, canvasHeight);

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];

  if (!leftHip || !rightHip) {
    return topPoints;
  }

  const controlPoints = [...topPoints];

  const srcLeftSkirtX = sourceWidth * 0.1;
  const srcLeftSkirtY = sourceHeight * 0.7;
  const srcRightSkirtX = sourceWidth * 0.9;
  const srcRightSkirtY = sourceHeight * 0.7;
  const srcBottomLeftX = sourceWidth * 0.15;
  const srcBottomLeftY = sourceHeight * 0.95;
  const srcBottomRightX = sourceWidth * 0.85;
  const srcBottomRightY = sourceHeight * 0.95;
  const srcBottomCenterX = sourceWidth * 0.5;
  const srcBottomCenterY = sourceHeight * 0.95;

  const hipMidY = (leftHip.y + rightHip.y) / 2;

  if (leftKnee && rightKnee) {
    const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
    const skirtY = hipMidY + (kneeMidY - hipMidY) * 0.5;

    const skirtExpand = 1.2;
    controlPoints.push({
      source: { x: srcLeftSkirtX, y: srcLeftSkirtY },
      target: { x: (leftKnee.x - 0.1) * skirtExpand * canvasWidth, y: skirtY * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcRightSkirtX, y: srcRightSkirtY },
      target: { x: (rightKnee.x + 0.1) * (2 - skirtExpand) * canvasWidth, y: skirtY * canvasHeight },
    });

    const bottomY = kneeMidY + (kneeMidY - hipMidY) * 0.3;
    controlPoints.push({
      source: { x: srcBottomLeftX, y: srcBottomLeftY },
      target: { x: leftKnee.x * canvasWidth, y: bottomY * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcBottomRightX, y: srcBottomRightY },
      target: { x: rightKnee.x * canvasWidth, y: bottomY * canvasHeight },
    });

    controlPoints.push({
      source: { x: srcBottomCenterX, y: srcBottomCenterY },
      target: { x: ((leftKnee.x + rightKnee.x) / 2) * canvasWidth, y: bottomY * canvasHeight },
    });
  }

  return controlPoints;
}

export function warpImage(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  controlPoints: ControlPointPair[],
  targetWidth: number,
  targetHeight: number,
  gridSize: number = 10
): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = targetWidth;
  resultCanvas.height = targetHeight;
  const ctx = resultCanvas.getContext('2d');

  if (!ctx || controlPoints.length < 3) {
    if (ctx) {
      ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);
    }
    return resultCanvas;
  }

  const sourceWidth = sourceImage.width;
  const sourceHeight = sourceImage.height;
  const coeffs = computeTPSCoefficients(controlPoints);

  const inverseControlPoints = controlPoints.map(cp => ({
    source: cp.target,
    target: cp.source,
  }));
  const inverseCoeffs = computeTPSCoefficients(inverseControlPoints);

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sourceWidth;
  tempCanvas.height = sourceHeight;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.drawImage(sourceImage, 0, 0);
  }
  const sourceImageData = tempCtx?.getImageData(0, 0, sourceWidth, sourceHeight);

  if (!sourceImageData) {
    ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);
    return resultCanvas;
  }

  const targetImageData = ctx.createImageData(targetWidth, targetHeight);
  const sourceData = sourceImageData.data;
  const targetData = targetImageData.data;

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      const targetPoint = { x: tx, y: ty };
      const sourcePoint = applyTPSTransform(inverseCoeffs, inverseControlPoints, targetPoint);

      const sx = sourcePoint.x;
      const sy = sourcePoint.y;

      if (sx >= 0 && sx < sourceWidth - 1 && sy >= 0 && sy < sourceHeight - 1) {
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const xWeight = sx - x0;
        const yWeight = sy - y0;

        const targetIdx = (ty * targetWidth + tx) * 4;

        for (let c = 0; c < 4; c++) {
          const v00 = sourceData[(y0 * sourceWidth + x0) * 4 + c];
          const v10 = sourceData[(y0 * sourceWidth + x1) * 4 + c];
          const v01 = sourceData[(y1 * sourceWidth + x0) * 4 + c];
          const v11 = sourceData[(y1 * sourceWidth + x1) * 4 + c];

          const v0 = v00 * (1 - xWeight) + v10 * xWeight;
          const v1 = v01 * (1 - xWeight) + v11 * xWeight;
          const value = v0 * (1 - yWeight) + v1 * yWeight;

          targetData[targetIdx + c] = Math.round(value);
        }
      }
    }
  }

  ctx.putImageData(targetImageData, 0, 0);

  return resultCanvas;
}

export interface WarpSettings {
  enabled: boolean;
  strength: number;
  gridResolution: number;
}

export const DEFAULT_WARP_SETTINGS: WarpSettings = {
  enabled: true,
  strength: 1.0,
  gridResolution: 10,
};