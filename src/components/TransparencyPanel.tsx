"use client";

import { useState } from "react";
import { modelParams } from "@/lib/model";
import FeatureImportance from "./FeatureImportance";

export default function TransparencyPanel() {
  const [open, setOpen] = useState(true);
  const m = modelParams.validation_metrics;

  return (
    <section className="panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-semibold">How this model works</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Feature importance, validation metrics, and an honest note on the model&apos;s limits.
          </p>
        </div>
        <span className="text-[var(--ink-soft)] text-sm">{open ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {open && (
        <div className="border-t border-[var(--line)] p-6 space-y-8">
          {/* Feature importance */}
          <div>
            <h3 className="font-semibold">Feature importance</h3>
            <div className="mt-3">
              <FeatureImportance />
            </div>
          </div>

          {/* Validation metrics */}
          <div>
            <h3 className="font-semibold">Model validation</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Metric label="Mean absolute error" value={`${m.mae_years} yrs`} note="Out-of-fold, subject-held-out cross-validation" />
              <Metric label="R² (variance explained)" value={`${m.r_squared} (~${Math.round(m.r_squared * 100)}%)`} note="From structural features alone" />
              <Metric label="Demented group mean gap" value={`+${m.demented_mean_gap} yrs`} note="Older-appearing brains (n≈160)" tone="older" />
              <Metric label="Nondemented group mean gap" value={`${m.nondemented_mean_gap} yrs`} note="Younger-appearing brains (n≈241)" tone="younger" />
            </div>
            <p className="mt-3 text-sm text-[var(--ink)]">
              <span className="font-medium">Group difference (Welch&apos;s t-test):</span>{" "}
              t = {m.t_statistic}, p &lt; 0.0001 — a statistically significant separation between the Demented and
              Nondemented groups. ✓
            </p>
          </div>

          {/* Honest Converted-group note */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <h4 className="text-sm font-semibold">A note on the &quot;Converted&quot; group</h4>
            <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
              The Converted group shows a mean gap of <span className="font-medium text-[var(--ink)]">−2.34 years</span> —
              the <em>opposite</em> direction from the Demented group. This is most likely because pre-conversion scans
              (taken when these subjects still looked cognitively normal) dominate this small sample (n = 37). It&apos;s a
              genuine finding worth reporting honestly, not an error to hide.
            </p>
          </div>

          {/* Disclaimers */}
          <div>
            <h3 className="font-semibold">Disclaimers</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              <li className="flex gap-2"><span aria-hidden>⚠</span> For educational / exploratory use only. This is not a diagnostic tool and gives no medical advice.</li>
              <li className="flex gap-2"><span aria-hidden>⚠</span> Trained on n = 150 subjects from OASIS-2, a single-site research cohort. Results may not generalize to other populations.</li>
              <li className="flex gap-2"><span aria-hidden>⚠</span> The model explains only ~22% of age variance (R² = 0.217) with a ±5.44-year typical error. Treat any single result with generous uncertainty.</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "older" | "younger" }) {
  const color = tone === "older" ? "var(--older)" : tone === "younger" ? "var(--younger)" : "var(--ink)";
  return (
    <div className="rounded-xl border border-[var(--line)] p-4">
      <div className="text-xs text-[var(--ink-soft)]">{label}</div>
      <div className="mt-0.5 text-xl font-semibold" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-xs text-[var(--ink-soft)]">{note}</div>
    </div>
  );
}
