import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { Header } from './header.component';
import { splitTitle } from '../data/site-images';

const APP_STORE = 'https://apps.apple.com/ch/app/pollux-mobile/id1589255990?l=fr';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=ch.dgexpertise.polluxMobile';

/**
 * Application page hero: text on the left, a live-looking Pollux phone on the right
 * (diagnostics list whose report status updates, notification toast, floating actions).
 * The phone UI is drawn in HTML/CSS so it stays crisp at any size.
 */
@Component({
  selector: 'dg-app-hero',
  imports: [Header],
  template: `
@let h = hero();
@let T = t();
<section class="ah" (mousemove)="tilt($event)" (mouseleave)="resetTilt()">
  <div class="bg"><i class="glow"></i><i class="grid"></i></div>
  <div class="hdr"><dg-header active="application" [overlay]="true" /></div>

  <div class="inner">
    <div class="copy r-hero-copy">
      <div class="eyebrow"><span class="dg-dot"></span>{{ h.eyebrow }}</div>
      <h1>{{ title().a }} <span class="hl">{{ title().b }}<span class="mk">{{ title().mark }}</span></span></h1>
      <p class="lead">{{ h.lead }}</p>
      <div class="ctas">
        <a class="dg-cta" [href]="storeUrl()" target="_blank" rel="noopener"><span class="dg-cta-label">{{ h.cta }}</span><span class="dg-cta-arrow"><span>→</span></span><span class="dg-cta-shine"></span></a>
      </div>
      <div class="stores">
        <a [href]="appStore" target="_blank" rel="noopener" class="store">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2-.1 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg>
          <span><small>{{ T.appSmall }}</small><b>App Store</b></span>
        </a>
        <a [href]="playStore" target="_blank" rel="noopener" class="store">
          <svg viewBox="0 0 24 24"><path fill="#34A853" d="M3.6 2.2l10.1 10-10.1 10c-.3-.2-.5-.6-.5-1.1V3.3c0-.5.2-.9.5-1.1z"/><path fill="#FBBC05" d="M17 15.5l-3.3-3.3L17 8.9l4 2.3c.9.5.9 1.4 0 1.9l-4 2.4z"/><path fill="#EA4335" d="M13.7 12.2L3.6 22.2c.4.3 1 .3 1.6 0L17 15.5l-3.3-3.3z"/><path fill="#4285F4" d="M13.7 12.2L17 8.9 5.2 2.3c-.6-.3-1.2-.3-1.6 0l10.1 9.9z"/></svg>
          <span><small>{{ T.playSmall }}</small><b>Google Play</b></span>
        </a>
        <span class="free"><i></i>{{ T.free }}</span>
      </div>
    </div>

    <div class="stage" [style.--rx.deg]="rx()" [style.--ry.deg]="ry()">
      <div class="phone">
        <div class="screen">
          <div class="status"><b>9:41</b><span class="sig"><i></i><i></i><i></i></span></div>
          <div class="app-top">
            <span class="logo">P</span><b>Pollux</b>
            <span class="bell"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>@if (phase() > 0) {<i></i>}</span>
          </div>
          <div class="hello">{{ T.hello }}</div>
          <div class="ttl">{{ T.mine }}</div>
          <div class="chips"><span class="on">{{ T.all }}</span><span>{{ T.asb }}</span><span>{{ T.lead }}</span><span>CECB</span></div>

          @for (c of cards(); track c.addr; let i = $index) {
            <div class="card" [style.--i]="i">
              <span class="ic" [class]="'ic ' + c.kind"><svg viewBox="0 0 24 24"><path d="M4 21V10l8-6 8 6v11z"/><path d="M9 21v-6h6v6"/></svg></span>
              <div class="cb"><b>{{ c.addr }}</b><small>{{ c.type }} · {{ c.date }}</small>
                <span class="st" [class]="'st ' + c.state">
                  @switch (c.state) {
                    @case ('ok') {<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>{{ T.ready }}}
                    @case ('wait') {<i class="spin"></i>{{ T.analysing }}}
                    @case ('rdv') {<svg viewBox="0 0 16 16"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 7h11M5.5 2v3M10.5 2v3"/></svg>{{ T.visit }}}
                  }
                </span>
              </div>
              @if (c.state === 'ok') {<span class="dl"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></span>}
            </div>
          }

          <div class="order">{{ T.order }} <span>+</span></div>
          <div class="tabbar"><i class="on"></i><i></i><i></i><i></i></div>

          <div class="toast" [class.show]="phase() === 1">
            <span class="logo sm">P</span>
            <div><b>{{ T.toastH }}</b><small>{{ T.toastP }}</small></div>
          </div>
        </div>
      </div>
      <div class="float f1"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h11L21 8H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>{{ T.f1 }}</div>
      <div class="float f2"><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/></svg>{{ T.f2 }}</div>
      <div class="float f3"><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>{{ T.f3 }}</div>
    </div>
  </div>
</section>`,
  styles: `
    :host{display:block}
    .ah{position:relative;min-height:860px;overflow:hidden;color:#fff;background:#141414;display:flex;flex-direction:column}
    .bg{position:absolute;inset:0;pointer-events:none}
    .glow{position:absolute;right:-8%;top:8%;width:62%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(166,206,0,.28) 0%,rgba(0,117,214,.14) 38%,transparent 68%);filter:blur(10px)}
    .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse at 70% 45%,#000 20%,transparent 70%)}
    .hdr{position:relative;z-index:60}
    .inner{position:relative;flex:1;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:var(--g64);align-items:center;padding:20px var(--gx) 72px}

    .eyebrow{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:500;color:rgba(255,255,255,.88);margin-bottom:28px}
    h1{margin:0;font-size:clamp(44px,6.1vw,88px);line-height:.96;letter-spacing:-.045em;font-weight:300;text-wrap:balance}
    .hl{font-weight:700;color:#A6CE00}
    .mk{color:#0075D6}
    .lead{margin:28px 0 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,.78);max-width:560px;text-wrap:pretty}
    .ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:36px}
    .stores{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px}
    .store{display:inline-flex;align-items:center;gap:10px;padding:9px 18px 9px 14px;border-radius:14px;background:#000;border:1px solid rgba(255,255,255,.22);color:#fff;transition:border-color .25s,translate .3s}
    .store:hover{border-color:#A6CE00;color:#fff;translate:0 -2px}
    .store svg{width:24px;height:24px}
    .store span{display:flex;flex-direction:column;line-height:1.1}
    .store small{font-size:10px;color:rgba(255,255,255,.7)}
    .store b{font-size:16px;font-weight:600;letter-spacing:-.01em}
    .free{display:inline-flex;align-items:center;gap:8px;margin-left:6px;font-size:13px;color:rgba(255,255,255,.6)}
    .free i{width:6px;height:6px;border-radius:50%;background:#A6CE00}

    /* phone */
    .stage{position:relative;display:grid;place-items:center;perspective:1400px;min-height:700px}
    .phone{position:relative;width:310px;height:640px;border-radius:50px;background:#0b0b0b;padding:11px;
      box-shadow:0 0 0 1.5px #3a3a3a,0 50px 100px rgba(0,0,0,.6),0 0 80px rgba(166,206,0,.12);
      transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) rotate(-2deg);transition:transform .5s cubic-bezier(.2,.8,.2,1);animation:phoneIn 1.1s cubic-bezier(.16,1,.3,1) .2s both}
    @keyframes phoneIn{from{opacity:0;translate:0 60px;rotate:6deg}}
    .phone::before{content:"";position:absolute;top:20px;left:50%;translate:-50% 0;width:96px;height:26px;border-radius:20px;background:#000;z-index:3}
    .screen{position:relative;height:100%;border-radius:40px;overflow:hidden;background:#F3F4EF;color:#1A1A1A;padding:52px 16px 0;font-family:Inter,sans-serif}
    .status{position:absolute;top:18px;left:26px;right:24px;display:flex;justify-content:space-between;font-size:12px}
    .sig{display:flex;gap:2px;align-items:flex-end}.sig i{width:3px;background:#1A1A1A;border-radius:1px}.sig i:nth-child(1){height:5px}.sig i:nth-child(2){height:8px}.sig i:nth-child(3){height:11px}
    .app-top{display:flex;align-items:center;gap:8px;margin-top:4px}
    .logo{width:30px;height:30px;border-radius:9px;background:#A6CE00;color:#1A1A1A;font-weight:800;display:grid;place-items:center;font-size:15px}
    .logo.sm{width:28px;height:28px;flex-shrink:0}
    .app-top b{font-size:16px;letter-spacing:-.01em}
    .bell{margin-left:auto;position:relative;width:32px;height:32px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .bell svg{width:16px;height:16px;fill:none;stroke:#1A1A1A;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .bell i{position:absolute;top:6px;right:7px;width:8px;height:8px;border-radius:50%;background:#E3262A;border:2px solid #fff;animation:pop .4s cubic-bezier(.2,1.6,.4,1)}
    @keyframes pop{from{scale:0}}
    .hello{margin-top:18px;font-size:12px;color:rgba(26,26,26,.55)}
    .ttl{font-size:21px;font-weight:700;letter-spacing:-.02em;margin-top:2px}
    .chips{display:flex;gap:6px;margin:12px 0 12px;overflow:hidden}
    .chips span{padding:6px 11px;border-radius:999px;background:#fff;font-size:11px;font-weight:500;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.06)}
    .chips .on{background:#1A1A1A;color:#fff}
    .card{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px;border-radius:16px;background:#fff;margin-bottom:9px;box-shadow:0 2px 8px rgba(0,0,0,.05);animation:cardIn .7s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(.6s + var(--i) * .15s)}
    @keyframes cardIn{from{opacity:0;translate:0 18px}}
    .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center}
    .ic svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}
    .ic.asb{background:rgba(166,206,0,.18);color:#5f7700}.ic.lead{background:rgba(0,117,214,.12);color:#0075D6}.ic.cecb{background:rgba(242,194,0,.2);color:#9a7a00}
    .cb{display:flex;flex-direction:column;gap:2px;min-width:0}
    .cb b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cb small{font-size:10.5px;color:rgba(26,26,26,.5)}
    .st{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;margin-top:4px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:600;animation:stIn .4s ease both}
    @keyframes stIn{from{opacity:0;scale:.9}}
    .st svg{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .st.ok{background:rgba(166,206,0,.2);color:#4d6100}.st.wait{background:rgba(242,194,0,.2);color:#8a6c00}.st.rdv{background:rgba(0,117,214,.1);color:#0075D6}
    .spin{width:9px;height:9px;border-radius:50%;border:1.6px solid currentColor;border-right-color:transparent;animation:spin 1s linear infinite}
    @keyframes spin{to{rotate:360deg}}
    .dl{width:30px;height:30px;border-radius:50%;background:#1A1A1A;display:grid;place-items:center}
    .dl svg{width:14px;height:14px;fill:none;stroke:#A6CE00;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .order{margin-top:12px;display:flex;justify-content:space-between;align-items:center;padding:13px 16px;border-radius:14px;background:#A6CE00;font-size:13px;font-weight:700;animation:cardIn .7s cubic-bezier(.16,1,.3,1) 1.15s both}
    .order span{width:24px;height:24px;border-radius:50%;background:#1A1A1A;color:#A6CE00;display:grid;place-items:center;font-size:16px}
    .tabbar{position:absolute;left:0;right:0;bottom:0;height:62px;background:#fff;display:flex;justify-content:space-around;align-items:center;border-top:1px solid rgba(0,0,0,.06)}
    .tabbar i{width:22px;height:22px;border-radius:7px;background:rgba(26,26,26,.12)}.tabbar i.on{background:#A6CE00}
    .toast{position:absolute;left:10px;right:10px;top:44px;z-index:2;display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:18px;background:rgba(26,26,26,.92);backdrop-filter:blur(10px);color:#fff;
      translate:0 -140%;opacity:0;transition:translate .6s cubic-bezier(.2,1.2,.3,1),opacity .4s}
    .toast.show{translate:0 0;opacity:1}
    .toast b{display:block;font-size:12px}.toast small{font-size:10.5px;color:rgba(255,255,255,.65)}

    .float{position:absolute;display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:16px;background:rgba(26,26,26,.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);font-size:14px;font-weight:600;box-shadow:0 20px 40px rgba(0,0,0,.35);animation:floatIn .8s cubic-bezier(.16,1,.3,1) both, bob 6s ease-in-out infinite}
    .float svg{width:20px;height:20px;fill:none;stroke:#A6CE00;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .f1{left:2%;top:22%;animation-delay:1s,1.8s}
    .f2{right:0;top:44%;animation-delay:1.2s,0s}
    .f3{right:2%;bottom:9%;animation-delay:1.4s,3s}
    @keyframes floatIn{from{opacity:0;scale:.8}}
    @keyframes bob{0%,100%{translate:0 0}50%{translate:0 -10px}}

    @media (max-width:1100px){
      .inner{grid-template-columns:minmax(0,1fr);padding-top:40px}
      .stage{min-height:600px}
      .phone{scale:.88}
      .f1{left:0}.f3{right:0}
    }
    @media (max-width:560px){
      .ah{min-height:0}
      .stage{min-height:560px;margin:0 -10px}
      .phone{scale:.8}
      .float{font-size:12px;padding:9px 13px}
      .f2{right:-4px}
    }
    @media (prefers-reduced-motion: reduce){.phone,.card,.order,.float,.st{animation:none}}
  `,
})
export class AppHero {
  readonly hero = input.required<any>();
  readonly lang = input('fr');
  protected appStore = APP_STORE;
  protected playStore = PLAY_STORE;
  /** 0 = analysis running, 1 = notification + report ready, 2 = ready (hold). Cycles. */
  protected phase = signal(0);
  protected rx = signal(0);
  protected ry = signal(0);
  private storeHref = signal(APP_STORE);
  protected storeUrl = this.storeHref.asReadonly();

  protected title = computed(() => {
    const t = splitTitle(String(this.hero().title || '').replace(/-/g, '‑'));
    return t;
  });

  protected t = computed(() => this.lang() === 'en'
    ? { appSmall: 'Download on the', playSmall: 'Get it on', free: 'Free · iOS & Android', hello: 'Hello', mine: 'My surveys', all: 'All', asb: 'Asbestos', lead: 'Lead',
        ready: 'Report available', analysing: 'Lab analysis', visit: 'Visit · 24 Oct.', order: 'Order a survey', toastH: 'New report available', toastP: 'Lead survey · Rue du Lac 4',
        f1: 'Order', f2: 'View reports', f3: 'Risk geolocation', kinds: ['Asbestos', 'Lead', 'CECB'] }
    : { appSmall: 'Télécharger dans', playSmall: 'Disponible sur', free: 'Gratuit · iOS & Android', hello: 'Bonjour', mine: 'Mes diagnostics', all: 'Tous', asb: 'Amiante', lead: 'Plomb',
        ready: 'Rapport disponible', analysing: 'Analyse en cours', visit: 'Visite · 24 oct.', order: 'Commander un diagnostic', toastH: 'Nouveau rapport disponible', toastP: 'Diagnostic plomb · Rue du Lac 4',
        f1: 'Commander', f2: 'Consulter', f3: 'Géolocalisation des risques', kinds: ['Amiante', 'Plomb', 'CECB'] });

  protected cards = computed(() => {
    const T = this.t(), p = this.phase();
    return [
      { addr: 'Av. de la Gare 12, Genève', type: T.kinds[0], date: '12.10', kind: 'asb', state: 'ok' },
      { addr: 'Rue du Lac 4, Lausanne', type: T.kinds[1], date: '16.10', kind: 'lead', state: p === 0 ? 'wait' : 'ok' },
      { addr: 'Ch. des Vignes 8, Sion', type: T.kinds[2], date: '24.10', kind: 'cecb', state: 'rdv' },
    ];
  });

  constructor() {
    const zone = inject(NgZone), destroy = inject(DestroyRef), host = inject(ElementRef).nativeElement as HTMLElement;
    afterNextRender(() => {
      if (/Android/i.test(navigator.userAgent)) this.storeHref.set(PLAY_STORE);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.phase.set(2); return; }
      // status cycle: analysing (3.2s) → notification + ready (3s) → ready (2.6s) → repeat
      const steps = [3200, 3000, 2600];
      let t: ReturnType<typeof setTimeout>;
      const next = () => { t = setTimeout(() => { zone.run(() => this.phase.update(p => (p + 1) % 3)); next(); }, steps[this.phase()]); };
      // start once the hero is on screen
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); next(); } });
      io.observe(host);
      destroy.onDestroy(() => { clearTimeout(t); io.disconnect(); });
    });
  }

  protected tilt(e: MouseEvent) {
    if (matchMedia('(hover: none)').matches) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    this.rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  }
  protected resetTilt() { this.rx.set(0); this.ry.set(0); }
}
