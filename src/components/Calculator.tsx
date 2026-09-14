"use client";

import { useState } from "react";
import { predictBrainAge, formatGap, ModelFeatures } from "@/lib/model";
import CohortScatter from "./CohortScatter";

interface FieldDef {
  key: string;
  label: string;
  help: string;
  min?: number;
  max?: number;
  step?: number;
}

const NUMERIC_FIELDS: FieldDef[] = [
  { key: "age", label: "Age", help: "Example chronological age in years.", min: 18, max: 120, step: 1 },
  { key: "educ", label: "Education (years)", help: "Total years of formal education (e.g. 12 = high school, 16 = college).", min: 0, max: 30, step: 1 },
  { key: "ses", label: "Socioeconomic status (1–5)", help: "OASIS-2 coding: 1 = highest, 5 = lowest status. No causal interpretation.", min: 1, max: 5, step: 1 },
  { key: "eTIV", label: "eTIV (cm³)", help: "Estimated total intracranial volume in cm³ (mL), not mm³.", min: 800, max: 2200, step: 1 },
  { key: "nWBV", label: "nWBV", help: "Normalized whole-brain volume as a fraction, e.g. 0.74, not 74.", min: 0.5, max: 0.9, step: 0.001 },
  { key: "ASF", label: "ASF", help: "Atlas scaling factor; unitless example input.", min: 0.7, max: 1.8, step: 0.001 },
];

type FormState = Record<string, string>;

const PRESET: FormState = { age: "70", educ: "16", ses: "3", eTIV: "1400", nWBV: "0.74", ASF: "1.18", sex: "F" };
const EMPTY: FormState = { age: "", educ: "", ses: "", eTIV: "", nWBV: "", ASF: "", sex: "F" };

interface Output {
  predicted: number;
  gap: number;
  age: number;
}

export default function Calculator() {
  const [form, setForm] = useState<FormState>(PRESET);
  const [errors, setErrors] = useState<string[]>([]);
  const [out, setOut] = useState<Output | null>(null);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setOut(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    const nums: Record<string, number> = {};
    for (const f of NUMERIC_FIELDS) {
      const raw = form[f.key]?.trim();
      if (!raw) {
        errs.push(`${f.label} is required.`);
        continue;
      }
      const n = Number(raw);
      if (!Number.isFinite(n)) errs.push(`${f.label} must be a number.`);
      else if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) errs.push(`${f.label} is outside the demo input range.`);
      else nums[f.key] = n;
    }
    setErrors(errs);
    if (errs.length > 0) {
      setOut(null);
      return;
    }
    const features: ModelFeatures = {
      eTIV: nums.eTIV,
      nWBV: nums.nWBV,
      ASF: nums.ASF,
      EDUC: nums.educ,
      SES: nums.ses,
      Sex_M: form.sex === "M" ? 1 : 0,
    };
    const { predicted, gap } = predictBrainAge(features, nums.age);
    setOut({ predicted, gap, age: nums.age });
  }

  const gapColor = "var(--accent)";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Form */}
      <form onSubmit={onSubmit} className="panel p-6">
        <h2 className="text-lg font-semibold">Example inputs</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Use the fabricated preset or edit example values. These broad software limits are not validated population ranges. Do not use this demo to interpret a personal MRI report.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="sex">Sex</label>
            <p className="field-help">Biological sex as coded in the model (M / F).</p>
            <select id="sex" className="field-input" value={form.sex} onChange={(e) => update("sex", e.target.value)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
          {NUMERIC_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="field-label" htmlFor={f.key}>{f.label}</label>
              <p className="field-help">{f.help}</p>
              <input
                id={f.key}
                type="number"
                inputMode="decimal"
                className="field-input"
                min={f.min}
                max={f.max}
                step={f.step}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <ul className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 list-disc pl-6">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex gap-3">
          <button type="submit" className="btn-primary">Calculate illustrative output</button>
          <button type="button" className="btn-ghost" onClick={() => { setForm(EMPTY); setOut(null); setErrors([]); }}>
            Clear
          </button>
        </div>
      </form>

      {/* Result */}
      <div className="panel p-6 flex flex-col">
        <h2 className="text-lg font-semibold">Illustrative output</h2>
        {!out ? (
          <div className="flex-1 grid place-items-center text-center text-[var(--ink-soft)] min-h-[220px]">
            <p className="max-w-xs text-sm">
              Fill in the form and hit <span className="font-medium text-[var(--ink)]">Calculate illustrative output</span> to see
              the equation output alongside explicitly synthetic examples.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Equation output" value={`${out.predicted.toFixed(1)} yrs`} />
              <Stat label="Chronological age" value={`${out.age} yrs`} />
            </div>
            <div className="mt-3 rounded-xl border border-[var(--line)] p-4" style={{ background: "color-mix(in srgb, " + gapColor + " 8%, white)" }}>
              <div className="text-sm text-[var(--ink-soft)]">Output minus input age</div>
              <div className="text-3xl font-bold tracking-tight" style={{ color: gapColor }}>
                {formatGap(out.gap)} years
              </div>
              <p className="mt-1.5 text-sm text-[var(--ink)]">
                This is an arithmetic difference on a year scale. It does not indicate an older, younger, healthy, or unhealthy brain.
              </p>
            </div>
          </>
        )}

        <div className="mt-5">
          <h3 className="text-sm font-medium text-[var(--ink-soft)]">Synthetic examples · not a reference population</h3>
          <div className="mt-2">
            <CohortScatter userPoint={out ? { age: out.age, predicted_age: out.predicted } : null} height={340} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
      <div className="text-xs text-[var(--ink-soft)]">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
