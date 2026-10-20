import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { ArticlesService } from '../core/articles.service';
import { Icon } from './icons';

type Kind = 'reports' | 'order' | 'geo' | 'news';

/**
 * Pollux app screens drawn in HTML/CSS (no screenshots): one per feature of the Application page.
 * Each plays a short looping demo of its feature once it scrolls into view.
 */
@Component({
  selector: 'dg-phone-screen',
  imports: [Icon],
  template: `
@let T = t();
<div class="phone" [class.live]="live()">
  <div class="screen">
    <div class="status"><b>9:41</b><span class="sig"><i></i><i></i><i></i></span></div>
    <div class="top"><span class="logo">P</span><b>Pollux</b><span class="menu"><i></i><i></i><i></i></span></div>

    @switch (kind()) {
      @case ('reports') {
        <div class="h big">{{ T.quick }}</div>
        <div class="search plain">{{ T.searchReports }}</div>
        <div class="h tube"><svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v13a2 2 0 0 0 4 0V3M10 11h4"/></svg>{{ T.allReports }}</div>
        @for (r of reports(); track $index; let i = $index) {
          <div class="rep" [style.--i]="i" [class.pressed]="step() === 1 && i === 1">
            <div><b>{{ r.t }}</b><small><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>{{ r.a }}</small><small class="m">{{ r.m }}</small></div>
            <span class="share"><svg viewBox="0 0 24 24"><path d="M14 5l6 6-6 6M20 11h-9a6 6 0 0 0-6 6v1"/></svg>{{ T.share }}</span>
          </div>
        }
        <div class="sheet" [class.show]="step() >= 2">
          <i class="grab"></i><b>{{ T.shareReport }}</b>
          <div class="opts">
            <span><i class="o1"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg></i>{{ T.email }}</span>
            <span [class.tap]="step() === 3"><i class="o2"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></i>{{ T.link }}</span>
            <span><i class="o3"><svg viewBox="0 0 24 24"><path d="M12 15V3M7 10l5 5 5-5M5 21h14"/></svg></i>PDF</span>
          </div>
        </div>
        <div class="toast" [class.show]="step() === 3"><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>{{ T.copied }}</div>
      }

      @case ('order') {
        <div class="h big">{{ T.needs }}</div>
        <div class="tiles">
          @for (o of order(); track o.id; let i = $index) {
            <div class="tile" [class.sel]="o.sel" [style.--i]="i">
              <b>{{ o.label }}</b>
              <span class="ti"><dg-icon [name]="o.id" /><i class="ck"><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg></i></span>
            </div>
          }
        </div>
        <div class="cta" [class.on]="selCount() > 0">{{ T.orderBtn }} @if (selCount()) {<span class="n">{{ selCount() }}</span>}</div>
      }

      @case ('geo') {
        <div class="lbl">{{ T.canton }}</div>
        <div class="pills">@for (c of cantons; track c) {<span [class.on]="c === 'Genève'">{{ c }}</span>}</div>
        <div class="lbl">{{ T.likely }}</div>
        <div class="pills">@for (p of T.pollutants; track p; let i = $index) {<span class="pol" [class.on]="step() >= 2 && i < 3" [style.--i]="i">{{ p }}</span>}</div>
        <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span class="typed">{{ typed() }}</span>@if (step() === 0) {<i class="caret"></i>}</div>
        <div class="map">
          <svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice">
            <rect width="260" height="130" fill="#dfe6d6"/>
            <path d="M0 92 C60 80 90 104 150 88 S230 70 260 78 V130 H0z" fill="#b9d3e6"/>
            <g stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-10 30 L270 54"/><path d="M80 -10 L104 140"/><path d="M180 -10 L160 140"/><path d="M-10 70 L120 60 L270 20"/></g>
            <g stroke="#fff" stroke-width="2" fill="none"><path d="M30 0 L44 130"/><path d="M0 46 L260 36"/><path d="M220 0 L236 130"/><path d="M130 0 L140 80"/></g>
            <g fill="#c9d4bd"><rect x="12" y="8" width="16" height="12" rx="2"/><rect x="50" y="12" width="20" height="14" rx="2"/><rect x="112" y="64" width="14" height="10" rx="2"/><rect x="190" y="30" width="22" height="14" rx="2"/><rect x="196" y="56" width="16" height="12" rx="2"/></g>
          </svg>
          <span class="pin" [class.drop]="step() >= 1"><svg viewBox="0 0 24 24"><path d="M12 22s-8-6.6-8-12a8 8 0 1 1 16 0c0 5.4-8 12-8 12z"/><circle cx="12" cy="10" r="3" fill="#fff" stroke="none"/></svg></span>
          <span class="halo" [class.on]="step() >= 1"></span>
        </div>
        <div class="result" [class.show]="step() >= 2">
          <small>{{ T.addr }}</small>
          <b>{{ T.built }}</b>
          <span class="go">{{ T.contact }}</span>
        </div>
      }

      @case ('news') {
        <div class="h big">{{ T.newsH }}</div>
        <div class="sub">{{ T.newsSub }}</div>
        <div class="lbl">{{ T.allArticles }}</div>
        <div class="feed"><div class="track">
          @for (a of news(); track a.slug) {
            <div class="art"><span class="img" [style.background-image]="'url(' + a.img + ')'"></span><b>{{ a.title }}</b><small>{{ a.cat }}</small></div>
          }
        </div></div>
      }
    }
    <div class="tabbar"><span class="cart"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h11L21 8H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg></span></div>
  </div>
</div>`,
  styles: `
    :host{display:block}
    .phone{position:relative;width:290px;height:600px;border-radius:46px;background:#0b0b0b;padding:10px;margin:0 auto;
      box-shadow:0 0 0 1.5px #3a3a3a,0 40px 90px rgba(0,0,0,.55),0 0 70px rgba(166,206,0,.1)}
    .phone::before{content:"";position:absolute;top:19px;left:50%;translate:-50% 0;width:90px;height:24px;border-radius:20px;background:#000;z-index:5}
    .screen{position:relative;height:100%;border-radius:37px;overflow:hidden;background:#F3F4EF;color:#1A1A1A;padding:50px 15px 0;font-family:Inter,sans-serif}
    .status{position:absolute;top:17px;left:24px;right:22px;display:flex;justify-content:space-between;font-size:11.5px}
    .sig{display:flex;gap:2px;align-items:flex-end}.sig i{width:3px;background:#1A1A1A;border-radius:1px}.sig i:nth-child(1){height:5px}.sig i:nth-child(2){height:8px}.sig i:nth-child(3){height:11px}
    .top{display:flex;align-items:center;gap:8px;margin:4px 0 12px}
    .logo{width:28px;height:28px;border-radius:9px;background:#A6CE00;font-weight:800;display:grid;place-items:center;font-size:14px}
    .top b{font-size:15px}
    .menu{margin-left:auto;display:flex;flex-direction:column;gap:3px;padding:8px;border-radius:50%;background:#fff}.menu i{width:12px;height:1.6px;background:#1A1A1A}
    .h{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin:12px 0 8px}
    .h.big{font-size:17px;letter-spacing:-.01em;text-transform:none;line-height:1.2;margin:4px 0 12px}
    .lbl{font-size:11px;font-weight:600;margin:10px 0 6px}
    .sub{font-size:11px;line-height:1.45;color:rgba(26,26,26,.6)}
    .search{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:#fff;border:1.5px solid #A6CE00;font-size:11px;color:rgba(26,26,26,.5);min-height:38px}
    .search svg{width:14px;height:14px;fill:none;stroke:#1A1A1A;stroke-width:2;flex-shrink:0}
    .typed{color:#1A1A1A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .caret{width:1.5px;height:13px;background:#1A1A1A;animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    svg{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}

    /* reports (outlined cards as in the app) */
    .h.tube{display:flex;align-items:center;gap:8px;margin:14px 0 9px}
    .h.tube svg{width:18px;height:18px;stroke:#1A1A1A;stroke-width:1.6}
    .search.plain{color:rgba(26,26,26,.4);font-size:10.5px}
    .rep{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;border-radius:5px;background:#F4F4F2;border:1.5px solid #8a8a8a;margin-bottom:8px;
      opacity:0;translate:0 14px;transition:background .25s,scale .25s,border-color .25s}
    .live .rep{animation:in .6s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--i) * .12s)}
    .rep b{display:block;font-size:11px;margin-bottom:4px}
    .rep small{display:flex;align-items:center;gap:4px;font-size:10px;color:rgba(26,26,26,.75)}
    .rep small svg{width:11px;height:11px;stroke-width:1.8}
    .rep .m{padding-left:15px;margin-top:3px}
    .share{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:9.5px;color:#444}
    .share svg{width:15px;height:15px;stroke-width:1.6}
    .rep.pressed{background:#EEF5D9;border-color:#A6CE00;scale:.97}
    .sheet{position:absolute;left:0;right:0;bottom:0;z-index:4;padding:10px 16px 74px;border-radius:24px 24px 0 0;background:#fff;box-shadow:0 -10px 30px rgba(0,0,0,.15);translate:0 100%;transition:translate .5s cubic-bezier(.2,1,.3,1)}
    .sheet.show{translate:0 0}
    .grab{display:block;width:36px;height:4px;border-radius:2px;background:rgba(0,0,0,.15);margin:0 auto 12px}
    .sheet b{font-size:13px}
    .opts{display:flex;justify-content:space-around;margin-top:14px}
    .opts span{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:10px;font-weight:600;transition:scale .2s}
    .opts span.tap{scale:.9}
    .opts i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center}
    .opts svg{width:20px;height:20px;stroke-width:1.8}
    .o1{background:rgba(0,117,214,.12);color:#0075D6}.o2{background:rgba(166,206,0,.25);color:#4d6100}.o3{background:rgba(227,38,42,.1);color:#c0262a}
    .toast{position:absolute;left:50%;top:52px;z-index:5;display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;background:#1A1A1A;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;translate:-50% -30px;opacity:0;transition:translate .45s cubic-bezier(.2,1.2,.3,1),opacity .3s}
    .toast.show{translate:-50% 0;opacity:1}
    .toast svg{width:13px;height:13px;stroke:#A6CE00;stroke-width:2.4}

    /* order (label above a blue tile with a radio dot, as in the app) */
    .tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px 10px}
    .tile{display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;translate:0 14px}
    .live .tile{animation:in .55s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--i) * .08s)}
    .tile b{font-size:10.5px;text-align:center}
    .ti{position:relative;width:78px;height:64px;background:#4A8DB5;color:#fff;padding:14px 20px;transition:background .3s,color .3s}
    .ck{position:absolute;right:5px;bottom:5px;width:15px;height:15px;border-radius:50%;background:#fff;display:grid;place-items:center;transition:background .25s}
    .ck svg{width:9px;height:9px;stroke:#1A1A1A;stroke-width:2.8;opacity:0;transition:opacity .2s}
    .tile.sel .ti{background:#A6CE00;color:#1A1A1A}
    .tile.sel .ck{animation:pop .35s cubic-bezier(.2,1.6,.4,1)}
    .tile.sel .ck svg{opacity:1}
    @keyframes pop{from{scale:.4}}
    .cta{margin-top:14px;display:flex;justify-content:center;align-items:center;gap:8px;padding:12px;border-radius:6px;background:rgba(26,26,26,.12);color:rgba(26,26,26,.45);font-size:12px;font-weight:700;text-transform:uppercase;transition:background .3s,color .3s}
    .cta.on{background:#A6CE00;color:#fff}
    .cta .n{min-width:20px;height:20px;border-radius:999px;background:#1A1A1A;color:#A6CE00;display:grid;place-items:center;font-size:11px;animation:pop .35s cubic-bezier(.2,1.6,.4,1)}

    /* geo */
    .pills{display:flex;gap:5px;flex-wrap:nowrap;overflow:hidden}
    .pills span{padding:5px 11px;border-radius:999px;background:#A6CE00;color:#fff;font-size:10px;font-weight:600;white-space:nowrap;transition:background .3s,color .3s,box-shadow .3s}
    .pills span.on{background:#8FD0EA;color:#fff}
    .pills .pol{background:rgba(166,206,0,.35)}
    .pills .pol.on{background:#A6CE00;box-shadow:0 0 0 3px rgba(166,206,0,.25);transition-delay:calc(var(--i) * .18s)}
    .geo-gap{height:8px}
    .search{margin-top:10px}
    .map{position:relative;height:118px;margin-top:9px;border-radius:14px;overflow:hidden}
    .map svg{width:100%;height:100%}
    .pin{position:absolute;left:46%;top:16%;width:30px;height:30px;color:#E3262A;opacity:0;translate:0 -40px}
    .pin svg{width:100%;height:100%;fill:#E3262A;stroke:none}
    .pin.drop{animation:drop .6s cubic-bezier(.3,1.5,.5,1) forwards}
    @keyframes drop{to{opacity:1;translate:0 0}}
    .halo{position:absolute;left:calc(46% + 15px);top:calc(16% + 28px);width:10px;height:5px;border-radius:50%;background:rgba(227,38,42,.35);translate:-50% 0;opacity:0}
    .halo.on{animation:halo 1.6s ease-out .4s infinite}
    @keyframes halo{0%{opacity:.8;scale:1}100%{opacity:0;scale:5}}
    .result{position:absolute;left:12px;right:12px;bottom:70px;padding:12px;border-radius:16px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.15);text-align:center;translate:0 30px;opacity:0;transition:translate .5s cubic-bezier(.2,1,.3,1),opacity .35s}
    .result.show{translate:0 0;opacity:1}
    .result small{display:block;font-size:10px;color:rgba(26,26,26,.6)}
    .result b{display:block;font-size:12px;font-weight:800;margin:4px 0 9px;text-transform:uppercase}
    .go{display:block;padding:9px;border-radius:4px;background:#A6CE00;color:#fff;font-size:11px;font-weight:800;text-transform:uppercase}

    /* news */
    .feed{position:relative;height:330px;overflow:hidden;margin-top:4px;mask-image:linear-gradient(180deg,#000 85%,transparent)}
    .track{display:flex;flex-direction:column;gap:10px}
    .live .track{animation:feed 18s linear infinite}
    @keyframes feed{to{translate:0 -50%}}
    .art{border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .art .img{display:block;height:92px;background-size:cover;background-position:center}
    .art b{display:block;padding:9px 11px 2px;font-size:12px;line-height:1.3}
    .art small{display:block;padding:0 11px 10px;font-size:10px;color:#4d6100;font-weight:600}

    .tabbar{position:absolute;left:0;right:0;bottom:0;height:60px;background:#2D9AD7;display:grid;place-items:center;z-index:6}
    .cart{width:46px;height:46px;border-radius:50%;background:#fff;border:3px solid #2D9AD7;margin-top:-30px;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.15)}
    .cart svg{width:22px;height:22px;stroke:#5f9c00;stroke-width:2}
    @keyframes in{to{opacity:1;translate:0 0}}
    @media (prefers-reduced-motion: reduce){.rep,.tile{opacity:1;translate:none;animation:none!important}.live .track{animation:none}}
  `,
})
export class PhoneScreen {
  readonly kind = input<Kind>('reports');
  readonly lang = input('fr');
  private articles = inject(ArticlesService);
  protected live = signal(false);
  protected step = signal(0);
  protected cantons = ['Genève', 'Vaud', 'Valais', 'Fribourg', 'Neuchâtel', 'Jura'];
  private picked = signal<string[]>([]);
  protected typed = signal('');

  protected t = computed(() => this.lang() === 'en'
    ? { searchReports: 'Search a report address', quick: 'Quick access to all your surveys', allReports: 'All my surveys', share: 'Share', shareReport: 'Share the report', email: 'E-mail', link: 'Link', copied: 'Link copied',
        needs: 'What do you need?', orderBtn: 'Order', canton: 'Choose your canton', likely: 'Pollutants likely to be present',
        pollutants: ['Asbestos', 'Lead', 'PCB', 'PAH', 'HBCD'], addr: 'Rue du Rhône 1 · 1204 Geneva', built: 'Built between 1971 and 1980', contact: 'Contact an expert',
        newsH: 'All building-pollutant news', newsSub: 'Stay up to date with the latest news on building pollutants.', allArticles: 'All articles',
        asb: 'Asbestos survey', lead: 'Lead survey', pcb: 'PCB survey', hap: 'PAH survey', hbcd: 'HBCD survey', cecb: 'CECB certificate', bld: 'Building', floor: 'floor(s)', rooms: 'room(s)' }
    : { searchReports: 'Chercher l’adresse du rapport', quick: 'Accédez rapidement à tous vos diagnostics', allReports: 'Tous mes diagnostics', share: 'Partager', shareReport: 'Partager le rapport', email: 'E-mail', link: 'Lien', copied: 'Lien copié',
        needs: 'Quels sont vos besoins ?', orderBtn: 'Commander', canton: 'Choisissez votre canton', likely: 'Polluants susceptibles d’être présents',
        pollutants: ['Amiante', 'Plomb', 'PCB', 'HAP', 'HBCD'], addr: 'Rue du Rhône 1 · 1204 Genève', built: 'Bien construit entre 1971 et 1980', contact: 'Contactez un expert',
        newsH: 'Toute l’actualité des polluants du bâtiment', newsSub: 'Faites le plein d’informations sur les dernières actualités des polluants du bâtiment.', allArticles: 'Tous les articles',
        asb: 'Diagnostic Amiante', lead: 'Diagnostic Plomb', pcb: 'Diagnostic PCB', hap: 'Diagnostic HAP', hbcd: 'Diagnostic HBCD', cecb: 'Certificat CECB', bld: 'Immeuble', floor: 'étage(s)', rooms: 'pièce(s)' });

  protected reports = computed(() => {
    const T = this.t();
    return [
      { t: `${T.asb} – ${T.bld}`, a: 'Rue du Rhône 1', m: `7 ${T.floor}` },
      { t: `${T.asb} – PCB – ${T.bld}`, a: 'Rue du Rhône 1', m: `5 ${T.floor} – 2 ${T.rooms}` },
      { t: `${T.lead} – ${T.bld}`, a: 'Rue du Rhône 1', m: `4 ${T.floor} – 2 ${T.rooms}` },
      { t: `${T.cecb} – ${T.bld}`, a: 'Rue du Rhône 1', m: `3 ${T.floor}` },
    ];
  });
  protected order = computed(() => {
    const T = this.t(), sel = this.picked();
    return [['amiante', T.asb], ['pcb', T.pcb], ['plomb', T.lead], ['hap', T.hap], ['hbcd', T.hbcd], ['cecb', T.cecb]].map(([id, label]) => ({ id, label, sel: sel.includes(id) }));
  });
  protected selCount = computed(() => this.picked().length);
  protected news = computed(() => {
    const l = this.lang() === 'en' ? 'en' : 'fr';
    const list = this.articles.list().filter(a => a.img).slice(0, 5).map(a => ({ slug: a.slug, img: a.img, title: a.title[l], cat: a.cat[l] }));
    return [...list, ...list.map(a => ({ ...a, slug: a.slug + '~' }))]; // doubled for a seamless loop
  });

  constructor() {
    this.articles.load();
    const zone = inject(NgZone), destroy = inject(DestroyRef), host = inject(ElementRef).nativeElement as HTMLElement;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => zone.run(fn), ms));
    destroy.onDestroy(() => timers.forEach(clearTimeout));

    afterNextRender(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        this.live.set(true);
        if (reduce) { this.step.set(2); this.picked.set(['amiante', 'plomb']); this.typed.set(this.t().addr); return; }
        this.loop(at);
      }, { threshold: 0.4 });
      io.observe(host);
    });
  }

  /** One demo cycle per screen, then repeat. */
  private loop(at: (ms: number, fn: () => void) => void) {
    const k = this.kind();
    if (k === 'reports') {
      at(1400, () => this.step.set(1)); at(1900, () => this.step.set(2)); at(3100, () => this.step.set(3)); at(4600, () => this.step.set(0));
      at(6000, () => this.loop(at));
    } else if (k === 'order') {
      this.picked.set([]);
      at(1200, () => this.picked.set(['amiante'])); at(2100, () => this.picked.set(['amiante', 'plomb'])); at(3000, () => this.picked.set(['amiante', 'plomb', 'pcb']));
      at(5600, () => this.loop(at));
    } else if (k === 'geo') {
      this.step.set(0); this.typed.set('');
      const full = this.t().addr.split(' · ')[0];
      [...full].forEach((_, i) => at(500 + i * 55, () => this.typed.set(full.slice(0, i + 1))));
      const t0 = 600 + full.length * 55;
      at(t0, () => this.step.set(1)); at(t0 + 900, () => this.step.set(2));
      at(t0 + 5200, () => this.loop(at));
    }
  }
}
