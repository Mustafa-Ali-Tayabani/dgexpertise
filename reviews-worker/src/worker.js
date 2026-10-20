/**
 * GET /reviews[?min=5]  →  { rating, count, updated, reviews: [...] }
 *
 * Secrets (wrangler secret put …):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN   OAuth client + owner refresh token
 *   GBP_ACCOUNT_ID, GBP_LOCATION_ID                                 numeric ids (see get-token.mjs output)
 */
import { buildFeed } from './reviews.js';

async function accessToken(env) {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token',
    }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function fetchAllReviews(env) {
  const token = await accessToken(env);
  const base = `https://mybusiness.googleapis.com/v4/accounts/${env.GBP_ACCOUNT_ID}/locations/${env.GBP_LOCATION_ID}/reviews`;
  const pages = [];
  let pageToken = '';
  for (let i = 0; i < 20; i++) { // 50 per page; 20 pages is far beyond what we need
    const url = `${base}?pageSize=50&orderBy=updateTime%20desc${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`reviews ${r.status}: ${await r.text()}`);
    const page = await r.json();
    pages.push(page);
    if (!page.nextPageToken) break;
    pageToken = encodeURIComponent(page.nextPageToken);
  }
  return pages;
}

function cors(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  };
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req, env) });
    const url = new URL(req.url);
    if (url.pathname !== '/reviews') return new Response('Not found', { status: 404 });
    const min = Math.min(5, Math.max(1, Number(url.searchParams.get('min')) || 5));

    const cache = caches.default;
    const key = new Request(`${url.origin}/reviews?min=${min}`);
    let res = await cache.match(key);
    if (!res) {
      try {
        const feed = buildFeed(await fetchAllReviews(env), min);
        res = new Response(JSON.stringify(feed), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${env.CACHE_SECONDS || 21600}` },
        });
        ctx.waitUntil(cache.put(key, res.clone()));
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json', ...cors(req, env) } });
      }
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors(req, env))) out.headers.set(k, v);
    return out;
  },
};
