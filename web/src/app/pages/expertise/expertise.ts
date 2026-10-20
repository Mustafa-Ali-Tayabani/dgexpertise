import { Component, computed, inject, signal } from '@angular/core';
import { LangService } from '../../core/lang.service';
import { initials, pad } from '../../core/links';
import { Header } from '../../shared/header.component';
import { Footer } from '../../shared/footer.component';
import { Cta } from '../../shared/cta.component';
import { DgLink } from '../../shared/dg-link.directive';
import { ImageSlot } from '../../shared/image-slot.component';
import { Band, Hero, Steps, Trust } from '../../shared/sections';
import * as D from '../../data/site-data';
import * as M from '../../data/site-images';
import { ReviewsService } from '../../core/reviews.service';
import { Timeline } from '../../shared/timeline.component';
import { DIAGNOSTIC_STEPS } from '../../data/process-steps';

@Component({
  selector: 'dg-expertise',
  imports: [Header, Footer, Cta, DgLink, ImageSlot, Band, Hero, Steps, Trust, Timeline],
  template: `
@let c = C();
@let e = E();
<div style="width:100%;margin:0 auto;background:#1A1A1A;color:#fff;font-family:Inter,sans-serif;overflow:hidden">
  <dg-hero [height]="820">
    <image-slot slot="bg" src="/assets/hero.jpg" placeholder="Expert DG Expertise sur site" />
    <dg-header slot="header" active="expertise" [overlay]="true" />
    <div class="r-hero-body" style="position:absolute;left:var(--gx);right:var(--gx);bottom:72px;display:flex;flex-direction:column;gap:28px;pointer-events:none">
      <div style="display:flex;align-items:center;gap:12px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.88)"><span class="dg-dot"></span>{{ e.eyebrow }}</div>
      <h1 style="margin:0;font-size:clamp(44px,7.222vw,104px);line-height:0.92;letter-spacing:-0.045em;font-weight:300;max-width:1180px;text-wrap:pretty">{{ title().a }} <span style="font-weight:700;color:#A6CE00">{{ title().b }}</span><span style="font-weight:700;color:#0075D6">{{ title().mark }}</span></h1>
      <p style="margin:0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.85);max-width:680px;text-wrap:pretty">{{ e.lead }}</p>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;pointer-events:auto">
        <a dgCta [dgLink]="quote">{{ c.ctaQuote }}</a>
        <a href="tel:+41225359364" class="dg-ghost"><span class="dg-ping"></span>{{ c.ctaCall }}</a>
      </div>
    </div>
  </dg-hero>

  <dg-trust [title]="c.trustTitle" [logos]="logos" />

  <!-- services grid -->
  <div style="padding:calc(112px*var(--k)) var(--gx) 0;display:flex;flex-direction:column;gap:56px">
    <div class="r-wrap" style="display:flex;justify-content:space-between;align-items:end;gap:32px">
      <div style="display:flex;flex-direction:column;gap:20px"><div class="dg-label">{{ e.servicesSub }}</div><h2 style="margin:0;font-weight:700;font-size:clamp(28px,3.889vw,56px);line-height:1;letter-spacing:-0.04em">{{ svcH().a }} <span style="color:#A6CE00">{{ svcH().b }}</span></h2></div>
      <div class="r-wrap" style="display:flex;gap:8px">
        @for (f of filters(); track f.key) {
          <button (click)="filter.set(f.key)" class="filter" [style.background]="filter() === f.key ? '#fff' : 'transparent'" [style.color]="filter() === f.key ? '#1A1A1A' : 'rgba(255,255,255,0.75)'">{{ f.label }}</button>
        }
      </div>
    </div>
    <div class="r-g2" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
      @for (sv of services(); track sv.file) {
        <a [dgLink]="sv.file" class="hv-lift r-card" style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:28px;padding:28px;border-radius:20px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:#fff;transition:border-color .3s,transform .3s">
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,0.5)"><span style="color:#A6CE00;font-weight:600">{{ sv.n }}</span><span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.3)"></span>{{ sv.group }}</div>
            <span style="font-weight:600;font-size:clamp(22px,1.806vw,26px);letter-spacing:-0.02em;line-height:1.1">{{ sv.title }}</span>
            <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);flex:1;text-wrap:pretty">{{ sv.short }}</p>
            <span style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500"><span style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);display:grid;place-items:center;font-size:12px">→</span>{{ c.learnMore }}</span>
          </div>
          <div style="position:relative;border-radius:12px;overflow:hidden;min-height:200px"><image-slot [src]="sv.src" [placeholder]="sv.img" /></div>
        </a>
      }
    </div>
  </div>

  <dg-steps style="display:block;margin-top:calc(112px*var(--k))" [sub]="c.stepsSub" [title]="c.stepsTitle" [steps]="c.steps" />

  <div style="padding:calc(112px*var(--k)) var(--gx) 0"><dg-timeline [title]="e.flowTitle" [sub]="e.flowSub" [steps]="flowSteps()" /></div>

  <!-- reviews (live 5★ Google reviews when the feed is configured) -->
  <div style="padding:calc(112px*var(--k)) var(--gx) 0;display:flex;flex-direction:column;gap:48px">
    <div class="r-wrap" style="display:flex;justify-content:space-between;align-items:end;gap:32px"><h2 style="margin:0;font-weight:700;font-size:clamp(28px,3.889vw,56px);line-height:1;letter-spacing:-0.04em">{{ revH().a }} <span style="color:#A6CE00">{{ revH().b }}</span></h2><a [href]="rv.url" target="_blank" rel="noopener" class="hv-green" style="font-size:14px;color:rgba(255,255,255,0.7);display:flex;align-items:center;gap:10px"><span style="color:#FBBC05;letter-spacing:1px">★★★★★</span>{{ reviewsMeta() }} ↗</a></div>
    <div class="r-g3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      @for (r of shownReviews(); track $index) {
        <div style="display:flex;flex-direction:column;gap:20px;padding:28px;border-radius:20px;background:#fff;color:#1A1A1A">
          <span style="color:#A6CE00;letter-spacing:2px;font-size:14px">★★★★★</span>
          <p style="margin:0;font-size:16px;line-height:1.55;flex:1;text-wrap:pretty">“{{ r.text }}”</p>
          <div style="display:flex;align-items:center;gap:10px;border-top:1px solid rgba(26,26,26,0.1);padding-top:16px">
            @if (r.photo) {<img [src]="r.photo" alt="" referrerpolicy="no-referrer" style="width:32px;height:32px;border-radius:50%;object-fit:cover">} @else {<span style="width:32px;height:32px;border-radius:50%;background:#1A1A1A;color:#A6CE00;display:grid;place-items:center;font-size:12px;font-weight:600">{{ r.initials }}</span>}
            <div><div style="font-size:13px;font-weight:600">{{ r.author }}</div><div style="font-size:11px;color:rgba(26,26,26,0.55)">{{ r.meta }}</div></div>
          </div>
        </div>
      }
    </div>
    @if (allReviews().length > 6) {
      <button class="more" (click)="showAll.set(!showAll())">{{ showAll() ? (lang() === 'fr' ? 'Voir moins' : 'Show less') : (lang() === 'fr' ? 'Voir tous les avis 5 étoiles (' + allReviews().length + ')' : 'See all 5-star reviews (' + allReviews().length + ')') }}</button>
    }
  </div>

  <dg-band [title]="c.bandTitle" [sub]="c.bandSub" [btn]="c.bandBtn" [href]="quote" />

  <div style="margin-top:calc(112px*var(--k))"><dg-footer /></div>
</div>`,
  styles: `.more{align-self:center;padding:14px 26px;border-radius:999px;border:1px solid rgba(255,255,255,0.3);background:transparent;color:#fff;font:500 15px Inter,sans-serif;cursor:pointer;transition:border-color .25s,background .25s}.more:hover{border-color:#A6CE00;background:rgba(166,206,0,0.08)}
  .filter{padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;font-family:Inter,sans-serif;font-size:13px;transition:background .25s,color .25s}`,
})
export class Expertise {
  constructor() { inject(ReviewsService).load(); }
  protected lang = inject(LangService).lang;
  protected C = computed(() => D.COMMON[this.lang()]);
  protected E = computed(() => D.EXPERTISE[this.lang()]);
  protected quote = D.QUOTE_URL;
  protected logos = M.LOGOS;
  protected flowSteps = computed(() => DIAGNOSTIC_STEPS[this.lang()]);
  protected filter = signal('all');

  protected title = computed(() => M.splitTitle(this.E().title));
  protected svcH = computed(() => M.splitHead(this.E().servicesTitle));
  protected revH = computed(() => M.splitHead(this.C().reviewsTitle));

  protected filters = computed(() => {
    const c = this.C(), fr = this.lang() === 'fr';
    return [['all', fr ? 'Tous' : 'All'], ['pollutants', c.groups.pollutants], ['site', c.groups.site], ['energy', c.groups.energy]]
      .map(([key, label]) => ({ key, label }));
  });

  protected services = computed(() => {
    const lang = this.lang(), c = this.C(), f = this.filter();
    return D.SERVICE_LIST.filter((s: any) => f === 'all' || s.group === f).map((s: any, i: number) => {
      const sv = D.SERVICES[s.slug];
      return { file: s.file, n: pad(i + 1), group: c.groups[s.group], title: sv.nav[lang], short: sv[lang].short, img: sv.img[lang], src: (M.SERVICE_IMG[s.slug] || {}).card || '' };
    });
  });

  protected rv = inject(ReviewsService);
  protected showAll = signal(false);
  protected allReviews = computed(() => {
    const lang = this.lang();
    return this.rv.reviews().map(r => {
      const t = this.rv.textFor(r, lang);
      return { author: r.author, photo: r.photo, text: t.text, initials: initials(r.author),
        meta: ['Google', this.rv.ago(r, lang), t.translated ? (lang === 'en' ? 'translated from French' : '') : ''].filter(Boolean).join(' · ') };
    });
  });
  protected shownReviews = computed(() => this.showAll() ? this.allReviews() : this.allReviews().slice(0, 6));
  protected reviewsMeta = computed(() => this.lang() === 'en'
    ? `${this.rv.rating().toFixed(1)}/5 on Google · ${this.rv.count()} reviews`
    : `${this.rv.rating().toFixed(1).replace('.', ',')}/5 sur Google · ${this.rv.count()} avis`);
}
