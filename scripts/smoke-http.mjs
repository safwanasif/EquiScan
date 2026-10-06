// Run against a local production server. No AI calls or database writes.
import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
for (const path of ['/demo', '/evaluation', '/samples/generic-pronoun.txt', '/login']) {
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
const oversizedFile = new FormData();
oversizedFile.append('file', new Blob([new Uint8Array(4_000_001)], { type: 'application/pdf' }), 'oversized.pdf');
const oversizedUpload = await fetch(new URL('/api/extract-pdf', base), { method: 'POST', body: oversizedFile });
assert.equal(oversizedUpload.status, 400);
assert.match((await oversizedUpload.json()).error, /4 MB/);
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
const source = 'Every patient should discuss his concerns with the clinician before treatment.';
const liveRequests = [
  ['/api/reviewer-note', { flagId: '00000000-0000-4000-8000-000000000001', note: 'Synthetic note' }],
  ['/api/audit-revision', { parentScanId: '00000000-0000-4000-8000-000000000001', text: source }],
  ['/api/scan', { text: source }],
  ['/api/rewrite', { flaggedSentence: source, category: 'PRONOUN_DEFAULT' }],
  ['/api/addendum', { originalText: source, scanResult: {
    documentBiasScore: 2, summary: 'Generic male pronoun.', flags: [{
      flaggedSentence: source, category: 'PRONOUN_DEFAULT', severity: 1,
      explanation: 'Generic patient assumes male pronouns.', suggestedRewrite: 'Every patient should discuss their concerns with the clinician before treatment.',
    }],
  } }],
];
for (const [path, body] of liveRequests) {
  const response = await fetch(new URL(path, base), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  assert.equal(response.status, 401, path);
  assert.match((await response.json()).error, /Sign in/);
}
const removedLogin = await fetch(new URL('/api/dev-login', base), { method: 'POST' });
assert.equal(removedLogin.status, 404);
console.log('Passed: public pages, protected workspace, OAuth recovery, invalid inputs, unsigned AI routes, removed development login.');
