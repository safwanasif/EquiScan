import test from 'node:test';
import assert from 'node:assert/strict';
import { previewEdits } from '../lib/analysis/edits.ts';
test('applies distinct edits in source order without modifying source', () => {
  const source = 'He arrived. His list was ready.';
  const preview = previewEdits(source, [{ id: 'b', quote: 'His list', replacement: 'Their list' }, { id: 'a', quote: 'He arrived.', replacement: 'They arrived.' }]);
  assert.equal(preview.revised, 'They arrived. Their list was ready.');
  assert.equal(source, 'He arrived. His list was ready.');
  assert.equal(previewEdits(source, []).revised, source);
});
test('rejects ambiguous, missing and overlapping passages', () => {
  assert.throws(() => previewEdits('He. He.', [{ id: 'a', quote: 'He.', replacement: 'They.' }]));
  assert.throws(() => previewEdits('He arrived.', [{ id: 'a', quote: 'missing', replacement: '' }]));
  assert.throws(() => previewEdits('He arrived.', [{ id: 'a', quote: 'He arrived.', replacement: 'They arrived.' }, { id: 'b', quote: 'arrived', replacement: 'left' }]));
});
