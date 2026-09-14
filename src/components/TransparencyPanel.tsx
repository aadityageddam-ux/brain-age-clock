import FeatureImportance from "./FeatureImportance";

export default function TransparencyPanel() {
  return <section className="panel p-6 space-y-5">
    <h2 className="text-lg font-semibold">What this demo can establish</h2>
    <p>The equation standardizes six inputs using retained constants, multiplies them by fixed coefficients, and adds an intercept. This demonstrates arithmetic and interface behavior only.</p>
    <p className="font-medium">Coefficient provenance is unverified. No training script, subject-level split, or evaluation report is available. Accuracy, generalization, and uncertainty are unknown.</p>
    <p>Previously displayed error metrics, group significance claims, and older/younger interpretations were withdrawn because they could not be substantiated. This does not establish that the historical numbers were false.</p>
    <h3 className="font-semibold">Retained coefficients · not validated feature importance</h3>
    <FeatureImportance />
    <p>All background points are explicitly fabricated examples generated in this repository. They are not OASIS participants, a normative population, or a validation set. Uploaded groups are descriptive labels only; no diagnostic or statistical inference is supported.</p>
    <p>Chronological age is subtracted from the output but is not a predictor. A difference of zero has no validated clinical meaning. Software tests verify arithmetic and data handling, not scientific validity.</p>
  </section>;
}
