import test from 'node:test';
import assert from 'node:assert/strict';
import { compareFindings } from '../lib/analysis/comparison.ts';
test('classifies normalized exact source quotes and categories without semantic claims', () => {
  const a = { category: 'PRONOUN_DEFAULT', flaggedSentence: 'Every patient brings his list.' };
  const b = { category: 'MALE_DEFAULT_CASE', flaggedSentence: 'Different quote.' };
  const comparison = compareFindings([a, b], [{ ...a, flaggedSentence: ' Every patient  brings his list. ' }, { ...b, category: 'PRONOUN_DEFAULT' }]);
  assert.equal(comparison.retained.length, 1);
  assert.equal(comparison.added.length, 1);
  assert.equal(comparison.noLongerReported.length, 1);
  assert.equal(compareFindings([a], []).noLongerReported.length, 1);
});
