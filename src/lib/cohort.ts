import cohortRaw from "@/data/reference_cohort.json";
import { predictBrainAge } from "./model";

export type Group = "Nondemented" | "Demented" | "Converted" | string;

export interface CohortRow {
  age: number;
  sex: string;
  educ: number;
  ses: number;
  eTIV: number;
  nWBV: number;
  ASF: number;
  group: Group;
  predicted_age: number;
  brain_age_gap: number;
}

// Compact columnar rows: [age, sex, educ, ses, eTIV, nWBV, ASF, group]
type CohortTuple = [number, string, number, number, number, number, number, string];

/**
 * The original cohort CSV shipped predicted_age/brain_age_gap columns that were
 * inconsistent with the shipped model_params (they scored every subject ~30 years
 * too young). We drop those columns and re-score every row with the same Ridge
 * model the calculator uses, so the cohort background, the calculator's star, and
 * the batch-scored points all live on one consistent scale.
 */
export const referenceCohort: CohortRow[] = (cohortRaw as CohortTuple[]).map(
  ([age, sex, educ, ses, eTIV, nWBV, ASF, group]) => {
    const { predicted, gap } = predictBrainAge(
      { eTIV, nWBV, ASF, EDUC: educ, SES: ses, Sex_M: sex === "M" ? 1 : 0 },
      age,
    );
    return { age, sex, educ, ses, eTIV, nWBV, ASF, group, predicted_age: predicted, brain_age_gap: gap };
  },
);

/** Color coding for dementia groups, per PRD. */
export const GROUP_COLORS: Record<string, string> = {
  Nondemented: "#2563eb", // blue
  Demented: "#dc2626", // red
  Converted: "#ea580c", // orange
};

export const GROUP_ORDER = ["Demented", "Converted", "Nondemented"];

export function groupColor(group: string): string {
  return GROUP_COLORS[group] ?? "#6b7280";
}

/** Points for the diagonal "perfect prediction" reference line, spanning cohort age range. */
export function perfectLine(): [{ x: number; y: number }, { x: number; y: number }] {
  const ages = referenceCohort.map((r) => r.age);
  const min = Math.floor(Math.min(...ages));
  const max = Math.ceil(Math.max(...ages));
  return [
    { x: min, y: min },
    { x: max, y: max },
  ];
}
