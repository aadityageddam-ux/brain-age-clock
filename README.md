# Brain-Age Clock

A browser-based calculator that estimates a "brain age" and brain-age gap from structural-MRI-derived brain volumetrics, using a Ridge regression model referenced against the OASIS-2 research cohort.

**Live app:** [brain-age-clock.vercel.app](https://brain-age-clock.vercel.app)

> For educational / exploratory use only. This is **not** a diagnostic tool and gives no medical advice.

## What it does

**1. Calculator** — Enter age, sex, education, socioeconomic status, and three structural-MRI measurements (eTIV, nWBV, ASF). Get back a predicted brain age, the gap versus your chronological age, a plain-English interpretation, and a scatter plot showing where you land against the 438-session reference cohort.

**2. Batch upload** — Upload a CSV of multiple people at once. The app validates columns, flags malformed rows by number (never silently drops them), scores everyone, and renders a scatter plot, a gap-distribution histogram, and (if a `group` column is present) a boxplot by group. Results are downloadable as CSV.

**3. Model transparency** — A collapsible panel showing the Ridge model's feature-importance coefficients, validation metrics (MAE, R²), and an honest note on where the model's group-separation story does and doesn't hold up in the bundled reference data.

Everything runs client-side. No data is stored or transmitted anywhere.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** for the scatter plot and histogram; a hand-rolled SVG boxplot (Recharts has no built-in primitive)
- **PapaParse** for client-side CSV parsing
- Deployed to **Vercel** as a fully static site — no backend, no database

## How the prediction works

```
standardized_feature = (raw_value - scaler_mean) / scaler_scale
predicted_age         = intercept + Σ(coefficient_i × standardized_feature_i)
brain_age_gap          = predicted_age - chronological_age
```

Model parameters (intercept, per-feature coefficients, scaler mean/scale, validation metrics) live in [`src/data/model_params.json`](src/data/model_params.json). The prediction logic is in [`src/lib/model.ts`](src/lib/model.ts).

## Data notes

The bundled reference cohort ([`src/data/reference_cohort.json`](src/data/reference_cohort.json), 438 sessions across 150 subjects) ships raw demographic and volumetric columns only. Every cohort point's `predicted_age` and `brain_age_gap` are computed **at load time** by [`src/lib/cohort.ts`](src/lib/cohort.ts) using the same model as the calculator — this keeps the cohort scatter, the batch-upload overlay, and your single-entry result on one consistent scale.

The transparency panel reports validation metrics (mean gap by group, MAE, R²) as provided with the model rather than recomputed from the bundled cohort, since the small reference sample doesn't reproduce those figures exactly — this is called out directly in the app.

## Local development

```bash
npm install
npm run dev
```

Runs at `http://localhost:3000`.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Attribution

Data provided by OASIS: Cross-Sectional: Principal Investigators: D. Marcus, R. Buckner, J. Csernansky, J. Morris; P50 AG05681, P01 AG03991, P01 AG026276, R01 AG021910, P20 MH071616, U24 RR021382.

## License

[MIT](LICENSE)
