// Run against a local production server. No AI calls or database writes.
import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
for (const path of ['/demo', '/samples/generic-pronoun.txt', '/login']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
}
const dashboard = await fetch(new URL('/dashboard', base), { redirect: 'manual' });
assert.equal(dashboard.status, 307);
assert.equal(new URL(dashboard.headers.get('location'), base).pathname, '/login');
const failure = await fetch(new URL('/?error_code=bad_oauth_state', base), { redirect: 'manual' });
assert.equal(new URL(failure.headers.get('location'), base).pathname, '/login');
const invalidFile = new FormData();
invalidFile.append('file', new Blob(['not a PDF'], { type: 'text/plain' }), 'invalid.txt');
const upload = await fetch(new URL('/api/extract-pdf', base), { method: 'POST', body: invalidFile });
assert.equal(upload.status, 400);
const addendum = await fetch(new URL('/api/addendum', base), {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ originalText: 'A synthetic educational excerpt with enough text for this no-findings contract check.', scanResult: {
    documentBiasScore: 0, summary: 'No concerns found.', flags: [],
  } }),
});
assert.equal(addendum.status, 400);
assert.match((await addendum.json()).error, /at least one finding/);
const invalidReport = await fetch(new URL('/api/export-pdf', base), {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ result: { flags: 'invalid' } }),
});
assert.equal(invalidReport.status, 400);
console.log('Passed: public demo, sample download, login, protected workspace, OAuth recovery, invalid upload, no-findings addendum.');
