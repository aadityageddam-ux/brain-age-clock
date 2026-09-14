"use client";

import { modelParams } from "@/lib/model";

const LABELS: Record<string, string> = {
  nWBV: "nWBV — whole-brain volume",
  ASF: "ASF — atlas scaling factor",
  Sex_M: "Sex (male)",
  EDUC: "Education",
  SES: "Socioeconomic status",
  eTIV: "eTIV — intracranial volume",
};

export default function FeatureImportance() {
  const entries = Object.entries(modelParams.coefficients)
    .map(([k, v]) => ({ key: k, label: LABELS[k] ?? k, value: v as number }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const maxAbs = Math.max(...entries.map((e) => Math.abs(e.value)));

  return (
    <div className="space-y-2.5">
      <p className="text-sm text-[var(--ink-soft)]">
        Change in illustrative output for a one-unit increase after scaling by the retained constants. Left lowers the number; right raises it. The scaling constants and coefficients are unverified, and these are not causal effects.
      </p>
      <div className="mt-2 space-y-2">
        {entries.map((e) => {
          const pct = (Math.abs(e.value) / maxAbs) * 50; // half-width max
          const positive = e.value >= 0;
          const color = "var(--accent)";
          return (
            <div key={e.key} className="grid grid-cols-[minmax(120px,1.2fr)_minmax(0,2fr)_auto] items-center gap-3">
              <div className="text-sm text-[var(--ink)] truncate">{e.label}</div>
              <div className="relative h-6 rounded bg-[var(--bg)] border border-[var(--line)]">
                <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--line)]" />
                <div
                  className="absolute inset-y-0.5 rounded"
                  style={{
                    background: color,
                    width: `${pct}%`,
                    left: positive ? "50%" : `${50 - pct}%`,
                  }}
                />
              </div>
              <div className="w-14 text-right text-sm font-mono tabular-nums" style={{ color }}>
                {e.value >= 0 ? "+" : "−"}
                {Math.abs(e.value).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
