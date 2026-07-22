import { predictBrainAge, ModelFeatures } from "./model";

// Columns needed to score a row. Sex is provided as text (M/F) or Sex_M numeric.
export const REQUIRED_COLUMNS = ["age", "sex", "educ", "ses", "eTIV", "nWBV", "ASF"] as const;

export interface ScoredRow {
  rowNumber: number; // 1-indexed data row (excludes header)
  original: Record<string, string>;
  age: number;
  group?: string;
  predicted_age: number;
  brain_age_gap: number;
}

export interface RowError {
  rowNumber: number;
  reason: string;
}

export interface BatchResult {
  scored: ScoredRow[];
  errors: RowError[];
  totalRows: number;
  hasGroup: boolean;
  missingColumns: string[];
}

/** Case-insensitive lookup of a header value in a parsed row. */
function pick(row: Record<string, string>, keys: string[]): string | undefined {
  const lowerMap: Record<string, string> = {};
  for (const k of Object.keys(row)) lowerMap[k.toLowerCase().trim()] = row[k];
  for (const key of keys) {
    const v = lowerMap[key.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return undefined;
}

function parseSexToMale(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const s = raw.trim().toLowerCase();
  if (s === "m" || s === "male" || s === "1") return 1;
  if (s === "f" || s === "female" || s === "0") return 0;
  return null;
}

/**
 * Validate columns and score every row. Malformed rows are collected as errors,
 * never silently dropped (PRD non-goal: no silent wrong answers).
 */
export function scoreBatch(rows: Record<string, string>[]): BatchResult {
  const errors: RowError[] = [];
  const scored: ScoredRow[] = [];

  const headerKeys = rows.length > 0 ? Object.keys(rows[0]).map((k) => k.toLowerCase().trim()) : [];
  const missingColumns = REQUIRED_COLUMNS.filter((c) => {
    if (c === "sex") return !headerKeys.includes("sex") && !headerKeys.includes("sex_m");
    return !headerKeys.includes(c.toLowerCase());
  });
  const hasGroup = headerKeys.includes("group");

  if (missingColumns.length > 0) {
    return { scored, errors, totalRows: rows.length, hasGroup, missingColumns };
  }

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;

    const ageRaw = pick(row, ["age"]);
    const eTIV = pick(row, ["eTIV"]);
    const nWBV = pick(row, ["nWBV"]);
    const ASF = pick(row, ["ASF"]);
    const educ = pick(row, ["educ", "EDUC"]);
    const ses = pick(row, ["ses", "SES"]);
    const sexMale = parseSexToMale(pick(row, ["sex"])) ??
      (pick(row, ["sex_m"]) !== undefined ? Number(pick(row, ["sex_m"])) : null);

    const nums: Record<string, number> = {};
    const fields: [string, string | undefined][] = [
      ["age", ageRaw],
      ["eTIV", eTIV],
      ["nWBV", nWBV],
      ["ASF", ASF],
      ["educ", educ],
      ["ses", ses],
    ];

    let bad: string | null = null;
    for (const [name, val] of fields) {
      if (val === undefined) {
        bad = `missing ${name}`;
        break;
      }
      const n = Number(val);
      if (!Number.isFinite(n)) {
        bad = `non-numeric ${name} ("${val}")`;
        break;
      }
      nums[name] = n;
    }

    if (!bad && (sexMale === null || (sexMale !== 0 && sexMale !== 1))) {
      bad = `invalid sex ("${pick(row, ["sex", "sex_m"]) ?? ""}")`;
    }

    if (bad) {
      errors.push({ rowNumber, reason: bad });
      return;
    }

    const features: ModelFeatures = {
      eTIV: nums.eTIV,
      nWBV: nums.nWBV,
      ASF: nums.ASF,
      EDUC: nums.educ,
      SES: nums.ses,
      Sex_M: sexMale as number,
    };
    const { predicted, gap } = predictBrainAge(features, nums.age);

    scored.push({
      rowNumber,
      original: row,
      age: nums.age,
      group: hasGroup ? pick(row, ["group"]) : undefined,
      predicted_age: predicted,
      brain_age_gap: gap,
    });
  });

  return { scored, errors, totalRows: rows.length, hasGroup, missingColumns };
}

/** Build a results CSV: original columns + predicted_age + brain_age_gap. */
export function buildResultsCsv(result: BatchResult): string {
  if (result.scored.length === 0) return "";
  const originalCols = Object.keys(result.scored[0].original);
  const cols = [...originalCols, "predicted_age", "brain_age_gap"];
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [cols.join(",")];
  for (const r of result.scored) {
    const vals = originalCols.map((c) => escape(String(r.original[c] ?? "")));
    vals.push(String(r.predicted_age), String(r.brain_age_gap));
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

/** Fabricated (non-cohort) example rows for the downloadable template. */
export const TEMPLATE_CSV = `age,sex,educ,ses,eTIV,nWBV,ASF,group
72,F,16,3,1420,0.735,1.190,Nondemented
68,M,12,2,1510,0.702,1.120,Demented
80,F,14,4,1380,0.688,1.240,Converted`;
