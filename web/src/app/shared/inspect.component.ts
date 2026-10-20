import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { pad } from '../core/links';
import { splitHead } from '../data/site-images';

export interface InspectItem { label: string; desc?: string; photo?: string; x: number; y: number; r: number }

/**
 * Interactive "where is the pollutant" map built on the DG Expertise house illustrations.
 * On first view a scanner line sweeps the plan and each zone is "detected" as it passes;
 * zones (or their rows in the list) can then be hovered/tapped to inspect them.
 */
@Component({
  selector: 'dg-inspect',
  template: `
<div class="wrap r-split" [class.go]="started()" [class.has-active]="active() >= 0">
  <div class="side">
    <h2>{{ h().a }} <span>{{ h().b }}</span></h2>
    @if (sub()) {<p class="sub">{{ sub() }}</p>}
    <div class="readout">
      <span class="pulse"></span>
      <b>{{ pad(found()) }}</b>
      <span>/ {{ pad(items().length) }} · {{ found() < items().length ? scanning() : detected() }}</span>
    </div>
    <ol class="list">
      @for (it of items(); track $index) {
        <li>
          <button [class.on]="active() === $index" [class.found]="$index < found() || done()" (mouseenter)="active.set($index)" (focus)="active.set($index)" (mouseleave)="active.set(-1)" (click)="toggle($index)">
            <span class="n">{{ pad($index + 1) }}</span>
            <span class="l">{{ it.label }}</span>
            <span class="ck"><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg></span>
          </button>
        </li>
      }
    </ol>
  </div>

  <div class="stage" (mouseleave)="active.set(-1)">
    <div class="grid"></div>
    <img class="art" [src]="img()" alt="" loading="lazy" draggable="false">
    <span class="scan"></span>
    @for (it of items(); track $index) {
      <button class="spot" [class.on]="active() === $index" [class.right]="it.x > 55"
              [style.left.%]="it.x" [style.top.%]="it.y" [style.--r]="it.r" [style.--x]="it.x" [style.--i]="$index"
              [attr.aria-label]="it.label" (mouseenter)="active.set($index)" (focus)="active.set($index)" (click)="toggle($index)">
        <i class="ring"></i><i class="ping"></i><b class="num">{{ pad($index + 1) }}</b>
      </button>
    }
    @if (active() >= 0) {
      @let it = items()[active()];
      <div class="card" [class.left]="it.x > 55" [style.left.%]="it.x" [style.top.%]="cardTop(it.y)" [style.--r]="it.r">
        @if (it.photo) {<img [src]="it.photo" alt="">}
        <div class="cb"><small>{{ tag() }} · {{ pad(active() + 1) }}</small><b>{{ it.label }}</b>@if (it.desc) {<p>{{ it.desc }}</p>}</div>
      </div>
    }
  </div>
</div>`,
  styles: `
    :host{display:block}
    .wrap{display:grid;grid-template-columns:340px minmax(0,1fr);gap:var(--g64);align-items:center}
    h2{margin:0;font-weight:700;font-size:clamp(28px,3.056vw,44px);line-height:1.05;letter-spacing:-0.03em;text-wrap:pretty}
    h2 span{color:#A6CE00}
    .sub{margin:16px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.65)}

    .readout{display:flex;align-items:baseline;gap:10px;margin:28px 0 18px;padding:14px 16px;border-radius:14px;border:1px solid rgba(166,206,0,0.3);background:rgba(166,206,0,0.06);font-size:13px;color:rgba(255,255,255,0.7)}
    .readout b{font-size:28px;font-weight:700;color:#A6CE00;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
    .pulse{width:8px;height:8px;border-radius:50%;background:#A6CE00;align-self:center;box-shadow:0 0 0 0 rgba(166,206,0,.6);animation:beat 1.6s infinite}
    @keyframes beat{70%{box-shadow:0 0 0 8px rgba(166,206,0,0)}100%{box-shadow:0 0 0 0 rgba(166,206,0,0)}}

    .list{list-style:none;margin:0;padding:0;border-top:1px solid rgba(255,255,255,0.12)}
    .list button{width:100%;display:grid;grid-template-columns:34px minmax(0,1fr) 20px;gap:10px;align-items:center;padding:11px 8px;border:0;border-bottom:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.45);font:500 15px Inter,sans-serif;text-align:left;cursor:pointer;transition:color .3s,background .3s,padding .3s}
    .list button.found{color:rgba(255,255,255,0.85)}
    .list button.on{color:#fff;background:rgba(166,206,0,0.08);padding-left:14px}
    .n{font-size:12px;font-weight:600;color:rgba(166,206,0,0.5);transition:color .3s}
    .found .n{color:#A6CE00}
    .ck{width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);display:grid;place-items:center;transition:background .3s,border-color .3s}
    .ck svg{width:12px;height:12px;fill:none;stroke:#1A1A1A;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:16;stroke-dashoffset:16;transition:stroke-dashoffset .4s .1s}
    .found .ck{background:#A6CE00;border-color:#A6CE00}
    .found .ck svg{stroke-dashoffset:0}

    /* stage: the line drawing turned into a light-on-dark plan over a blueprint grid */
    .stage{position:relative;aspect-ratio:1024/723;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:radial-gradient(120% 90% at 50% 45%,#232a1c 0%,#1A1A1A 70%)}
    .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:32px 32px;mask-image:radial-gradient(circle at 50% 50%,#000 40%,transparent 85%)}
    .art{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:invert(1) hue-rotate(180deg) brightness(1.15) contrast(1.1);mix-blend-mode:screen;opacity:.9;user-select:none;
      clip-path:inset(0 100% 0 0);transition:opacity .4s}
    .go .art{animation:reveal 2.6s cubic-bezier(.45,0,.55,1) both}
    @keyframes reveal{to{clip-path:inset(0 0 0 0)}}
    .has-active .art{opacity:.45}

    .scan{position:absolute;top:0;bottom:0;left:0;width:2px;background:#A6CE00;box-shadow:0 0 18px 2px rgba(166,206,0,.8);opacity:0;pointer-events:none}
    .scan::before{content:"";position:absolute;top:0;bottom:0;right:2px;width:140px;background:linear-gradient(90deg,transparent,rgba(166,206,0,.14))}
    .go .scan{animation:sweep 2.6s cubic-bezier(.45,0,.55,1) both}
    @keyframes sweep{0%{left:0;opacity:0}6%{opacity:1}94%{opacity:1}100%{left:100%;opacity:0}}

    /* zones: detected as the scanner passes (delay follows x position) */
    .spot{position:absolute;width:calc(var(--r) * 2% * 1.08);aspect-ratio:1;translate:-50% -50%;border:0;padding:0;background:transparent;cursor:pointer;border-radius:50%;opacity:0}
    .go .spot{animation:found .6s cubic-bezier(.2,1.4,.4,1) both;animation-delay:calc(var(--x) * 26ms + 80ms)}
    @keyframes found{from{opacity:0;scale:.4}to{opacity:1;scale:1}}
    .ring{position:absolute;inset:0;border-radius:50%;border:2px solid #A6CE00;background:rgba(166,206,0,.06);transition:background .3s,border-width .3s,scale .45s cubic-bezier(.2,.8,.2,1),opacity .3s}
    .ping{position:absolute;inset:0;border-radius:50%;border:1.5px solid #A6CE00;opacity:0}
    .go .ping{animation:ping 3.6s ease-out infinite;animation-delay:calc(var(--x) * 26ms + 700ms + var(--i) * 300ms)}
    @keyframes ping{0%{opacity:.7;scale:1}35%,100%{opacity:0;scale:1.45}}
    .num{position:absolute;right:-4%;top:-4%;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#A6CE00;color:#1A1A1A;font:700 11px/24px Inter,sans-serif;transition:scale .3s}
    .spot:hover .ring,.spot.on .ring{background:rgba(166,206,0,.18);border-width:3px;scale:1.12}
    .has-active .spot:not(.on) .ring{opacity:.35}
    .has-active .spot:not(.on) .ping{display:none}

    .card{position:absolute;z-index:3;width:min(300px,42%);margin-left:calc(var(--r) * 1% + 14px);transform:translateY(-50%);border-radius:16px;overflow:hidden;background:rgba(26,26,26,.92);backdrop-filter:blur(10px);border:1px solid rgba(166,206,0,.4);box-shadow:0 24px 60px rgba(0,0,0,.5);animation:cardIn .35s cubic-bezier(.2,.8,.2,1) both;pointer-events:none}
    .card.left{margin-left:calc(var(--r) * -1% - 14px);transform:translate(-100%,-50%)}
    @keyframes cardIn{from{opacity:0;scale:.92}}
    .card img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#fff}
    .cb{padding:14px 16px;display:flex;flex-direction:column;gap:4px}
    .cb small{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#A6CE00}
    .cb b{font-size:17px;font-weight:600;letter-spacing:-.01em}
    .cb p{margin:4px 0 0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.7)}

    @media (max-width:900px){
      .list{display:flex;flex-wrap:wrap;gap:6px;border:0}
      .list li{display:contents}
      .list button{width:auto;grid-template-columns:auto auto;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font-size:13px}
      .list .ck{display:none}
      .readout{margin:20px 0 14px}
      .card{width:min(240px,60%)}
      .num{min-width:18px;height:18px;font-size:9px;line-height:18px;padding:0 4px}
    }
    @media (prefers-reduced-motion: reduce){
      .art,.go .art{clip-path:none;animation:none}.go .scan{display:none}.go .spot{animation:none;opacity:1}.go .ping{animation:none}
    }
  `,
})
export class Inspect {
  readonly title = input('');
  readonly sub = input('');
  readonly img = input.required<string>();
  readonly items = input<InspectItem[]>([]);
  readonly tag = input('');
  readonly lang = input('fr');

  protected h = computed(() => splitHead(this.title()));
  protected pad = pad;
  protected active = signal(-1);
  protected started = signal(false);
  protected found = signal(0);
  protected done = signal(false);
  protected scanning = computed(() => (this.lang() === 'en' ? 'scanning…' : 'analyse en cours…'));
  protected detected = computed(() => (this.lang() === 'en' ? 'risk zones detected' : 'zones à risque détectées'));

  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const timers: ReturnType<typeof setTimeout>[] = [];
    inject(DestroyRef).onDestroy(() => timers.forEach(clearTimeout));
    afterNextRender(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        this.started.set(true);
        // count detections in the same order/timing as the CSS (delay = x * 26ms)
        const order = this.items().map((it, i) => ({ i, t: reduce ? 0 : it.x * 26 + 380 })).sort((a, b) => a.t - b.t);
        order.forEach((o, k) => timers.push(setTimeout(() => this.found.set(k + 1), o.t)));
        timers.push(setTimeout(() => this.done.set(true), reduce ? 0 : 2900));
      }, { threshold: 0.35 });
      io.observe(el);
    });
  }

  /** Keep the info card inside the plan vertically. */
  protected cardTop(y: number) { return Math.min(80, Math.max(20, y)); }

  protected toggle(i: number) { this.active.update(a => (a === i ? -1 : i)); }
}
