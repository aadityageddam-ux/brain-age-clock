import { predictBrainAge } from "./model";

// Deliberately fabricated grid. No participant data or empirical distribution.
export const referenceCohort = Array.from({ length: 12 }, (_, i) => {
  const age = 55 + i * 3;
  const features = { eTIV: 1300 + (i % 4) * 90, nWBV: 0.68 + (i % 5) * 0.02,
    ASF: 1 + (i % 3) * 0.1, EDUC: 12 + (i % 3) * 2, SES: 1 + (i % 5), Sex_M: i % 2 };
  const { predicted, gap } = predictBrainAge(features, age);
  return { age, predicted_age: predicted, brain_age_gap: gap, group: "Synthetic examples" };
});
export const GROUP_ORDER = ["Synthetic examples"];
export const GROUP_COLORS: Record<string, string> = { "Synthetic examples": "#6b7280" };
export function groupColor(): string { return "#6d5bd0"; }
// Equality guide only; not a clinical threshold or evidence of accuracy.
export function perfectLine(): [{ x: number; y: number }, { x: number; y: number }] {
  return [{ x: 55, y: 55 }, { x: 88, y: 88 }];
}
