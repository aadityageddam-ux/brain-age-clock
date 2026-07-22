export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-white/60">
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-4 text-sm text-[var(--ink-soft)]">
        <p className="font-medium text-[var(--ink)]">
          For educational / exploratory use only — not a diagnostic tool, and not medical advice.
        </p>
        <p>
          Data provided by OASIS: Cross-Sectional: Principal Investigators: D. Marcus, R. Buckner, J. Csernansky,
          J. Morris; P50 AG05681, P01 AG03991, P01 AG026276, R01 AG021910, P20 MH071616, U24 RR021382.
        </p>
        <p className="text-xs">
          Brain-age gap estimated with a Ridge regression on structural-MRI volumetrics. Model and reference cohort are
          synthetic stand-ins built to the OASIS-2 methodology (n = 150 subjects, 438 sessions). Runs entirely in your
          browser; no data is stored or transmitted.
        </p>
      </div>
    </footer>
  );
}
