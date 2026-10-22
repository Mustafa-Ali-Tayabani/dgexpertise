/**
 * Vercel Routing Middleware — passcode gate for the whole site (pages, assets, data).
 *
 * Set the passcode in Vercel → Project → Settings → Environment Variables:
 *   SITE_PASSCODE = <your code>
 * Leave it unset to disable the gate. Changing it logs everyone out.
 * Runs only on Vercel; `ng serve` locally is not gated.
 */
export const config = { matcher: '/:path*' };

const COOKIE = 'dg_access';
/** Let the request continue to the site (same as `next()` from @vercel/functions). */
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function token(passcode) {
  const data = new TextEncoder().encode(`dg-expertise:${passcode}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default async function middleware(request) {
  const passcode = process.env.SITE_PASSCODE;
  if (!passcode) return pass(); // gate disabled

  const url = new URL(request.url);
  const expected = await token(passcode);

  // passcode form submission
  if (url.pathname === '/__access' && request.method === 'POST') {
    const form = await request.formData();
    const next = safeNext(form.get('next'));
    if (String(form.get('passcode') || '') === passcode) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: next,
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page(next, true);
  }

  if (readCookie(request, COOKIE) === expected) return pass(); // unlocked → continue to the site

  return page(url.pathname + url.search, false);
}

function page(next, error) {
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>DG Expertise — Accès protégé</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{font-family:Inter,system-ui,sans-serif;background:#1A1A1A;color:#fff;display:grid;place-items:center;padding:24px;
  background-image:radial-gradient(60% 50% at 70% 30%,rgba(166,206,0,.18),transparent 70%),radial-gradient(50% 40% at 20% 80%,rgba(0,117,214,.15),transparent 70%)}
.card{width:100%;max-width:420px;padding:40px 36px;border-radius:24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(12px);
  animation:in .7s cubic-bezier(.16,1,.3,1) both}
@keyframes in{from{opacity:0;transform:translateY(20px)}}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.02em;margin-bottom:32px}
.brand i{width:34px;height:34px;border-radius:10px;background:#A6CE00;color:#1A1A1A;display:grid;place-items:center;font-style:normal;font-weight:800}
h1{margin:0 0 10px;font-size:30px;line-height:1.05;letter-spacing:-.03em;font-weight:300}
h1 b{font-weight:700;color:#A6CE00}
p{margin:0 0 28px;color:rgba(255,255,255,.65);font-size:15px;line-height:1.55}
label{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:8px}
input{width:100%;padding:15px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:#fff;font:500 16px Inter,sans-serif;letter-spacing:.12em;outline:none;transition:border-color .2s}
input:focus{border-color:#A6CE00}
button{margin-top:16px;width:100%;display:flex;justify-content:space-between;align-items:center;padding:7px 7px 7px 22px;border:0;border-radius:999px;background:#A6CE00;color:#1A1A1A;font:600 15px Inter,sans-serif;cursor:pointer}
button span{width:40px;height:40px;border-radius:50%;background:#1A1A1A;color:#A6CE00;display:grid;place-items:center;font-size:16px}
.err{margin:-12px 0 20px;padding:11px 14px;border-radius:12px;background:rgba(227,38,42,.12);border:1px solid rgba(227,38,42,.4);font-size:14px;color:#ffb3b3}
small{display:block;margin-top:22px;color:rgba(255,255,255,.4);font-size:12px;text-align:center}
</style></head><body>
<form class="card" method="post" action="/__access">
  <div class="brand"><i>DG</i>EXPERTISE</div>
  <h1>Accès <b>protégé</b></h1>
  <p>Ce site est en préparation. Saisissez le code d’accès pour continuer.<br><span style="opacity:.7">This site is in preview — enter the access code to continue.</span></p>
  ${error ? '<div class="err">Code incorrect · Incorrect code</div>' : ''}
  <label for="passcode">Code d’accès · Access code</label>
  <input id="passcode" name="passcode" type="password" autocomplete="current-password" required autofocus>
  <input type="hidden" name="next" value="${esc(next)}">
  <button type="submit">Entrer · Enter <span>→</span></button>
  <small>DG Expertise SA · +41 (0)22 535 93 64</small>
</form>
</body></html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
