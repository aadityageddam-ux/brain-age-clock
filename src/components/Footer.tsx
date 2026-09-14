export default function Footer() {
  return <footer className="mt-16 border-t border-[var(--line)]">
    <div className="mx-auto max-w-6xl px-5 py-8 space-y-3 text-sm text-[var(--ink-soft)]">
      <p>Illustrative demo only. No validated brain-age estimates, diagnostic use, or medical advice.</p>
      <p>Calculations and CSV parsing run locally in the browser. The app does not send entered values or uploaded files to an application server. The hosting provider receives ordinary page requests.</p>
      <p><a href="https://github.com/aadityageddam-ux/brain-age-clock" className="underline">Source and limitations</a> · No OASIS participant data is distributed in the current demo.</p>
    </div>
  </footer>;
}
