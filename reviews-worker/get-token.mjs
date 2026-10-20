#!/usr/bin/env node
/**
 * One-time helper: sign in with the Google account that OWNS the DG Expertise listing,
 * then print the refresh token and the account/location ids the Worker needs.
 *
 *   GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… node get-token.mjs
 *
 * The OAuth client must be of type "Web application" with this authorised redirect URI:
 *   http://127.0.0.1:8787/callback
 */
import http from 'node:http';
import { exec } from 'node:child_process';

const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) { console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.'); process.exit(1); }

const REDIRECT = 'http://127.0.0.1:8787/callback';
const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
auth.search = new URLSearchParams({
  client_id: id, redirect_uri: REDIRECT, response_type: 'code', access_type: 'offline', prompt: 'consent',
  scope: 'https://www.googleapis.com/auth/business.manage',
}).toString();

const getJson = async (url, token) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${url}\n→ ${r.status} ${JSON.stringify(body.error ?? body)}`);
  return body;
};

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  if (u.pathname !== '/callback') { res.writeHead(404).end(); return; }
  const code = u.searchParams.get('code');
  if (!code) { res.end(`Sign-in failed: ${u.searchParams.get('error')}`); return; }
  res.end('Signed in — you can close this tab and return to the terminal.');
  server.close();

  try {
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
    }).then(r => r.json());
    if (!tr.refresh_token) throw new Error('No refresh token returned: ' + JSON.stringify(tr));

    console.log('\nGOOGLE_REFRESH_TOKEN =', tr.refresh_token, '\n');
    const { accounts = [] } = await getJson('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', tr.access_token);
    for (const acc of accounts) {
      const accId = acc.name.split('/')[1];
      const { locations = [] } = await getJson(`https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`, tr.access_token);
      for (const loc of locations) {
        const addr = (loc.storefrontAddress?.addressLines || []).join(', ');
        console.log(`GBP_ACCOUNT_ID = ${accId}   GBP_LOCATION_ID = ${loc.name.split('/')[1]}   ← ${loc.title} (${addr})`);
      }
    }
    console.log('\nUse the line for "DG Expertise" (Avenue de Vaudagne 33) — see README.md for the next commands.');
  } catch (e) {
    console.error('\n' + e.message);
    console.error('\nIf this says the API is disabled or access is not granted, finish step 2 of README.md (Business Profile API access) and run again.');
    process.exitCode = 1;
  }
});

server.listen(8787, '127.0.0.1', () => {
  console.log('Opening Google sign-in… if nothing opens, visit:\n\n' + auth + '\n');
  exec(`${process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open'} "${auth}"`);
});
