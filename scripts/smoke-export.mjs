// Export integration check; creates only ignored files, no provider calls.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const originalText = 'Every patient should bring his medication list to the appointment.';
const result = {
  documentBiasScore: 2, summary: 'Synthetic pronoun example for report testing.',
  flags: [{ id: 'flag-1', flaggedSentence: originalText, category: 'PRONOUN_DEFAULT', severity: 2,
    explanation: 'Generic instructions use male pronouns.', suggestedRewrite: 'Every patient should bring their medication list to the appointment.' }],
};
const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const response = await fetch(new URL('/api/export-pdf', baseUrl), {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ originalText, result, documentTitle: 'Synthetic review export test', reviewDecisions: { 'flag-1': 'accepted' }, reviewerNotes: { 'flag-1': process.env.SMOKE_LONG_NOTE ? 'Synthetic reviewer rationale. '.repeat(60) : 'Accepted inclusive wording; original retained.' } }),
});
assert.equal(response.status, 200);
assert.match(response.headers.get('content-type'), /application\/pdf/);
const bytes = Buffer.from(await response.arrayBuffer());
assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
await mkdir('tmp/pdfs', { recursive: true });
await writeFile('tmp/pdfs/review-export.pdf', bytes);
console.log('Export passed; inspect tmp/pdfs/review-export.pdf for layout and accepted status.');
