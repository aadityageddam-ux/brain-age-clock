import { test } from 'node:test';
import assert from 'node:assert/strict';
import { predictBrainAge, modelParams } from '../src/lib/model';
import { scoreBatch, buildResultsCsv } from '../src/lib/batch';
import { referenceCohort } from '../src/lib/cohort';

const row = { age: '70', sex: 'F', educ: '16', ses: '3', eTIV: '1400', nWBV: '0.74', ASF: '1.18' };

test('retained means return the intercept and age only changes the difference', () => {
  const features = modelParams.scaler_mean;
  assert.deepEqual(predictBrainAge(features, 70), { predicted: 76.5, gap: 6.5 });
  assert.deepEqual(predictBrainAge(features, 80), { predicted: 76.5, gap: -3.5 });
});
test('one retained scaling unit changes unrounded output by its coefficient', () => {
  const features = { ...modelParams.scaler_mean, nWBV: modelParams.scaler_mean.nWBV + modelParams.scaler_scale.nWBV };
  assert.deepEqual(predictBrainAge(features, 70), { predicted: 72.2, gap: 2.2 });
});
test('batch handles missing, nonfinite, incorrect-unit and invalid-sex rows explicitly', () => {
  const result = scoreBatch([row, {...row, nWBV: ''}, {...row, age: 'Infinity'}, {...row, eTIV: '1400000'}, {...row, sex: 'unknown'}]);
  assert.equal(result.scored.length, 1);
  assert.deepEqual(result.errors.map(e => e.rowNumber), [2,3,4,5]);
  assert.deepEqual(scoreBatch([{age:'70'}]).missingColumns, ['sex','educ','ses','eTIV','nWBV','ASF']);
});
test('exports carry illustrative labels, replace status collisions and escape CSV cells', () => {
  const csv = buildResultsCsv(scoreBatch([{...row, group: '=1+1', model_status: 'validated', note: 'a,"b"'}]));
  assert.match(csv, /illustrative_output_year_scale,illustrative_output_minus_age,model_status/);
  assert.match(csv, /unverified_illustrative_only/);
  assert.doesNotMatch(csv, /validated|predicted_age|brain_age_gap/);
  assert.match(csv, /'=1\+1/);
  assert.match(csv, /"a,""b"""/);
});
test('background is a finite explicitly synthetic grid with no validation metrics', () => {
  assert.equal(referenceCohort.length, 12);
  assert.ok(referenceCohort.every(r => r.group === 'Synthetic examples' && Number.isFinite(r.predicted_age)));
  assert.ok(!('validation_metrics' in modelParams));
});
