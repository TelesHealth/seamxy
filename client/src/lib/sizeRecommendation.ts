// Size recommendation and height conversion utilities

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export interface SizeRecommendation {
  size: string;
  confidence: number;
  fitDescription: string;
  alternativeSizes: string[];
  brandNote?: string;
}

export function calculateSizeFromMeasurements(
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
  },
  sizeChart: Record<string, Record<string, number>>,
  category: string
): SizeRecommendation {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  if (!measurements || !sizeChart) {
    return {
      size: "M",
      confidence: 50,
      fitDescription: "Standard fit",
      alternativeSizes: ["S", "L"],
    };
  }

  let bestSize = "M";
  let bestScore = Infinity;
  const scores: Record<string, number> = {};

  for (const size of sizes) {
    const chart = sizeChart[size];
    if (!chart) continue;

    let score = 0;
    let count = 0;

    if (measurements.chest && chart.chest) {
      score += Math.abs(measurements.chest - chart.chest);
      count++;
    }
    if (measurements.waist && chart.waist) {
      score += Math.abs(measurements.waist - chart.waist);
      count++;
    }
    if (measurements.hips && chart.hips) {
      score += Math.abs(measurements.hips - chart.hips);
      count++;
    }

    if (count > 0) {
      scores[size] = score / count;
      if (score / count < bestScore) {
        bestScore = score / count;
        bestSize = size;
      }
    }
  }

  const confidence = Math.max(50, Math.round(100 - bestScore * 2));
  const alternatives = sizes
    .filter((s) => s !== bestSize && scores[s] !== undefined)
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, 2);

  let fitDescription = "Standard fit";
  if (bestScore < 1) fitDescription = "Perfect fit";
  else if (bestScore < 3) fitDescription = "Great fit";
  else if (bestScore < 5) fitDescription = "Good fit";
  else fitDescription = "May need adjustment";

  return {
    size: bestSize,
    confidence,
    fitDescription,
    alternativeSizes: alternatives,
  };
}
