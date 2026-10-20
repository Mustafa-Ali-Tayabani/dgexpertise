# DG Expertise — Google reviews feed

A small Cloudflare Worker that reads **all** reviews of the DG Expertise Google Business Profile
(Business Profile API, owner access) and serves the 5★ ones as JSON to the website:

```
GET https://dg-reviews.<your-subdomain>.workers.dev/reviews
→ { "rating": 4.6, "count": 25, "updated": "…", "reviews": [ { "author", "photo", "rating", "text", "translated", "date", "reply" } ] }
```

Results are cached for 6 hours (`CACHE_SECONDS`), so Google is called at most a few times a day.
If Google fails, the website keeps showing its built-in reviews (`web/src/app/data/google-reviews.ts`).

## One-time setup (≈30 min + Google's approval delay)

Do steps 1–5 with the **Google account that owns or manages the DG Expertise listing**.

1. **Google Cloud project.** Create a project at https://console.cloud.google.com (e.g. "dg-expertise-site").
2. **Request Business Profile API access.** Follow https://developers.google.com/my-business/content/prereqs and submit the access request form for this project.
   Google reviews it (usually a few days). When approved, the APIs below show a non-zero quota.
3. **Enable the APIs** (APIs & Services → Library):
   - My Business Account Management API
   - My Business Business Information API
   - Google My Business API (the one that lists reviews)
4. **OAuth consent screen** (APIs & Services → OAuth consent screen): user type *External*, add the scope
   `https://www.googleapis.com/auth/business.manage`, then **Publish app** ("In production").
   Leaving it in *Testing* makes the refresh token expire after 7 days. For your own account you can continue past the "unverified app" warning.
5. **OAuth client** (Credentials → Create credentials → OAuth client ID): type *Web application*,
   authorised redirect URI `http://127.0.0.1:8787/callback`. Copy the client ID and secret.
6. **Get the refresh token and ids** (from this folder):
   ```bash
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com GOOGLE_CLIENT_SECRET=yyy node get-token.mjs
   ```
   Sign in with the owner account. The terminal prints `GOOGLE_REFRESH_TOKEN`, then one line per listing with
   `GBP_ACCOUNT_ID` and `GBP_LOCATION_ID` — use the line for DG Expertise, Avenue de Vaudagne 33.
7. **Deploy the Worker** (free Cloudflare account):
   ```bash
   npx wrangler@3 login
   npx wrangler@3 secret put GOOGLE_CLIENT_ID
   npx wrangler@3 secret put GOOGLE_CLIENT_SECRET
   npx wrangler@3 secret put GOOGLE_REFRESH_TOKEN
   npx wrangler@3 secret put GBP_ACCOUNT_ID
   npx wrangler@3 secret put GBP_LOCATION_ID
   npx wrangler@3 deploy
   ```
   Open `https://dg-reviews.<subdomain>.workers.dev/reviews` — you should see the JSON.
8. **Connect the website**: in `web/src/app/data/google-reviews.ts` set
   `feed: 'https://dg-reviews.<subdomain>.workers.dev/reviews'`, and add the production domain to
   `ALLOWED_ORIGINS` in `wrangler.toml` if it differs (then `npx wrangler@3 deploy` again).

## Tests

```bash
node test.mjs          # review conversion (translations, 5★ filter, ordering)
node test-worker.mjs   # Worker with Google mocked: paging, cache, CORS, error fallback
```
