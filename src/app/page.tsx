"use client";

import { useState } from "react";
import Calculator from "@/components/Calculator";
import BatchUpload from "@/components/BatchUpload";
import TransparencyPanel from "@/components/TransparencyPanel";
import Footer from "@/components/Footer";

type Tab = "calculator" | "batch";

export default function Home() {
  const [tab, setTab] = useState<Tab>("calculator");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-5 pt-12 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--ink-soft)]">
          <span aria-hidden>🧠</span> Illustrative arithmetic demo · unverified coefficients
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Brain-Age Clock · Demo</h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--ink-soft)]">
          Explore how a fixed linear equation responds to example MRI-derived inputs. Its coefficients have no reproducible training or evaluation record. Outputs are illustrative numbers, not estimates of brain health or biological age.
        </p>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="inline-flex rounded-xl border border-[var(--line)] bg-white p-1">
          <TabButton active={tab === "calculator"} onClick={() => setTab("calculator")}>
            Single example
          </TabButton>
          <TabButton active={tab === "batch"} onClick={() => setTab("batch")}>
            Batch upload
          </TabButton>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-8">
        {tab === "calculator" ? <Calculator /> : <BatchUpload />}
        <TransparencyPanel />
      </main>

      <Footer />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-[var(--accent)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}
