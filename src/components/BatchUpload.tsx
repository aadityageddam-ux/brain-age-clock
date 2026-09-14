"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { scoreBatch, buildResultsCsv, BatchResult, TEMPLATE_CSV, REQUIRED_COLUMNS } from "@/lib/batch";
import CohortScatter from "./CohortScatter";
import GapHistogram from "./GapHistogram";
import GroupBoxplot from "./GroupBoxplot";

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export default function BatchUpload() {
  const [result, setResult] = useState<BatchResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setBusy(true);
    setParseError("");
    setResult(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (res) => {
        setBusy(false);
        if (!res.data || res.data.length === 0) {
          setParseError("The file is empty or has no data rows.");
          return;
        }
        if (res.errors.length > 0) {
          setParseError(`Malformed CSV: ${res.errors.map((e) => e.message).join("; ")}. No rows calculated.`);
          return;
        }
        setResult(scoreBatch(res.data));
      },
      error: (err) => {
        setBusy(false);
        setParseError(`Could not parse the file: ${err.message}`);
      },
    });
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  const scored = result?.scored ?? [];
  const batchPoints = scored.map((r) => ({ age: r.age, predicted_age: r.predicted_age, group: r.group }));
  const gapsByGroup = groupGaps(result);

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Batch upload</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)] max-w-xl">
              Upload a CSV with one row per fabricated example. Required columns:{" "}
              <code className="rounded bg-[var(--bg)] px-1 py-0.5 text-[13px]">{REQUIRED_COLUMNS.join(", ")}</code>.
              An optional <code className="rounded bg-[var(--bg)] px-1 py-0.5 text-[13px]">group</code> column enables the boxplot.
              File contents are processed locally. Use fabricated examples only; outputs are unverified arithmetic.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => download("synthetic_demo_template.csv", TEMPLATE_CSV)}
          >
            Download template CSV
          </button>
        </div>

        <div
          className="mt-5 rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--bg)] p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <p className="text-sm text-[var(--ink-soft)]">Drag a CSV here, or</p>
          <button type="button" className="btn-primary mt-3" onClick={() => inputRef.current?.click()}>
            Choose file
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onInputChange} />
          {fileName && <p className="mt-3 text-sm text-[var(--ink)]">Loaded: <span className="font-medium">{fileName}</span></p>}
          {busy && <p className="mt-2 text-sm text-[var(--ink-soft)]">Parsing…</p>}
        </div>

        {parseError && (
          <p className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{parseError}</p>
        )}

        {result && result.missingColumns.length > 0 && (
          <p className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Missing required column{result.missingColumns.length > 1 ? "s" : ""}:{" "}
            <span className="font-medium">{result.missingColumns.join(", ")}</span>. No rows were scored.
          </p>
        )}
      </div>

      {result && result.missingColumns.length === 0 && (
        <>
          {/* Summary */}
          <div className="panel p-6">
            <div className="flex flex-wrap items-center gap-6">
              <Summary label="Rows scored" value={String(scored.length)} tone="ok" />
              <Summary label="Rows flagged" value={String(result.errors.length)} tone={result.errors.length ? "warn" : "ok"} />
              <Summary label="Total rows" value={String(result.totalRows)} tone="muted" />
              <div className="ml-auto">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={scored.length === 0}
                  onClick={() => download(`illustrative_demo_results_${timestamp()}.csv`, buildResultsCsv(result))}
                >
                  Download results CSV
                </button>
              </div>
            </div>

            {result.errors.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-[var(--older)]">
                  {result.errors.length} row{result.errors.length > 1 ? "s" : ""} could not be scored (click to view)
                </summary>
                <ul className="mt-2 max-h-48 overflow-auto rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-sm text-[var(--ink-soft)] space-y-1">
                  {result.errors.map((e) => (
                    <li key={e.rowNumber}>Row {e.rowNumber}: {e.reason}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {scored.length > 0 && (
            <>
              <div className="panel p-6">
                <h3 className="font-semibold">Input age vs. illustrative output</h3>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Your uploaded rows (dark triangles) over the synthetic examples.</p>
                <div className="mt-3">
                  <CohortScatter batchPoints={batchPoints} height={400} />
                </div>
              </div>

              <div className="panel p-6">
                <h3 className="font-semibold">Output minus age distribution</h3>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Uploaded batch overlaid on the synthetic examples.</p>
                <div className="mt-3">
                  <GapHistogram batchGaps={scored.map((r) => r.brain_age_gap)} />
                </div>
              </div>

              {result.hasGroup && gapsByGroup.length > 0 && (
                <div className="panel p-6">
                  <h3 className="font-semibold">Output minus age by group</h3>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">Median gap per group in your upload.</p>
                  <div className="mt-3">
                    <GroupBoxplot groups={gapsByGroup} />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function groupGaps(result: BatchResult | null): { group: string; gaps: number[] }[] {
  if (!result || !result.hasGroup) return [];
  const order: string[] = [];
  const map = new Map<string, number[]>();
  for (const r of result.scored) {
    const g = r.group || "Unlabeled";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(r.brain_age_gap);
  }
  const keys = Array.from(map.keys()).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return keys.map((group) => ({ group, gaps: map.get(group)! }));
}

function Summary({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "muted" }) {
  const color = tone === "warn" ? "var(--older)" : tone === "ok" ? "var(--younger)" : "var(--ink-soft)";
  return (
    <div>
      <div className="text-2xl font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--ink-soft)]">{label}</div>
    </div>
  );
}
