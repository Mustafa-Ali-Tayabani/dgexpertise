import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { pad } from '../core/links';
import { splitHead } from '../data/site-images';
import { Icon } from './icons';

export interface TimelineStep { icon: string; t: string; p: string }

/**
 * Scroll-driven process timeline (replaces the old process screenshots).
 * As the section scrolls through the viewport a green line fills the track; each step
 * activates in turn — number fills, icon draws in, text rises. Horizontal zig-zag on
 * desktop (like the original diagrams), vertical on small screens.
 */
@Component({
  selector: 'dg-timeline',
  imports: [Icon],
  template: `
<div class="head">
  <h2>{{ h().a }} <span>{{ h().b }}</span></h2>
  @if (sub()) {<p>{{ sub() }}</p>}
</div>
<div class="tl" [style.--n]="steps().length" [style.--p]="progress()">
  <div class="track"><i class="fill"></i></div>
  @for (s of steps(); track $index; let i = $index; let odd = $odd) {
    <div class="step" [class.up]="odd" [class.on]="i < active()" [class.blue]="!odd" [style.--i]="i">
      <div class="tile">
        @if (i < active()) {<dg-icon [name]="s.icon" [draw]="true" />} @else {<dg-icon [name]="s.icon" />}
      </div>
      <i class="stem"></i>
      <div class="node"><b>{{ pad(i + 1) }}</b></div>
      <div class="txt"><h3>{{ s.t }}</h3><p>{{ s.p }}</p></div>
    </div>
  }
</div>`,
  styles: `
    :host{display:block}
    .head{display:flex;justify-content:space-between;align-items:end;gap:32px;flex-wrap:wrap;margin-bottom:40px}
    h2{margin:0;font-weight:700;font-size:clamp(28px,3.056vw,44px);line-height:1.05;letter-spacing:-0.03em;max-width:760px;text-wrap:pretty}
    h2 span{color:#A6CE00}
    .head p{margin:0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.65);max-width:420px}

    /* ── desktop: horizontal zig-zag ── */
    .tl{position:relative;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:0 20px;padding:0 4px}
    .track{position:absolute;left:0;right:0;top:50%;height:3px;margin-top:-1.5px;border-radius:3px;background:rgba(255,255,255,0.12)}
    .fill{position:absolute;inset:0;border-radius:3px;background:linear-gradient(90deg,#0075D6,#A6CE00);transform-origin:0 50%;transform:scaleX(var(--p));box-shadow:0 0 16px rgba(166,206,0,.45)}
    .step{display:grid;grid-template-rows:200px 34px 64px 34px 200px;justify-items:center;text-align:center}
    .tile{grid-row:1;align-self:end;width:64px;height:64px;padding:15px;border-radius:18px;border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.03);
      transition:background .5s,color .5s,border-color .5s,transform .6s cubic-bezier(.2,1.4,.4,1),box-shadow .5s}
    .stem{grid-row:2;width:2px;height:100%;background:rgba(255,255,255,0.14);position:relative;overflow:hidden}
    .stem::after{content:"";position:absolute;inset:0;background:currentColor;transform:scaleY(0);transform-origin:top;transition:transform .5s .1s}
    .node{grid-row:3;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;border:3px solid rgba(255,255,255,0.18);background:#1A1A1A;position:relative;z-index:1;
      transition:background .5s,border-color .5s,transform .6s cubic-bezier(.2,1.4,.4,1),box-shadow .5s}
    .node b{font-size:20px;font-weight:700;color:rgba(255,255,255,0.55);transition:color .4s;font-variant-numeric:tabular-nums}
    .txt{grid-row:5;align-self:start;padding-top:6px;max-width:220px;opacity:.55;translate:0 14px;transition:opacity .6s,translate .7s cubic-bezier(.16,1,.3,1)}
    .txt h3{margin:0 0 8px;font-size:15px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
    .txt p{margin:0;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.72);text-wrap:pretty}
    /* odd steps: text above, icon below (as in the original diagrams) */
    .step.up .txt{grid-row:1;align-self:end;padding:0 0 6px}
    .step.up .tile{grid-row:5;align-self:start}
    .step.up .stem{grid-row:4}
    .step.up .stem::after{transform-origin:bottom}
    .step:not(.up) .stem{grid-row:2}

    .step{--c:#A6CE00}
    .step.blue{--c:#2F8FE6}
    .step.on .tile{background:var(--c);border-color:var(--c);color:#1A1A1A;transform:translateY(-4px);box-shadow:0 14px 34px color-mix(in srgb,var(--c) 35%,transparent)}
    .step.up.on .tile{transform:translateY(4px)}
    .step.on .stem{color:var(--c)}
    .step.on .stem::after{transform:scaleY(1)}
    .step.on .node{background:var(--c);border-color:#1A1A1A;transform:scale(1.08);box-shadow:0 0 0 6px color-mix(in srgb,var(--c) 22%,transparent)}
    .step.on .node b{color:#1A1A1A}
    .step.on .txt{opacity:1;translate:0 0}
    .step.on h3{color:var(--c)}
    .step:hover .node{transform:scale(1.14)}

    /* ── small screens: vertical ── */
    @media (max-width:1100px){
      .tl{grid-template-columns:1fr;gap:0;padding-left:0}
      .track{left:31px;right:auto;top:0;bottom:0;width:3px;height:auto;margin:0}
      .fill{transform-origin:50% 0;transform:scaleY(var(--p));background:linear-gradient(180deg,#0075D6,#A6CE00)}
      .step,.step.up{grid-template-rows:none;grid-template-columns:64px minmax(0,1fr) 48px;gap:0 18px;align-items:center;justify-items:start;text-align:left;padding:14px 0}
      .step .node,.step.up .node{grid-row:1;grid-column:1}
      .step .txt,.step.up .txt{grid-row:1;grid-column:2;max-width:none;padding:0;align-self:center}
      .step .tile,.step.up .tile{grid-row:1;grid-column:3;width:48px;height:48px;padding:11px;border-radius:14px;align-self:center;transform:none!important}
      .stem{display:none}
    }
    @media (prefers-reduced-motion: reduce){
      .tile,.node,.txt,.stem::after{transition:none}
    }
  `,
})
export class Timeline {
  readonly title = input('');
  readonly sub = input('');
  readonly steps = input<TimelineStep[]>([]);
  protected h = computed(() => splitHead(this.title()));
  protected pad = pad;
  /** 0..1 — how far the track is filled. */
  protected progress = signal(0);
  /** Number of activated steps. */
  protected active = computed(() => {
    const n = this.steps().length;
    return Math.min(n, Math.floor(this.progress() * n + 0.35));
  });

  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.progress.set(1); return; }
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = el.querySelector('.tl')!.getBoundingClientRect(), vh = innerHeight;
        const vertical = matchMedia('(max-width:1100px)').matches;
        const p = vertical
          // vertical: the fill follows a reading line at 60% of the screen height
          ? (vh * 0.6 - r.top) / r.height
          // horizontal: starts as the timeline enters, complete once its track reaches mid-screen
          : (vh * 0.9 - r.top) / (vh * 0.35 + r.height * 0.4);
        const v = Math.max(0, Math.min(1, p));
        if (v > this.progress() + 0.002) zone.run(() => this.progress.set(v)); // only moves forward: once seen, steps stay lit
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      zone.runOutsideAngular(() => { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); });
      update();
      destroy.onDestroy(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); });
    });
  }
}
