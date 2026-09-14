# Brain-Age Clock · Illustrative Demo

[Open the demo](https://brain-age-clock.vercel.app/)

An exploratory interface for inspecting a fixed linear equation with **unverified coefficients**. It does not provide validated brain-age estimates or assess brain health.

## Evidence status

No training script, subject-separated split manifest, or evaluation report is available for the retained parameters. Accuracy and generalization are unknown. The previously displayed MAE, R², group comparisons, and personal older/younger interpretations have been withdrawn because their provenance could not be substantiated. Their removal is not proof that those historical numbers were false.

The old bundled cohort had conflicting descriptions (OASIS data versus synthetic stand-ins). It is removed from the current app. Background plots now use 12 explicitly fabricated rows generated in `src/lib/cohort.ts`, with no clinical groups. These examples are not OASIS data or an empirical reference distribution.

## What it demonstrates

- Single-example arithmetic and plots with neutral output labels.
- Local CSV parsing, explicit errors, descriptive group plots, and downloads.
- Transparent coefficients and scaling constants, without claims of validated feature importance.

```
scaled_input = (value - retained_mean) / retained_scale
illustrative_output = intercept + sum(coefficient * scaled_input)
illustrative_difference = illustrative_output - input_age
```

The year scale is inherited from the old equation, not empirically calibrated here. Age is used only in the difference. Zero difference has no validated meaning. Tests establish implementation behavior, not biological validity.

## Inputs and exports

Use fabricated examples, not personal reports. Columns: `age,sex,educ,ses,eTIV,nWBV,ASF`; optional `group`. `sex` accepts M/F, male/female, 1/0; `Sex_M` is an alternative header. eTIV uses **cm³ (mL)**, nWBV uses a fraction (0.74, not 74), and ASF is unitless. SES uses 1 = highest through 5 = lowest, following the [OASIS-2 publication, Table 4](https://pmc.ncbi.nlm.nih.gov/articles/PMC2895005/). This coding reference is not evidence that the retained coefficients were trained on OASIS.

Exports label new values `illustrative_output_year_scale`, `illustrative_output_minus_age`, and `model_status=unverified_illustrative_only`. No personal interpretation or performance estimate is exported.

## Run and verify

Requires Node.js 22 or later.

```sh
npm ci
npm test
npm run type-check
npm run lint
npm run build
npm run dev
```

Open http://localhost:3000. The production build is a static Next.js export. GitHub CI checks tests, types, lint, and build.

## Privacy and license

Entered values and CSV contents are processed in browser memory; the application does not upload them or persist them to a database. Downloads are saved when requested. Hosting still receives ordinary page requests. Source code is [MIT licensed](LICENSE). No OASIS participant data is included in this version; historical files remain in Git history.
