# Illustrative-demo cleanup verification

Reviewed September 14, 2026.

## Scope

Retained coefficients are unverified historical constants. No retraining or scientific validation was performed. Unsupported accuracy, group-inference, and personal brain-health claims were removed. The ambiguous historical cohort was replaced with an explicitly fabricated 12-row grid. Historical files remain in Git history.

The OASIS-2 publication (Table 4) supports the eTIV cm³ unit and SES direction used in input help: https://pmc.ncbi.nlm.nih.gov/articles/PMC2895005/. It does not establish model provenance.

## Checks

- Five automated tests: intercept/scaling arithmetic, age subtraction, invalid batch rows, CSV labels/escaping, synthetic grid and absence of validation metrics.
- TypeScript, ESLint, and Next.js 16.3.5 static production build passed.
- Dependency audit: zero known vulnerabilities at review time.
- Chrome against the built static export: single calculation, stale-result clearing after edits, required inputs, 390px mobile width without horizontal overflow, batch range rejection, download contents, malformed CSV rejection, and no page errors passed.
- Desktop and mobile screenshots visually inspected.

These are implementation checks. They do not establish model accuracy, clinical usefulness, a reference population, or reliable uncertainty estimates.
