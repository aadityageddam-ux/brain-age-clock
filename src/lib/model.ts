import modelParams from "@/data/model_params.json";

export type ModelParams = typeof modelParams;

/** Raw features expected by the Ridge model. Sex_M is 1 for male, 0 for female. */
export interface ModelFeatures {
  eTIV: number;
  nWBV: number;
  ASF: number;
  EDUC: number;
  SES: number;
  Sex_M: number;
}

export type FeatureKey = keyof ModelFeatures;

// Feature order matters only for display; the math is order-independent.
export const FEATURE_ORDER: FeatureKey[] = [
  "eTIV",
  "nWBV",
  "ASF",
  "EDUC",
  "SES",
  "Sex_M",
];

export interface PredictionResult {
  predicted: number;
  gap: number;
}

/**
 * Standardize each feature, apply Ridge coefficients, add intercept.
 * Mirrors the notebook exactly:
 *   standardized = (raw - mean) / scale
 *   predicted    = intercept + sum(coef_i * standardized_i)
 *   gap          = predicted - chronological_age
 */
export function predictBrainAge(
  features: ModelFeatures,
  age: number,
  params: ModelParams = modelParams,
): PredictionResult {
  const { intercept, coefficients, scaler_mean, scaler_scale } = params;
  let predicted = intercept;

  for (const feat of FEATURE_ORDER) {
    const std =
      (features[feat] - scaler_mean[feat]) / scaler_scale[feat];
    predicted += coefficients[feat] * std;
  }

  const round1 = (n: number) => Math.round(n * 10) / 10;
  const predictedR = round1(predicted);
  return { predicted: predictedR, gap: round1(predicted - age) };
}

/** Plain-English, non-clinical interpretation of a brain-age gap. */
export function interpretGap(gap: number): { tone: "older" | "younger" | "typical"; text: string } {
  if (gap >= 2) {
    return {
      tone: "older",
      text: `Your brain structure appears substantially older than your chronological age (gap: ${formatGap(gap)} years).`,
    };
  }
  if (gap <= -2) {
    return {
      tone: "younger",
      text: `Your brain structure appears substantially younger than your chronological age (gap: ${formatGap(gap)} years).`,
    };
  }
  return {
    tone: "typical",
    text: `Your brain structure appears close to what the model expects for your chronological age (gap: ${formatGap(gap)} years).`,
  };
}

/** Format a gap with an explicit +/- sign, e.g. +6.3 or −13.6 (true minus glyph). */
export function formatGap(gap: number): string {
  if (gap > 0) return `+${gap.toFixed(1)}`;
  if (gap < 0) return `−${Math.abs(gap).toFixed(1)}`;
  return "0.0";
}

export { modelParams };
