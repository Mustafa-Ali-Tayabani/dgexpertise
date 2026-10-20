// node test-worker.mjs — runs the Worker with Google endpoints mocked (token, 2 review pages), cache and CORS.
import assert from 'node:assert/strict';
const calls = [];
const store = new Map();
globalThis.caches = { default: { match: async k => store.get(k.url)?.clone(), put: async (k, r) => { store.set(k.url, r); } } };
globalThis.fetch = async (url, init = {}) => {
  url = String(url); calls.push(url);
  if (url.includes('oauth2.googleapis.com/token')) return Response.json({ access_token: 'AT' });
  if (url.includes('/reviews')) {
    assert.equal(init.headers.Authorization, 'Bearer AT');
    const second = url.includes('pageToken=');
    return Response.json(second
      ? { reviews: [{ reviewId: 'p2', reviewer: { displayName: 'Page Two' }, starRating: 'FIVE', createTime: '2025-01-01T00:00:00Z', comment: 'Parfait' }] }
      : { averageRating: 4.6, totalReviewCount: 25, nextPageToken: 'NEXT', reviews: [
          { reviewId: 'p1', reviewer: { displayName: 'Page One' }, starRating: 'FIVE', createTime: '2025-05-01T00:00:00Z', comment: 'Top' },
          { reviewId: 'low', reviewer: { displayName: 'Low' }, starRating: 'ONE', createTime: '2025-06-01T00:00:00Z', comment: 'Bad' }] });
  }
  throw new Error('unexpected fetch ' + url);
};
const { default: worker } = await import('./src/worker.js');
const env = { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 's', GOOGLE_REFRESH_TOKEN: 'rt', GBP_ACCOUNT_ID: '1', GBP_LOCATION_ID: '2', ALLOWED_ORIGINS: 'http://localhost:4200,https://www.dgexpertise.ch' };
const waits = []; const ctx = { waitUntil: p => waits.push(p) };

const r1 = await worker.fetch(new Request('https://w.dev/reviews', { headers: { Origin: 'http://localhost:4200' } }), env, ctx);
await Promise.all(waits);
const body = await r1.json();
assert.equal(r1.status, 200);
assert.equal(r1.headers.get('Access-Control-Allow-Origin'), 'http://localhost:4200');
assert.equal(body.count, 25); assert.equal(body.rating, 4.6);
assert.deepEqual(body.reviews.map(r => r.author), ['Page One', 'Page Two'], 'all pages, 5★ only');
assert.equal(calls.filter(u => u.includes('/reviews')).length, 2, 'followed nextPageToken');

calls.length = 0;
const r2 = await worker.fetch(new Request('https://w.dev/reviews', { headers: { Origin: 'https://www.dgexpertise.ch' } }), env, ctx);
assert.equal((await r2.json()).reviews.length, 2);
assert.equal(calls.length, 0, 'second request served from cache');
assert.equal(r2.headers.get('Access-Control-Allow-Origin'), 'https://www.dgexpertise.ch');

globalThis.fetch = async () => new Response('denied', { status: 403 });
store.clear();
const r3 = await worker.fetch(new Request('https://w.dev/reviews'), env, ctx);
assert.equal(r3.status, 502, 'Google errors surface as 502 so the site falls back');
console.log('worker.js: all checks passed');
