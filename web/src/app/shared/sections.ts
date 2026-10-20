import { Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DgLink } from './dg-link.directive';
import { pad } from '../core/links';
import { splitHead } from '../data/site-images';

/** White "how it works" band with four numbered steps. */
@Component({
  selector: 'dg-steps',
  template: `
<div style="background:#fff;color:#1A1A1A;padding:calc(112px*var(--k)) var(--gx);display:flex;flex-direction:column;gap:var(--g64)">
  @if (half()) {
    <div class="r-split" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--g64);align-items:end">
      <ng-container *ngTemplateOutlet="head" />
    </div>
  } @else {
    <ng-container *ngTemplateOutlet="head" />
  }
  <ng-template #head>
    <div style="display:flex;flex-direction:column;gap:20px"><div style="font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgba(26,26,26,0.5)">{{ sub() }}</div><h2 style="margin:0;font-weight:700;font-size:clamp(28px,3.889vw,56px);line-height:1;letter-spacing:-0.04em">{{ h().a }} <span style="color:#0075D6">{{ h().b }}</span></h2></div>
  </ng-template>
  <div class="r-g4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;border-top:1px solid #1A1A1A">
    @for (st of steps(); track $index) {
      <div style="padding-top:28px;display:flex;flex-direction:column;gap:16px"><span style="font-weight:700;font-size:clamp(28px,3.333vw,48px);letter-spacing:-0.04em;color:#0075D6;line-height:1">{{ pad($index + 1) }}</span><span style="font-weight:600;font-size:20px;letter-spacing:-0.01em">{{ st.h }}</span><p style="margin:0;font-size:15px;line-height:1.55;color:rgba(26,26,26,0.7);text-wrap:pretty">{{ st.p }}</p></div>
    }
  </div>
  <ng-content />
</div>`,
  imports: [NgTemplateOutlet],
})
export class Steps {
  readonly sub = input('');
  readonly title = input('');
  readonly steps = input<any[]>([]);
  readonly half = input(false);
  protected h = computed(() => splitHead(this.title()));
  protected pad = pad;
}

/** Row of three numbered promises between thin rules. */
@Component({
  selector: 'dg-promises',
  template: `
<div class="r-g3" style="display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(255,255,255,0.12);border-bottom:1px solid rgba(255,255,255,0.12)">
  @for (p of items(); track $index) {
    <div style="display:flex;align-items:center;gap:16px;padding:28px 24px 28px 0;font-size:15px;color:rgba(255,255,255,0.85)"><span style="width:36px;height:36px;border-radius:50%;border:1px solid rgba(166,206,0,0.5);display:grid;place-items:center;color:#A6CE00;font-size:13px;flex-shrink:0">{{ pad($index + 1) }}</span>{{ p }}</div>
  }
</div>`,
  host: { style: 'display:block' },
})
export class Promises {
  readonly items = input<string[]>([]);
  protected pad = pad;
}

/** Dark band with a scrolling strip of client logos on white chips. */
@Component({
  selector: 'dg-trust',
  template: `
<div class="r-trust" style="border-top:1px solid rgba(255,255,255,0.12);border-bottom:1px solid rgba(255,255,255,0.12);padding:24px 0;display:flex;align-items:center;gap:48px;overflow:hidden">
  <span style="padding-left:var(--gx);font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.5);white-space:nowrap;flex-shrink:0">{{ title() }}</span>
  <div style="overflow:hidden;flex:1;mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)">
    <div style="display:flex;gap:16px;width:max-content;animation:dgMarquee 40s linear infinite">
      @for (lg of all(); track $index) {<span style="height:56px;padding:0 22px;border-radius:12px;background:#fff;display:grid;place-items:center;flex-shrink:0"><img [src]="lg" alt="" style="height:34px;width:auto;max-width:150px;object-fit:contain"></span>}
    </div>
  </div>
</div>`,
  host: { style: 'display:block' },
})
export class Trust {
  readonly title = input('');
  readonly logos = input<string[]>([]);
  protected all = computed(() => [...this.logos(), ...this.logos()]);
}

/** Accordion FAQ. `sticky` = the service-page variant (sticky heading, tighter tracking). */
@Component({
  selector: 'dg-faq',
  template: `
<div class="r-split" style="display:grid;grid-template-columns:380px minmax(0,1fr);gap:var(--g64);align-items:start">
  <h2 class="r-static" style="margin:0;font-weight:700;font-size:clamp(28px,3.056vw,44px);line-height:1.05;letter-spacing:-0.03em;text-wrap:pretty" [style.position]="sticky() ? 'sticky' : null" [style.top]="sticky() ? '32px' : null">{{ h().a }} <span style="color:#A6CE00">{{ h().b }}</span></h2>
  <div style="display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,0.15)">
    @for (q of items(); track $index) {
      @let on = !!open()[$index];
      <div style="border-bottom:1px solid rgba(255,255,255,0.15)">
        <button (click)="toggle($index)" style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 0;background:none;border:0;color:#fff;font-family:Inter,sans-serif;font-size:19px;font-weight:500;text-align:left;cursor:pointer" [style.letter-spacing]="sticky() ? '-0.01em' : null">{{ q.q }}<span style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);display:grid;place-items:center;font-size:16px;flex-shrink:0;transition:transform .3s,background .3s" [style.transform]="on ? 'rotate(45deg)' : 'rotate(0deg)'" [style.background]="on ? '#A6CE00' : 'transparent'" [style.color]="on ? '#1A1A1A' : '#fff'">+</span></button>
        @if (on) {<p style="margin:0;padding:0 var(--gx) 24px 0;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.75)" [style.text-wrap]="sticky() ? 'pretty' : null">{{ q.a }}</p>}
      </div>
    }
  </div>
</div>`,
  host: { style: 'display:block' },
})
export class Faq {
  readonly title = input('');
  readonly items = input<any[]>([]);
  readonly sticky = input(false);
  protected open = signal<Record<number, boolean>>({});
  protected h = computed(() => splitHead(this.title()));
  protected toggle(i: number) { this.open.update(o => ({ ...o, [i]: !o[i] })); }
}

/** Green rounded call-to-action band. */
@Component({
  selector: 'dg-band',
  imports: [DgLink],
  template: `
<div class="r-split" style="padding:var(--gx);border-radius:24px;background:#A6CE00;color:#1A1A1A;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:center">
  <div style="display:flex;flex-direction:column;gap:12px"><h2 style="margin:0;font-weight:700;line-height:1;letter-spacing:-0.04em" [style.font-size]="'clamp(30px,' + (size() / 14.4) + 'vw,' + size() + 'px)'" [style.text-wrap]="size() === 52 ? 'pretty' : null">{{ title() }}</h2><p style="margin:0;font-size:17px;opacity:0.8">{{ sub() }}</p></div>
  @if (meta()) {
    <div class="r-start" style="display:flex;flex-direction:column;gap:12px;align-items:flex-end">
      <a [dgLink]="href()" class="dg-dark-pill">{{ btn() }}<i>→</i></a>
      <span style="font-size:13px;display:flex;align-items:center;gap:8px"><span style="letter-spacing:1px">★★★★★</span>{{ meta() }}</span>
    </div>
  } @else {
    <a [dgLink]="href()" class="dg-dark-pill" [style.white-space]="size() === 52 ? 'nowrap' : null">{{ btn() }}<i>→</i></a>
  }
</div>`,
  host: { style: 'display:block;margin:calc(112px*var(--k)) var(--gx) 0' },
})
export class Band {
  readonly title = input('');
  readonly sub = input('');
  readonly btn = input('');
  readonly href = input<string>('#');
  readonly meta = input('');
  readonly size = input(56);
}

/** Full-bleed page hero: image, gradient, overlaid header, eyebrow + split title + lead. */
@Component({
  selector: 'dg-hero',
  imports: [],
  template: `
<div class="r-hero" style="position:relative;overflow:hidden" [style.height.px]="height()">
  <div style="position:absolute;inset:0"><ng-content select="[slot=bg]" /></div>
  <div style="position:absolute;inset:0;pointer-events:none" [style.background]="'linear-gradient(180deg,rgba(26,26,26,0.62) 0%,rgba(26,26,26,0.12) ' + mid() + '%,rgba(26,26,26,' + end() + ') 100%)'"></div>
  <div class="hero-shade"></div>
  <div style="position:absolute;top:0;left:0;right:0;z-index:60"><ng-content select="[slot=header]" /></div>
  <ng-content />
</div>`,
  host: { style: 'display:block' },
})
export class Hero {
  readonly height = input(820);
  readonly mid = input(32);
  readonly end = input(0.92);
}
