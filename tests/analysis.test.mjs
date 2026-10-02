import test from 'node:test';
import assert from 'node:assert/strict';
import { validateScanResult } from '../lib/analysis/validate.ts';

const source = 'Every patient should bring his medication list to the appointment.';
const valid = () => ({
  documentBiasScore: 2.5, letterGrade: 'F', summary: 'Review generic pronoun usage.',
  totalFlags: 99, flags: [{ id: 'untrusted', flaggedSentence: source,
    category: 'PRONOUN_DEFAULT', severity: 1,
    explanation: 'The general instruction assumes a male patient.',
    suggestedRewrite: 'Patients should bring their medication lists to the appointment.',
    citation: { text: 'Unverified reference', pubmedId: '123' },
  }],
});
test('derives totals and grades, assigns IDs, and withholds unverified citations', () => {
  const result = validateScanResult(valid(), source);
  assert.equal(result.totalFlags, 1);
  assert.equal(result.letterGrade, 'B');
  assert.equal(result.categoryCounts.PRONOUN_DEFAULT, 1);
  assert.equal(result.categoryCounts.MALE_DEFAULT_CASE, 0);
  assert.equal(result.flags[0].id, 'flag-1');
  assert.equal(result.flags[0].citation, undefined);
});
test('rejects hallucinated quotations and duplicate findings', () => {
  assert.throws(() => validateScanResult(valid(), 'A different document.'));
  const result = valid();
  result.flags.push(result.flags[0]);
  assert.throws(() => validateScanResult(result, source));
});
test('rejects malformed scores, categories, severity, and missing explanations', () => {
  for (const score of [NaN, Infinity, -1, 11, '2']) {
    assert.throws(() => validateScanResult({ ...valid(), documentBiasScore: score }, source));
  }
  for (const changes of [{ category: 'OTHER' }, { severity: 9 }, { explanation: '' }]) {
    const result = valid();
    Object.assign(result.flags[0], changes);
    assert.throws(() => validateScanResult(result, source));
  }
});
test('accepts abstention without fabricating findings', () => {
  const result = validateScanResult({ ...valid(), flags: [], documentBiasScore: 0 }, source);
  assert.equal(result.totalFlags, 0);
  assert.equal(result.letterGrade, 'A');
});
