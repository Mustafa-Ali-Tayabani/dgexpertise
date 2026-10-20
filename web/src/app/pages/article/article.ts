import { Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LangService } from '../../core/lang.service';
import { ArticlesService, formatDate } from '../../core/articles.service';
import { isInternal } from '../../core/links';
import { Header } from '../../shared/header.component';
import { Footer } from '../../shared/footer.component';
import { Cta } from '../../shared/cta.component';
import { DgLink } from '../../shared/dg-link.directive';
import { ImageSlot } from '../../shared/image-slot.component';
import { Band } from '../../shared/sections';
import * as D from '../../data/site-data';

@Component({
  selector: 'dg-article',
  imports: [Header, Footer, Cta, DgLink, ImageSlot, Band],
  template: `
@let a = article();
@let c = C();
<div style="width:100%;margin:0 auto;background:#1A1A1A;color:#fff;font-family:Inter,sans-serif;overflow:hidden">
  <div class="r-hero" style="position:relative;height:680px;overflow:hidden">
    <div style="position:absolute;inset:0"><image-slot [src]="a?.img" [placeholder]="a?.cat?.[lang()] ?? ''" /></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,26,26,0.7) 0%,rgba(26,26,26,0.3) 35%,rgba(26,26,26,0.95) 100%);pointer-events:none"></div>
    <div class="hero-shade"></div>
    <div style="position:absolute;top:0;left:0;right:0;z-index:60"><dg-header active="news" [overlay]="true" /></div>
    <div class="r-hero-body" style="position:absolute;left:var(--gx);right:var(--gx);bottom:72px;display:flex;flex-direction:column;gap:24px;max-width:1100px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:13px;font-weight:500;color:rgba(255,255,255,0.88)">
        <a dgLink="./Actualites.dc.html" class="hv-green" style="color:rgba(255,255,255,0.88)">← {{ L.back }}</a>
        <span class="dg-dot"></span>
        @if (a) {<span style="color:#A6CE00">{{ a.cat[lang()] }}</span><span style="white-space:nowrap"><span style="opacity:.5">·</span> {{ date() }}</span><span style="white-space:nowrap"><span style="opacity:.5">·</span> {{ minutes() }} {{ L.min }}</span>}
      </div>
      <h1 style="margin:0;font-size:clamp(34px,4.444vw,64px);line-height:1.02;letter-spacing:-0.04em;font-weight:600;text-wrap:balance">{{ a?.title?.[lang()] }}</h1>
    </div>
  </div>

  <div class="r-split" style="padding:calc(96px*var(--k)) var(--gx) 0;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:var(--g64);align-items:stretch">
    <article style="max-width:780px;min-width:0">
      @if (lang() === 'en') {<p class="fr-only">This article is available in French only.</p>}
      @if (missing()) {
        <p class="lead">{{ L.missing }}</p>
      } @else {
        <div class="prose" (click)="onProseClick($event)" [innerHTML]="body()"></div>
      }
    </article>
    <aside><div class="side">
      <div class="side-cta" style="padding:32px;border-radius:24px;background:#A6CE00;color:#1A1A1A;display:flex;flex-direction:column;gap:16px">
        <span style="font-weight:700;font-size:26px;letter-spacing:-0.03em;line-height:1.1">{{ c.bandTitle }}</span>
        <p style="margin:0;font-size:15px;line-height:1.55">{{ c.bandSub }}</p>
        <a dgCta [dgLink]="quote" style="align-self:flex-start;background:#1A1A1A;color:#fff">{{ c.ctaQuote }}</a>
      </div>
      <div style="padding:28px;border-radius:24px;border:1px solid rgba(255,255,255,0.14);display:flex;flex-direction:column">
        <span class="dg-label" style="margin-bottom:12px">{{ L.recent }}</span>
        @for (r of recent(); track r.slug) {
          <a [dgLink]="'/actualites/' + r.slug" class="hv-green" style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.12);font-size:15px;line-height:1.35;font-weight:500;color:#fff">{{ r.title[lang()] }}</a>
        }
      </div>
    </div></aside>
  </div>

  @if (more().length) {
    <div style="padding:calc(112px*var(--k)) var(--gx) 0;display:flex;flex-direction:column;gap:40px">
      <div class="r-wrap" style="display:flex;justify-content:space-between;align-items:end;gap:24px"><h2 style="margin:0;font-weight:700;font-size:clamp(28px,3.889vw,56px);line-height:1;letter-spacing:-0.04em">{{ L.moreA }} <span style="color:#A6CE00">{{ L.moreB }}</span></h2><a dgLink="./Actualites.dc.html" class="dg-clink" style="font-size:15px"><i>→</i>{{ L.all }}</a></div>
      <div class="r-g3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        @for (n of more(); track n.slug) {
          <a [dgLink]="'/actualites/' + n.slug" class="hv-lift" style="display:flex;flex-direction:column;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.03);color:#fff;transition:border-color .3s,transform .3s">
            <div style="position:relative;aspect-ratio:16/10;overflow:hidden"><image-slot [src]="n.img" [placeholder]="n.cat[lang()]" /></div>
            <div style="display:flex;flex-direction:column;gap:14px;padding:24px;flex:1">
              <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,0.55)"><span style="color:#A6CE00;font-weight:600">{{ n.cat[lang()] }}</span><span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.3)"></span>{{ fmt(n.date) }}</div>
              <span style="font-weight:600;font-size:20px;letter-spacing:-0.01em;line-height:1.25;text-wrap:pretty">{{ n.title[lang()] }}</span>
            </div>
          </a>
        }
      </div>
    </div>
  }

  <dg-band [title]="c.bandTitle" [sub]="c.bandSub" [btn]="c.bandBtn" [href]="quote" />
  <div style="margin-top:calc(112px*var(--k))"><dg-footer /></div>
</div>`,
  styles: `
    .side{position:sticky;top:96px;display:flex;flex-direction:column;gap:16px}
    @media (max-width:900px){.side{position:static}.side-cta{display:none!important}}
    .prose ::ng-deep .icon-row{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0}
    .prose ::ng-deep img.step-ic{width:96px;height:96px;margin:0;border-radius:18px;background:#fff;padding:6px;object-fit:contain}
    .lead{margin:0 0 32px;font-size:21px;line-height:1.55;font-weight:300;color:rgba(255,255,255,0.9);text-wrap:pretty}
    .fr-only{margin:0 0 24px;display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(166,206,0,0.4);color:#A6CE00;font-size:13px}
    .prose{font-size:17px;line-height:1.75;color:rgba(255,255,255,0.8)}
    .prose ::ng-deep > p:first-child{font-size:21px;line-height:1.55;font-weight:300;color:rgba(255,255,255,0.92);margin-bottom:28px}
    .prose ::ng-deep p{margin:0 0 20px}
    .prose ::ng-deep h2{margin:48px 0 18px;font-size:clamp(24px,2.5vw,34px);line-height:1.15;letter-spacing:-0.03em;font-weight:700;color:#fff}
    .prose ::ng-deep h3{margin:36px 0 14px;font-size:22px;line-height:1.25;letter-spacing:-0.02em;font-weight:600;color:#fff}
    .prose ::ng-deep h4{margin:28px 0 10px;font-size:18px;font-weight:600;color:#fff}
    .prose ::ng-deep strong{color:#fff;font-weight:600}
    .prose ::ng-deep a{color:#A6CE00;text-decoration:underline;text-underline-offset:3px}
    .prose ::ng-deep ul,.prose ::ng-deep ol{margin:0 0 24px;padding-left:22px}
    .prose ::ng-deep li{margin:0 0 8px}
    .prose ::ng-deep li::marker{color:#A6CE00}
    .prose ::ng-deep img{display:block;width:100%;height:auto;margin:32px 0;border-radius:16px;border:1px solid rgba(255,255,255,0.12)}
    .prose ::ng-deep figure{margin:32px 0}
    .prose ::ng-deep figcaption{font-size:13px;color:rgba(255,255,255,0.55);margin-top:-20px}
    .prose ::ng-deep blockquote{margin:32px 0;padding:8px 0 8px 24px;border-left:3px solid #A6CE00;font-size:20px;color:#fff}
    .prose ::ng-deep table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;display:block;overflow-x:auto}
    .prose ::ng-deep th,.prose ::ng-deep td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.14);text-align:left;vertical-align:top}
    .prose ::ng-deep th{color:#fff;font-weight:600}
    .prose ::ng-deep iframe{width:100%;aspect-ratio:16/9;height:auto;border:0;border-radius:16px;margin:24px 0}
  `,
})
export class ArticlePage {
  readonly slug = input.required<string>();
  protected lang = inject(LangService).lang;
  private articles = inject(ArticlesService);
  private router = inject(Router);
  private title = inject(Title);
  protected quote = D.QUOTE_URL;
  protected C = computed(() => D.COMMON[this.lang()]);
  protected body = signal('');
  protected missing = signal(false);

  protected get L() {
    return this.lang() === 'en'
      ? { back: 'All news', min: 'min read', recent: 'Recent articles', moreA: 'More', moreB: 'articles', all: 'All news', missing: 'This article could not be found.' }
      : { back: 'Toutes les actualités', min: 'min de lecture', recent: 'Articles récents', moreA: "D'autres", moreB: 'articles', all: 'Toutes les actualités', missing: "Cet article est introuvable." };
  }

  protected article = computed(() => this.articles.list().find(a => a.slug === this.slug()));
  protected date = computed(() => (this.article() ? formatDate(this.article()!.date, this.lang()) : ''));
  protected minutes = computed(() => Math.max(1, Math.round((this.article()?.words ?? 0) / 220)));
  protected recent = computed(() => this.articles.list().filter(a => a.slug !== this.slug()).slice(0, 5));
  protected more = computed(() => {
    const a = this.article(); if (!a) return [];
    const others = this.articles.list().filter(x => x.slug !== a.slug);
    return [...others.filter(x => x.cat.fr === a.cat.fr), ...others.filter(x => x.cat.fr !== a.cat.fr)].slice(0, 3);
  });
  protected fmt = (d: string) => formatDate(d, this.lang());

  constructor() {
    this.articles.load();
    effect(() => {
      const slug = this.slug();
      this.missing.set(false); this.body.set('');
      this.articles.body(slug).then(b => this.body.set(b)).catch(() => this.missing.set(true));
    });
    effect(() => { const a = this.article(); if (a) this.title.setTitle(`${a.title[this.lang()]} — DG Expertise`); });
  }

  /** Route internal links inside the imported article HTML through the router. */
  protected onProseClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href');
    if (!href || e.metaKey || e.ctrlKey || e.button !== 0) return;
    if (isInternal(href) && !href.startsWith('/assets/')) { e.preventDefault(); this.router.navigateByUrl(href); }
  }
}
